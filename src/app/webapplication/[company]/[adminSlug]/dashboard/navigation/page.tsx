"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { Plus, Trash2 } from "lucide-react";
import type { NavigationSettings, NavItem } from "@/types/cms";

function NavItemRow({ item, onUpdate, onRemove }: { item: NavItem; onUpdate: (v: NavItem) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex-1 grid sm:grid-cols-2 gap-2">
        <Input value={item.label} placeholder="Label" onChange={(e) => onUpdate({ ...item, label: e.target.value })} />
        <Input value={item.href} placeholder="/path or https://..." onChange={(e) => onUpdate({ ...item, href: e.target.value })} />
      </div>
      <Toggle checked={item.isExternal} onChange={(v) => onUpdate({ ...item, isExternal: v })} label="Ext" size="sm" />
      <button onClick={onRemove} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function NavList({ items, onChange, label }: { items: NavItem[]; onChange: (v: NavItem[]) => void; label: string }) {
  function update(i: number, v: NavItem) { const n = [...items]; n[i] = v; onChange(n); }
  function remove(i: number) { onChange(items.filter((_, j) => j !== i)); }
  function add() { onChange([...items, { id: crypto.randomUUID(), label: "New Link", href: "/", isExternal: false, openInNewTab: false, order: items.length, children: [] }]); }

  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-slate-600 mb-2">{label}</p>
      <div className="space-y-2 mb-2">
        {items.map((item, i) => (
          <NavItemRow key={item.id} item={item} onUpdate={(v) => update(i, v)} onRemove={() => remove(i)} />
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700">
        <Plus className="w-3.5 h-3.5" /> Add Link
      </button>
    </div>
  );
}

export default function NavigationPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [nav, setNav] = useState<NavigationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fetchError, setFetchError] = useState("");

  function load() {
    setIsLoading(true);
    setFetchError("");
    fetch(`/api/admin/${company}/navigation`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) setNav(d.data);
        else setFetchError(d.error ?? "Failed to load navigation.");
      })
      .catch((e) => { if (e.message !== "401") setFetchError("Network error."); })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [company]);

  function update(key: keyof NavigationSettings, value: unknown) {
    setNav((p) => p ? { ...p, [key]: value } : p);
    setIsDirty(true);
  }

  function updateNested(path: string, value: unknown) {
    setNav((p) => {
      if (!p) return p;
      const updated = JSON.parse(JSON.stringify(p));
      const keys = path.split(".");
      let ref: Record<string, unknown> = updated;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]] as Record<string, unknown>;
      ref[keys[keys.length - 1]] = value;
      return updated;
    });
    setIsDirty(true);
  }

  async function handleSave() {
    if (!nav) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/navigation`, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(nav),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) { toast("Navigation saved!", "success"); setIsDirty(false); }
      else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (fetchError) return (
    <div className="flex items-center justify-center h-64 flex-col gap-3">
      <p className="text-red-500 font-semibold">{fetchError}</p>
      <button onClick={load} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors">Retry</button>
    </div>
  );

  if (!nav) return null;

  return (
    <div className="pb-20">
      <PageHeader title="Navigation" subtitle="Configure header menus, announcement bar, and footer links." />
      <div className="space-y-5">
        {/* Announcement bar */}
        <Card title="Announcement Bar">
          <div className="grid gap-4">
            <Toggle checked={nav.announcementBar.enabled} onChange={(v) => updateNested("announcementBar.enabled", v)} label="Show announcement bar" />
            {nav.announcementBar.enabled && (
              <>
                <Field label="Announcement Text">
                  <Input value={nav.announcementBar.text} onChange={(e) => updateNested("announcementBar.text", e.target.value)} />
                </Field>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Phone Number">
                    <Input value={nav.announcementBar.phone} onChange={(e) => updateNested("announcementBar.phone", e.target.value)} />
                  </Field>
                  <Field label="CTA Button Text">
                    <Input value={nav.announcementBar.ctaText} onChange={(e) => updateNested("announcementBar.ctaText", e.target.value)} />
                  </Field>
                  <Field label="CTA Button Link">
                    <Input value={nav.announcementBar.ctaLink} onChange={(e) => updateNested("announcementBar.ctaLink", e.target.value)} />
                  </Field>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Header nav */}
        <Card title="Header Navigation">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <Field label="Header CTA Button Text">
              <Input value={nav.headerCta.text} onChange={(e) => updateNested("headerCta.text", e.target.value)} />
            </Field>
            <Field label="Header CTA Button Link">
              <Input value={nav.headerCta.href} onChange={(e) => updateNested("headerCta.href", e.target.value)} />
            </Field>
          </div>
          <NavList items={nav.headerNav} onChange={(v) => update("headerNav", v)} label="Main Nav Items" />
        </Card>

        {/* Footer links */}
        <Card title="Footer Navigation">
          <NavList items={nav.footerQuickLinks} onChange={(v) => update("footerQuickLinks", v)} label="Quick Links" />
          <NavList items={nav.footerProgramLinks} onChange={(v) => update("footerProgramLinks", v)} label="Programs Column" />
          <NavList items={nav.footerCorporateLinks} onChange={(v) => update("footerCorporateLinks", v)} label="Corporate Column" />
          <NavList items={nav.footerBottomLinks} onChange={(v) => update("footerBottomLinks", v)} label="Bottom Bar Links (Privacy Policy, etc.)" />
        </Card>
      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
