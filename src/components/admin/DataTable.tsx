"use client";
import { useState } from "react";
import { Search, Trash2, Edit2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface Action<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  variant?: "default" | "danger";
}

interface Props<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  createHref?: string;
  createLabel?: string;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  title?: string;
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  actions,
  createHref,
  createLabel = "Add New",
  searchKeys = [],
  emptyMessage = "No items found.",
  title,
  isLoading,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = data.filter((item) => {
    if (!search) return true;
    return searchKeys.some((k) => String((item as Record<string, unknown>)[k as string] ?? "").toLowerCase().includes(search.toLowerCase()));
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String((a as Record<string, unknown>)[sortKey] ?? "");
    const bv = String((b as Record<string, unknown>)[sortKey] ?? "");
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Table header controls */}
      {(title || createHref || searchKeys.length > 0) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
          {title && <h3 className="font-bold text-slate-800">{title}</h3>}
          <div className="flex items-center gap-3 ml-auto">
            {searchKeys.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-red-400 w-48"
                />
              </div>
            )}
            {createHref && (
              <Link href={createHref} className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-500 transition-colors">
                <Plus className="w-4 h-4" />
                {createLabel}
              </Link>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400 text-sm">{search ? `No results for "${search}"` : emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    onClick={() => col.sortable && toggleSort(String(col.key))}
                    className={`px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.sortable ? "cursor-pointer hover:text-slate-800 select-none" : ""}`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === String(col.key) && (
                        sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  </th>
                ))}
                {actions && <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => (
                <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-5 py-3 text-slate-700">
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[String(col.key)] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action) => (
                          <button
                            key={action.label}
                            onClick={() => action.onClick(item)}
                            title={action.label}
                            className={`p-1.5 rounded-lg transition-colors ${
                              action.variant === "danger"
                                ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                          >
                            {action.icon && <action.icon className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      {sorted.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {sorted.length} of {data.length} items
        </div>
      )}
    </div>
  );
}
