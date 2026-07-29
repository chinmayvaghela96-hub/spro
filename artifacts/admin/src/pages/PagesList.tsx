import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiGet, apiPost, apiDelete } from "../lib/api";
import { PageHeader, Card, Button, Input, Skeleton, ConfirmDialog, EmptyState, Badge } from "../components/ui";
import { 
  Plus, Pencil, Trash2, Globe, FileText, Eye, EyeOff, LayoutTemplate,
  Home, Info, Briefcase, Factory, FlaskConical, Monitor, GraduationCap, Phone
} from "lucide-react";
import toast from "react-hot-toast";

const PAGE_ICONS: Record<string, any> = {
  home: Home,
  about: Info,
  services: Briefcase,
  industries: Factory,
  research: FlaskConical,
  software: Monitor,
  training: GraduationCap,
  contact: Phone,
};

export default function PagesList() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const { data: pages = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-pages"],
    queryFn: () => apiGet("/admin/pages"),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => apiPost("/admin/pages", body),
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page created successfully!");
      setIsCreating(false);
      setTitle("");
      setSlug("");
      setLocation(`/admin/pages/${newPage.id}`);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create page"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page deleted successfully!");
      setDeleteId(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete page"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and URL Slug are required");
      return;
    }
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");
    createMutation.mutate({ title, slug: cleanSlug });
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(autoSlug);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Dynamic Pages"
        description="Create, structure, and publish dynamic sections and layout copies for your site."
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" /> Create Custom Page
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : pages.length === 0 ? (
        <Card className="flex items-center justify-center p-12">
          <EmptyState
            icon={<LayoutTemplate className="w-10 h-10" />}
            title="No custom pages yet"
            description="Create your first custom page. You can add rich text sections, images, galleries, and fully custom SEO parameters."
            action={
              <Button onClick={() => setIsCreating(true)}>
                Create Custom Page
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const PageIcon = PAGE_ICONS[page.slug] || FileText;
            return (
              <Card key={page.id} className="group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-lg bg-[var(--color-surface)]">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                        <PageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[var(--color-text)] transition-colors">{page.title}</h3>
                        <span className="font-mono text-[11px] text-[var(--color-text-muted)]">/{page.slug}</span>
                      </div>
                    </div>
                  </div>
                  
                  {page.subtitle && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">{page.subtitle}</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]/60">
                    <Badge color={page.isActive ? "success" : "warning"}>
                      {page.isActive ? "Published" : "Draft"}
                    </Badge>
                    <Badge color={page.showInMenu ? "info" : "muted"}>
                      {page.showInMenu ? "Visible in Menu" : "Hidden"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-[var(--color-border)]/60">
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" title="Preview live page">
                    <Button variant="ghost" size="sm" className="gap-2 hover:bg-[var(--color-surface-hover)]">
                      <Globe className="w-4 h-4" /> Preview
                    </Button>
                  </a>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setLocation(`/admin/pages/${page.id}`)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Copy
                    </Button>
                    {/* Only allow deleting non-system pages if needed, but we keep delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-2"
                      onClick={() => setDeleteId(page.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Custom Page?"
        message="Are you absolutely sure you want to delete this page? This will permanently remove its URL routing, banner records, and sections layout."
        confirmLabel="Yes, Delete Page"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />

      {/* Create Modal overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-lg font-bold font-serif text-[var(--color-text)] mb-4">Create New Custom Page</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Page Title"
                placeholder="e.g. Case Studies"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
              <Input
                label="URL Slug path"
                placeholder="e.g. case-studies"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <p className="text-[10px] text-[var(--color-text-muted)]">
                The URL path of this page will be: <span className="font-mono bg-[var(--color-surface-hover)] p-0.5 rounded text-[var(--color-primary)]">/{slug || "slug-name"}</span>
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setIsCreating(false)} disabled={createMutation.isPending}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={createMutation.isPending}>
                  Create Page
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
