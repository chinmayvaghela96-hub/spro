import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiDelete, api } from "../lib/api";
import { PageHeader, Card, Button, Skeleton, ConfirmDialog, EmptyState } from "../components/ui";
import { Image, Upload, Trash2, Search, Grid, List, FileImage, X, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export default function Media() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["admin-media"],
    queryFn: () => apiGet("/admin/media"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success("File deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        await api("/admin/media", { method: "POST", body: formData });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success(`${files.length} file(s) uploaded!`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filtered = search
    ? media.filter((m) => m.originalName.toLowerCase().includes(search.toLowerCase()))
    : media;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success("Relative file path copied to clipboard!");
  };

  return (
    <div>
      <PageHeader
        title="Media Library"
        description={`${media.length} files uploaded.`}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => fileInputRef.current?.click()} loading={uploading} size="sm">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded cursor-pointer ${viewMode === "grid" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded cursor-pointer ${viewMode === "list" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drop zone hint */}
      {uploading && (
        <Card className="mb-4 border-dashed border-2 border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--color-primary)] font-medium">Uploading files...</span>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Image className="w-8 h-8" />}
            title="No media files"
            description="Upload images, PDFs, and documents to use across your website."
            action={
              <Button onClick={() => fileInputRef.current?.click()} size="sm">
                <Upload className="w-4 h-4" />
                Upload Files
              </Button>
            }
          />
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-primary)]/30 transition-all">
              <div className="aspect-square bg-[var(--color-surface-hover)] flex items-center justify-center overflow-hidden">
                {item.mimeType?.startsWith("image/") ? (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <FileImage className="w-10 h-10 text-[var(--color-text-muted)]" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-[var(--color-text)] truncate">{item.originalName}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{formatSize(item.size)}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyToClipboard(item.url)}
                  className="p-1.5 rounded-lg bg-black/50 text-white cursor-pointer hover:bg-[var(--color-primary)]"
                  title="Copy path URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 rounded-lg bg-black/50 text-white cursor-pointer hover:bg-red-500"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">File</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center overflow-hidden shrink-0">
                        {item.mimeType?.startsWith("image/") ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileImage className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                      </div>
                      <span className="text-[var(--color-text)] truncate max-w-[200px]">{item.originalName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{item.mimeType?.split("/")[1] || "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatSize(item.size)}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => copyToClipboard(item.url)}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        title="Copy path URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
