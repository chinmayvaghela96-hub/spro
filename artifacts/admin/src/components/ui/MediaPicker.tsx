import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, api } from "../../lib/api";
import { Button, Skeleton } from "../ui";
import { Image as ImageIcon, Upload, Search, FileImage, X, Check } from "lucide-react";
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

interface MediaPickerProps {
  value: string | string[];
  onChange: (val: any) => void;
  label?: string;
  multiple?: boolean;
}

export function MediaPicker({ value, onChange, label = "Select Image", multiple = false }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const { data: media = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["admin-media"],
    queryFn: () => apiGet("/admin/media"),
    enabled: isOpen,
  });

  const handleOpen = () => {
    if (multiple) {
      if (Array.isArray(value)) {
        setSelectedUrls(value);
      } else if (typeof value === "string" && value) {
        setSelectedUrls(value.split(",").filter(Boolean));
      } else {
        setSelectedUrls([]);
      }
    }
    setIsOpen(true);
  };

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

  const handleSelect = (url: string) => {
    if (multiple) {
      if (selectedUrls.includes(url)) {
        setSelectedUrls(selectedUrls.filter((u) => u !== url));
      } else {
        setSelectedUrls([...selectedUrls, url]);
      }
    } else {
      onChange(url);
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    onChange(selectedUrls);
    setIsOpen(false);
  };

  const singleValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-2">
      {multiple ? (
        <div>
          <Button type="button" variant="secondary" onClick={handleOpen} className="justify-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {singleValue ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-hover)] shrink-0">
              {singleValue.endsWith(".pdf") || singleValue.endsWith(".doc") ? (
                <div className="w-full h-full flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
              ) : (
                <img src={singleValue} alt="Selected" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded hover:bg-red-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-[var(--color-text-muted)] opacity-50" />
            </div>
          )}
          <div className="flex-1">
            <Button type="button" variant="secondary" onClick={handleOpen} className="w-full justify-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              {singleValue ? "Change Media" : label}
            </Button>
            {singleValue && <p className="text-xs text-[var(--color-text-muted)] mt-2 truncate">{singleValue}</p>}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[var(--color-border)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  Media Library
                </h3>
                {multiple && (
                  <Button type="button" onClick={handleConfirm} size="sm" className="bg-primary text-white">
                    Confirm Selection ({selectedUrls.length})
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => fileInputRef.current?.click()} loading={uploading} size="sm">
                  <Upload className="w-4 h-4 mr-2" />
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
                <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg text-[var(--color-text-muted)] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search media files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="p-4 overflow-y-auto flex-1 min-h-[300px]">
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)]">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p>No media files found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filtered.map((item) => {
                    const isSelected = multiple
                      ? selectedUrls.includes(item.url)
                      : singleValue === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? "border-[var(--color-primary)]" : "border-transparent hover:border-[var(--color-primary)]/50"
                        }`}
                      >
                        <div className="w-full h-full bg-[var(--color-surface-hover)] flex items-center justify-center">
                          {item.mimeType?.startsWith("image/") ? (
                            <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <FileImage className="w-8 h-8 text-[var(--color-text-muted)]" />
                              <span className="text-[10px] uppercase text-[var(--color-text-muted)]">{item.mimeType.split('/')[1] || 'FILE'}</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-[10px] text-white truncate text-center">{item.originalName}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white p-1 rounded-full shadow-md">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
