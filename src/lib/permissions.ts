import type { UserRole } from "@/types/cms";
import { NextResponse } from "next/server";

/** True for admin and super_admin — full system access */
export const isAdmin = (role: UserRole) =>
  role === "admin" || role === "super_admin";

/** Blog: admin, editor, sales can create/edit */
export const canWriteBlog = (role: UserRole) =>
  role === "admin" || role === "super_admin" || role === "editor" || role === "sales";

/** Programmes: admin and editor can create/edit */
export const canWriteProgramme = (role: UserRole) =>
  role === "admin" || role === "super_admin" || role === "editor";

/** Only admin can delete published content (programmes, blog, events, testimonials) */
export const canDeletePublished = (role: UserRole) =>
  role === "admin" || role === "super_admin";

/** Editor and above can delete drafts */
export const canDeleteDraft = (role: UserRole) =>
  role === "admin" || role === "super_admin" || role === "editor";

/** System settings, navigation, theme, users — admin only */
export const canAccessAdmin = (role: UserRole) =>
  role === "admin" || role === "super_admin";

export const forbidden = (msg = "Insufficient permissions.") =>
  NextResponse.json({ success: false, error: msg }, { status: 403 });
