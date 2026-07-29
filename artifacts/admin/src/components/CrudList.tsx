import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { PageHeader, Card, Button, Input, TextArea, Skeleton, ConfirmDialog, EmptyState, Badge } from "../components/ui";
import { MediaPicker } from "../components/ui/MediaPicker";
import { Plus, Pencil, Trash2, Save, X, Search } from "lucide-react";
import * as Icons from "lucide-react";
import toast from "react-hot-toast";
import type { ReactNode } from "react";

export interface ColumnDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "email" | "select" | "date" | "image" | "boolean";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // for select type
  hideInTable?: boolean;
  render?: (value: any, item: any) => ReactNode;
}

interface CrudListProps {
  title: string;
  description: string;
  icon?: ReactNode;
  apiEndpoint: string;
  queryKey: string;
  columns: ColumnDef[];
  itemName?: string;
  searchable?: boolean;
  emptyIcon?: ReactNode;
}

export default function CrudList({
  title,
  description,
  icon,
  apiEndpoint,
  queryKey,
  columns,
  itemName = "item",
  searchable = true,
  emptyIcon,
}: CrudListProps) {
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery<any[]>({
    queryKey: [queryKey],
    queryFn: () => apiGet(apiEndpoint),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, string>) => apiPost(apiEndpoint, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${itemName} created!`);
      setIsCreating(false);
      setFormData({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, string> }) => apiPut(`${apiEndpoint}/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${itemName} updated!`);
      setEditItem(null);
      setFormData({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`${apiEndpoint}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${itemName} deleted!`);
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startCreate = () => {
    setIsCreating(true);
    setEditItem(null);
    const initial: Record<string, string> = {};
    columns.forEach((c) => {
      if (c.type === "boolean") {
        initial[c.key] = "true"; // Default to checked for convenience
      } else {
        initial[c.key] = "";
      }
    });
    setFormData(initial);
  };

  const startEdit = (item: any) => {
    setEditItem(item);
    setIsCreating(false);
    const initial: Record<string, string> = {};
    columns.forEach((c) => {
      const val = item[c.key];
      if (c.type === "boolean") {
        initial[c.key] = (val === true || val === 1 || val === "true") ? "true" : "false";
      } else {
        initial[c.key] = val !== undefined && val !== null ? String(val) : "";
      }
    });
    setFormData(initial);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditItem(null);
    setFormData({});
  };

  const handleSave = () => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const tableColumns = columns.filter((c) => !c.hideInTable);

  const filtered = search
    ? items.filter((item: any) =>
        tableColumns.some((c) => String(item[c.key] || "").toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  const isFormOpen = isCreating || editItem;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={startCreate} size="sm">
            <Plus className="w-4 h-4" />
            Add {itemName}
          </Button>
        }
      />

      {/* Form Panel */}
      {isFormOpen && (
        <Card className="mb-10 animate-fade-in">
          {/* Form Header */}
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-gray-100">
            <h3 className="text-xl font-bold font-serif text-[var(--color-text)]">
              {editItem ? `Edit ${itemName}` : `New ${itemName}`}
            </h3>
            <button onClick={cancelForm} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
            {columns.map((col) =>
              col.type === "textarea" ? (
                <div key={col.key} className="md:col-span-2">
                  <TextArea
                    label={col.label}
                    placeholder={col.placeholder}
                    value={formData[col.key] || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.value }))}
                    required={col.required}
                  />
                </div>
              ) : col.type === "select" ? (
                <div key={col.key} className="space-y-2.5">
                  <label className="text-sm font-semibold text-[var(--color-text)] tracking-tight">{col.label}</label>
                  <select
                    value={formData[col.key] || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-300"
                  >
                    <option value="">Select...</option>
                    {col.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : col.type === "image" ? (
                <div key={col.key} className="md:col-span-2 mb-2">
                  <label className="text-sm font-semibold text-[var(--color-text)] mb-2.5 block tracking-tight">{col.label}</label>
                  <MediaPicker
                    value={formData[col.key] || ""}
                    onChange={(val) => setFormData((p) => ({ ...p, [col.key]: val }))}
                    label={`Select ${col.label}`}
                  />
                </div>
              ) : col.type === "boolean" ? (
                <div key={col.key} className="flex items-center gap-3.5 mt-4 md:mt-8">
                  <input
                    type="checkbox"
                    checked={formData[col.key] === "true"}
                    onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.checked ? "true" : "false" }))}
                    className="w-5 h-5 rounded-lg text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-opacity-25 border-[var(--color-border)] cursor-pointer"
                    id={`checkbox-${col.key}`}
                  />
                  <label htmlFor={`checkbox-${col.key}`} className="text-sm font-semibold text-[var(--color-text)] cursor-pointer tracking-tight">{col.label}</label>
                </div>
              ) : (
                <Input
                  key={col.key}
                  label={col.label}
                  type={col.type}
                  placeholder={col.placeholder}
                  value={formData[col.key] || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [col.key]: e.target.value }))}
                  required={col.required}
                />
              )
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-10 border-t border-gray-100 pt-6">
            <Button variant="secondary" onClick={cancelForm} size="sm" className="px-6 py-2.5 text-[13px] rounded-full">Cancel</Button>
            <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending} size="sm" className="px-6 py-2.5 text-[13px] rounded-full">
              <Save className="w-4 h-4" />
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      {searchable && items.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={`Search ${itemName}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.75rem" }}
              className="w-full pr-4 py-3.5 rounded-xl text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-300 shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <Card padding={false}>
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={emptyIcon || icon || <Plus className="w-8 h-8" />}
            title={`No ${itemName}s yet`}
            description={`Get started by adding your first ${itemName}.`}
            action={<Button onClick={startCreate} size="sm"><Plus className="w-4 h-4" /> Add {itemName}</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {filtered.map((item: any, idx: number) => {
            const iconName = item.icon || "";
            const LucideIcon = (Icons as any)[iconName] || Icons.Settings;
            
            const titleCol = tableColumns.find(c => c.key.toLowerCase().includes("title") || c.key.toLowerCase().includes("name")) || tableColumns[0];
            const titleVal = item[titleCol.key] || "";
            
            const descCol = columns.find(c => c.key === "description" || c.key === "content");
            const descVal = descCol ? item[descCol.key] : "";
            
            const metaCols = tableColumns.filter(c => c.key !== titleCol.key && c.key !== "icon");

            return (
              <div
                key={item.id || idx}
                className="bg-white p-9 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
              >
                {/* Top Content */}
                <div className="flex-grow">
                  {/* Icon + Order badge */}
                  <div className="flex items-start justify-between mb-7">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <LucideIcon className="w-7 h-7" />
                    </div>
                    {item.order !== undefined && (
                      <span className="text-[11px] font-semibold text-[var(--color-text-muted)] bg-gray-100 px-3 py-1.5 rounded-full">
                        #{item.order}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 tracking-tight group-hover:text-primary transition-colors leading-snug">
                    {titleVal}
                  </h3>

                  {/* Description */}
                  {descVal ? (
                    <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed mb-6 line-clamp-3">
                      {descVal}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic mb-6">
                      No description provided
                    </p>
                  )}
                </div>

                {/* Footer: Metadata + Actions */}
                <div className="mt-auto pt-5 border-t border-gray-100 space-y-3">
                  {metaCols.map(col => {
                    const val = item[col.key];
                    if (val === undefined || val === null || val === "" || val === "—") return null;
                    return (
                      <div key={col.key} className="flex justify-between items-center gap-4">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</span>
                        <span className="text-[13px] text-[var(--color-text)] font-semibold truncate max-w-[200px]" title={val}>
                          {col.render ? col.render(val, item) : String(val)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(item)}
                      className="px-5 py-2.5 text-[13px] font-semibold rounded-full"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-full text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] border border-gray-200 hover:border-red-200 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={`Delete ${itemName}`}
        message={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
