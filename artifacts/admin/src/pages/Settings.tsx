import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../lib/api";
import { PageHeader, Card, Button, Input, TextArea, Skeleton } from "../components/ui";
import { Save, RotateCcw, Settings } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [siteName, setSiteName] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiGet("/admin/settings"),
  });

  useEffect(() => {
    if (data) {
      setSiteName(data.siteName || "");
      setFaviconUrl(data.faviconUrl || "");
      setSeoTitle(data.seoTitle || "");
      setSeoDescription(data.seoDescription || "");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: any) => apiPut("/admin/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    mutation.mutate({
      siteName,
      faviconUrl,
      seoTitle,
      seoDescription,
      logoUrl: data.logoUrl,
      socialLinks: data.socialLinks,
    });
  };

  const handleReset = () => {
    if (data) {
      setSiteName(data.siteName || "");
      setFaviconUrl(data.faviconUrl || "");
      setSeoTitle(data.seoTitle || "");
      setSeoDescription(data.seoDescription || "");
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Site Settings"
          description="Configure general website metadata, SEO settings, and brand assets."
        />
        <Card>
          <Skeleton className="h-5 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={i === 3 ? "h-32 rounded-xl" : "h-12 rounded-xl"} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description="Configure general website metadata, SEO settings, and brand assets."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleReset} size="sm">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSubmit} loading={mutation.isPending} size="sm">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-primary)]" />
            General & SEO Settings
          </h3>
          <div className="space-y-4">
            <Input
              label="Site Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. SustainPro"
              required
            />
            <Input
              label="Favicon URL"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="e.g. /favicon.ico"
              required
            />
            <Input
              label="SEO Title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Meta title tag"
              required
            />
            <TextArea
              label="SEO Description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Meta description tag"
              required
            />
          </div>
        </Card>
      </form>
    </div>
  );
}
