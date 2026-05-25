import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthFromRequest } from "@/lib/auth";
import { usersDb, sessionsDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";
import type { UserRole } from "@/types/cms";

type Params = { params: Promise<{ company: string; id: string }> };

const ALLOWED_ROLES: UserRole[] = ["admin", "editor", "sales"];

/**
 * PUT /api/admin/[company]/users/[id]
 *
 * Admin can update any user: name, role, isActive.
 * Any user can update their own email (requires currentPassword for verification).
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { company, id } = await params;
  const isSelf = auth.userId === id;

  if (!isAdmin(auth.role) && !isSelf) return forbidden();

  const target = usersDb.getById(company, id);
  if (!target) return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updates: Partial<typeof target> = {};

  // ── Email change (self only, requires password) ──────────────────────────
  if (body.email !== undefined && isSelf) {
    const newEmail = sanitizeEmail(body.email);
    if (!newEmail) return NextResponse.json({ success: false, error: "Invalid email." }, { status: 400 });

    const currentPassword = sanitizeText(body.currentPassword, 128);
    if (!currentPassword) {
      return NextResponse.json({ success: false, error: "Current password is required to change email." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, target.passwordHash);
    if (!valid) return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 400 });

    const existing = usersDb.getByEmail(company, newEmail);
    if (existing && existing.id !== id) {
      return NextResponse.json({ success: false, error: "Email is already in use." }, { status: 409 });
    }
    updates.email = newEmail;
  }

  // ── Admin-only fields ────────────────────────────────────────────────────
  if (isAdmin(auth.role)) {
    if (body.name !== undefined) {
      const name = sanitizeText(body.name, 64);
      if (name) updates.name = name;
    }
    if (body.role !== undefined && ALLOWED_ROLES.includes(body.role)) {
      // Prevent removing the last admin
      if (target.role === "admin" && body.role !== "admin") {
        const admins = usersDb.getAll(company).filter((u) => isAdmin(u.role));
        if (admins.length <= 1) {
          return NextResponse.json({ success: false, error: "Cannot demote the only admin." }, { status: 400 });
        }
      }
      updates.role = body.role as UserRole;
    }
    if (typeof body.isActive === "boolean") {
      if (!body.isActive && isSelf) {
        return NextResponse.json({ success: false, error: "Cannot deactivate your own account." }, { status: 400 });
      }
      updates.isActive = body.isActive;
      // Invalidate session if deactivating
      if (!body.isActive) sessionsDb.invalidate(company, id);
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "No valid fields to update." }, { status: 400 });
  }

  const { passwordHash: _, ...updated } = usersDb.update(company, id, updates)!;
  return NextResponse.json({ success: true, data: updated, message: "User updated." });
}

/**
 * DELETE /api/admin/[company]/users/[id]  — admin only
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();

  const { company, id } = await params;
  if (auth.userId === id) {
    return NextResponse.json({ success: false, error: "Cannot delete your own account." }, { status: 400 });
  }

  const target = usersDb.getById(company, id);
  if (!target) return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });

  // Prevent deleting the last admin
  if (isAdmin(target.role)) {
    const admins = usersDb.getAll(company).filter((u) => isAdmin(u.role));
    if (admins.length <= 1) {
      return NextResponse.json({ success: false, error: "Cannot delete the only admin account." }, { status: 400 });
    }
  }

  sessionsDb.invalidate(company, id);
  usersDb.delete(company, id);
  return NextResponse.json({ success: true, message: "User deleted." });
}
