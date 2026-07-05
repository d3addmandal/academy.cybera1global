"use client";
import { useState } from "react";
import { Search, ChevronUp, ChevronDown, Plus, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
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

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDef<T> {
  key: keyof T | string;
  label: string;
  options: FilterOption[];
}

interface BulkAction {
  label: string;
  icon?: React.ElementType;
  onClick: (ids: string[]) => void;
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
  filters?: FilterDef<T>[];
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: BulkAction[];
  /** Pins the table to a fixed height (toolbar/header/pagination stay put) and scrolls only the rows, instead of letting the card grow with the data. */
  fillHeight?: boolean;
}

const MAX_INLINE_ACTIONS = 3;

function ActionButtons<T>({ item, actions }: { item: T; actions: Action<T>[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inline = actions.length > MAX_INLINE_ACTIONS ? actions.slice(0, 2) : actions;
  const overflow = actions.length > MAX_INLINE_ACTIONS ? actions.slice(2) : [];

  return (
    <div className="flex items-center justify-end gap-2 relative">
      {inline.map((action) => (
        <button
          key={action.label}
          onClick={() => action.onClick(item)}
          title={action.label}
          className={`p-3 -m-1 rounded-lg transition-colors ${
            action.variant === "danger"
              ? "text-red-400 hover:bg-red-50 hover:text-red-600"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
        </button>
      ))}
      {overflow.length > 0 && (
        <>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="More actions"
            className="p-3 -m-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                {overflow.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => { action.onClick(item); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      action.variant === "danger"
                        ? "text-red-500 hover:bg-red-50"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {action.icon && <action.icon className="w-3.5 h-3.5" />}
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
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
  filters,
  pageSize,
  selectable,
  onSelectionChange,
  bulkActions,
  fillHeight,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const updateSelection = (next: Set<string>) => {
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const filtered = data.filter((item) => {
    if (search && !searchKeys.some((k) => String((item as Record<string, unknown>)[k as string] ?? "").toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    if (filters) {
      for (const f of filters) {
        const active = filterValues[String(f.key)];
        if (active && String((item as Record<string, unknown>)[String(f.key)] ?? "") !== active) return false;
      }
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String((a as Record<string, unknown>)[sortKey] ?? "");
    const bv = String((b as Record<string, unknown>)[sortKey] ?? "");
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const visible = pageSize ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    updateSelection(next);
  };

  const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.has(item.id));
  const toggleAllVisible = () => {
    const next = new Set(selected);
    if (allVisibleSelected) visible.forEach((item) => next.delete(item.id));
    else visible.forEach((item) => next.add(item.id));
    updateSelection(next);
  };

  const hasHeaderControls = title || createHref || searchKeys.length > 0 || (filters && filters.length > 0);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${fillHeight ? "flex flex-col h-[calc(100vh-220px)]" : ""}`}>
      {/* Bulk action bar — replaces the normal header row while items are selected */}
      {selectable && bulkActions && selected.size > 0 ? (
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-red-50/60">
          <span className="text-sm font-semibold text-slate-700">{selected.size} selected</span>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.onClick(Array.from(selected))}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                  action.variant === "danger"
                    ? "text-red-600 border border-red-200 hover:bg-red-100"
                    : "text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {action.icon && <action.icon className="w-3.5 h-3.5" />}
                {action.label}
              </button>
            ))}
            <button
              onClick={() => updateSelection(new Set())}
              className="text-sm text-slate-400 hover:text-slate-600 px-2"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        hasHeaderControls && (
          <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
            {title && <h3 className="font-bold text-slate-800">{title}</h3>}
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              {filters?.map((f) => (
                <select
                  key={String(f.key)}
                  value={filterValues[String(f.key)] ?? ""}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, [String(f.key)]: e.target.value }))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-red-400 bg-white text-slate-600"
                >
                  <option value="">{f.label}: All</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ))}
              {searchKeys.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-red-400 w-40 sm:w-48"
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
        )
      )}

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-400 text-sm">{search ? `No results for "${search}"` : emptyMessage}</p>
        </div>
      ) : (
        <div className={fillHeight ? "flex-1 min-h-0 overflow-auto" : "overflow-x-auto"}>
          <table className="w-full text-sm">
            <thead className={fillHeight ? "sticky top-0 z-10" : ""}>
              <tr className="bg-slate-50 border-b border-slate-100">
                {selectable && (
                  <th className="px-5 py-3 w-10">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="rounded border-slate-300" />
                  </th>
                )}
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
              {visible.map((item, i) => (
                <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  {selectable && (
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleRow(item.id)} className="rounded border-slate-300" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-5 py-3 text-slate-700">
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[String(col.key)] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-3">
                      <ActionButtons item={item} actions={actions} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count + pagination */}
      {sorted.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          <span>
            {pageSize
              ? `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sorted.length)} of ${sorted.length}`
              : `Showing ${sorted.length} of ${data.length} items`}
          </span>
          {pageSize && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
