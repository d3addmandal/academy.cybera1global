"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";

interface PageOption { label: string; href: string; }
interface MenuItem { id: string; label: string; href: string; }

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function MenuItemRow({
  item, index, pages, onChange, onRemove,
}: {
  item: MenuItem; index: number; pages: PageOption[];
  onChange: (id: string, key: "label" | "href", val: string) => void;
  onRemove: (id: string) => void;
}) {
  const [hrefInput, setHrefInput] = useState(item.href);
  const [suggestions, setSuggestions] = useState<PageOption[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  function handleHrefChange(val: string) {
    setHrefInput(val);
    onChange(item.id, "href", val);
    if (val.trim()) {
      const q = val.toLowerCase();
      setSuggestions(pages.filter(p => p.label.toLowerCase().includes(q) || p.href.toLowerCase().includes(q)).slice(0, 8));
    } else {
      setSuggestions(pages.slice(0, 8));
    }
    setOpen(true);
  }

  function pickSuggestion(p: PageOption) {
    setHrefInput(p.href);
    onChange(item.id, "href", p.href);
    if (!item.label) onChange(item.id, "label", p.label);
    setOpen(false);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
      <GripVertical className="w-4 h-4 text-slate-300 mt-2.5 flex-shrink-0" />
      <span className="text-xs font-mono text-slate-400 mt-2.5 w-5 flex-shrink-0">{index + 1}</span>
      <div className="flex-1 grid sm:grid-cols-2 gap-3">
        <Field label="Label">
          <Input
            value={item.label}
            onChange={e => onChange(item.id, "label", e.target.value)}
            placeholder="e.g. Home"
          />
        </Field>
        <Field label="Page / URL">
          <div ref={wrapRef} className="relative">
            <Input
              value={hrefInput}
              onChange={e => handleHrefChange(e.target.value)}
              onFocus={() => { setSuggestions(pages.slice(0, 8)); setOpen(true); }}
              placeholder="e.g. /courses or start typing..."
            />
            {open && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {suggestions.map(p => (
                  <button
                    key={p.href} type="button"
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-2 text-sm"
                    onMouseDown={() => pickSuggestion(p)}
                  >
                    <span className="font-medium text-slate-800">{p.label}</span>
                    <span className="text-xs text-slate-400 font-mono">{p.href}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>
      </div>
      <button type="button" onClick={() => onRemove(item.id)} className="mt-2 text-red-400 hover:text-red-600 p-1">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function EditMenuPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [header, setHeader] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/${company}/menus/${id}`).then(r => r.json()),
      fetch(`/api/admin/${company}/pages-list`).then(r => r.json()),
    ]).then(([menuRes, pagesRes]) => {
      if (menuRes.success) {
        setHeader(menuRes.data.header);
        setItems(menuRes.data.items.length ? menuRes.data.items : [{ id: generateId(), label: "", href: "" }]);
      }
      if (pagesRes.success) setPages(pagesRes.data);
      setIsLoading(false);
    });
  }, [company, id]);

  function updateItem(itemId: string, key: "label" | "href", val: string) {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, [key]: val } : it));
  }
  function removeItem(itemId: string) { setItems(prev => prev.filter(it => it.id !== itemId)); }
  function addItem() { setItems(prev => [...prev, { id: generateId(), label: "", href: "" }]); }

  async function handleSave() {
    if (!header.trim()) { toast("Menu header is required.", "error"); return; }
    const filtered = items.filter(it => it.label.trim() && it.href.trim());
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ header: header.trim(), items: filtered }),
      });
      const data = await res.json();
      if (data.success) { toast("Menu saved!", "success"); router.push(`${base}/menus`); }
      else toast(data.error || "Failed to save menu.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading...</div>;

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/menus`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="Edit Menu" />
      </div>

      <div className="space-y-6">
        <Card title="Menu Details">
          <Field label="Menu Header *">
            <Input value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g. Quick Links, Programs" />
          </Field>
        </Card>

        <Card title="Menu Items">
          <div className="space-y-3">
            {items.map((item, i) => (
              <MenuItemRow key={item.id} item={item} index={i} pages={pages} onChange={updateItem} onRemove={removeItem} />
            ))}
            <button
              type="button" onClick={addItem}
              className="w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Menu Item
            </button>
          </div>
        </Card>
      </div>

      <SaveBar isLoading={isSaving} onSave={handleSave} />
    </div>
  );
}
