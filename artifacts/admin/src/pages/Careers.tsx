import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";
import { PageHeader, Card, Button, Input, Skeleton, ConfirmDialog, EmptyState, Badge } from "../components/ui";
import { cn } from "../lib/utils";
import { Search, Check, Plus, X, ChevronLeft, ChevronRight, Briefcase, Save } from "lucide-react";
import toast from "react-hot-toast";

export interface Career {
  id: number;
  title: string;
  isOpen: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const CAREERS_KEY = ["admin-careers"];

export default function Careers() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Career | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const knownIdsRef = useRef<Set<number> | null>(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const { data, isLoading } = useQuery<Career[]>({
    queryKey: CAREERS_KEY,
    queryFn: () => apiGet("/admin/careers"),
  });

  const careers = useMemo(() => data ?? [], [data]);

  // Seed selection from server state; on refetch, preserve unsaved local
  // toggles for known positions and adopt server state for new ones.
  useEffect(() => {
    if (!data) return;
    const known = knownIdsRef.current;
    setSelectedIds((prev) => {
      const next = new Set<number>();
      for (const c of data) {
        if (known && known.has(c.id)) {
          if (prev.has(c.id)) next.add(c.id);
        } else if (c.isOpen) {
          next.add(c.id);
        }
      }
      return next;
    });
    knownIdsRef.current = new Set(data.map((c) => c.id));
  }, [data]);

  const serverOpenIds = useMemo(() => new Set(careers.filter((c) => c.isOpen).map((c) => c.id)), [careers]);

  const isDirty = useMemo(() => {
    if (!data) return false;
    if (selectedIds.size !== serverOpenIds.size) return true;
    for (const id of selectedIds) {
      if (!serverOpenIds.has(id)) return true;
    }
    return false;
  }, [data, selectedIds, serverOpenIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? careers.filter((c) => c.title.toLowerCase().includes(q)) : careers;
  }, [careers, search]);

  const selectedCareers = useMemo(() => careers.filter((c) => selectedIds.has(c.id)), [careers, selectedIds]);

  // ---- Carousel scroll state -------------------------------------------
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, filtered.length]);

  const scrollByAmount = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  // ---- Mutations --------------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: () => apiPut("/admin/careers/selection", { selectedIds: Array.from(selectedIds) }),
    onSuccess: (updated: Career[]) => {
      queryClient.setQueryData(CAREERS_KEY, updated);
      toast.success("Open positions saved");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save selection");
    },
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => apiPost("/admin/careers", { title }),
    onSuccess: (created: Career) => {
      queryClient.setQueryData<Career[]>(CAREERS_KEY, (old) => (old ? [...old, created] : [created]));
      setNewTitle("");
      toast.success(`"${created.title}" added`);
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        el?.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add position");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/careers/${id}`),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<Career[]>(CAREERS_KEY, (old) => old?.filter((c) => c.id !== id));
      setDeleteTarget(null);
      toast.success("Position deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete position");
    },
  });

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      toast.error("Enter a position title");
      addInputRef.current?.focus();
      return;
    }
    addMutation.mutate(title);
  };

  const hasPositions = careers.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Careers"
        description="Choose which positions are open for applications. Toggle chips to select, then save your changes."
        actions={
          <div className="flex items-center gap-3">
            {isDirty && <Badge color="warning">Unsaved changes</Badge>}
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!isDirty}
              loading={saveMutation.isPending}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <Skeleton className="h-12 w-full max-w-sm mb-6 rounded-xl" />
          <div className="flex gap-3 overflow-hidden py-2">
            {["w-36", "w-44", "w-32", "w-48", "w-36", "w-40"].map((w, i) => (
              <Skeleton key={i} className={cn("h-11 rounded-full shrink-0", w)} />
            ))}
          </div>
          <Skeleton className="h-5 w-48 mt-6" />
        </Card>
      ) : !hasPositions ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No positions yet"
          description="Create your first job position below, then mark it open to start receiving applications."
          action={
            <Button onClick={() => addInputRef.current?.focus()}>
              <Plus className="w-4 h-4" />
              Add your first position
            </Button>
          }
        />
      ) : (
        <Card>
          {/* Search */}
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search positions..."
              className="pl-11"
              aria-label="Search positions"
            />
          </div>

          {/* Chip carousel */}
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">
              No positions match &ldquo;{search.trim()}&rdquo;.
            </div>
          ) : (
            <div className="relative">
              {/* Left chevron */}
              <button
                type="button"
                onClick={() => scrollByAmount(-1)}
                disabled={!canLeft}
                aria-label="Scroll left"
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center",
                  "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md text-[var(--color-text-muted)]",
                  "hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40 cursor-pointer",
                  "transition-all duration-300",
                  canLeft ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right chevron */}
              <button
                type="button"
                onClick={() => scrollByAmount(1)}
                disabled={!canRight}
                aria-label="Scroll right"
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center",
                  "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md text-[var(--color-text-muted)]",
                  "hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/40 cursor-pointer",
                  "transition-all duration-300",
                  canRight ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Edge fade masks */}
              <div
                aria-hidden
                className={cn(
                  "absolute left-0 inset-y-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-[var(--color-surface)] to-transparent transition-opacity duration-300",
                  canLeft ? "opacity-100" : "opacity-0"
                )}
              />
              <div
                aria-hidden
                className={cn(
                  "absolute right-0 inset-y-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-[var(--color-surface)] to-transparent transition-opacity duration-300",
                  canRight ? "opacity-100" : "opacity-0"
                )}
              />

              {/* Scroll container */}
              <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x px-2 py-3"
              >
                {filtered.map((career) => {
                  const selected = selectedIds.has(career.id);
                  return (
                    <div key={career.id} className="relative group shrink-0 snap-start">
                      <button
                        type="button"
                        onClick={() => toggle(career.id)}
                        aria-pressed={selected}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer",
                          "transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40",
                          selected
                            ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white border border-transparent shadow-md shadow-[var(--color-primary)]/25 scale-[1.03]"
                            : "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
                        )}
                      >
                        {selected && <Check className="w-4 h-4 shrink-0 animate-fade-in" />}
                        {career.title}
                      </button>

                      {/* Hover-revealed delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(career);
                        }}
                        aria-label={`Delete ${career.title}`}
                        title={`Delete ${career.title}`}
                        className={cn(
                          "absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer",
                          "bg-[var(--color-danger)] text-white shadow-md",
                          "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 focus-visible:opacity-100 focus-visible:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100",
                          "transition-all duration-200 hover:bg-red-600"
                        )}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center gap-2 mt-5 pt-5 border-t border-[var(--color-border)]">
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                selectedIds.size > 0 ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]/40"
              )}
            />
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              <span className="font-bold text-[var(--color-text)]">{selectedIds.size}</span> of{" "}
              <span className="font-bold text-[var(--color-text)]">{careers.length}</span> positions open
            </p>
          </div>

          {/* Selected chips wrap-grid (small-screen clarity) */}
          {selectedCareers.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
                Currently open
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCareers.map((career) => (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => toggle(career.id)}
                    title="Click to close this position"
                    className="inline-flex items-center gap-1.5 rounded-full pl-3.5 pr-2.5 py-1.5 text-xs font-semibold cursor-pointer bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/15 transition-all duration-300 active:scale-95"
                  >
                    {career.title}
                    <X className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add position */}
      <Card>
        <h3 className="text-base font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[var(--color-primary)]" />
          Add Position
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              ref={addInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Process Engineer"
              aria-label="New position title"
            />
          </div>
          <Button type="submit" loading={addMutation.isPending} className="shrink-0">
            <Plus className="w-4 h-4" />
            Add Position
          </Button>
        </form>
      </Card>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete position?"
        message={`"${deleteTarget?.title ?? ""}" will be permanently removed. Applicants will no longer see this position.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
