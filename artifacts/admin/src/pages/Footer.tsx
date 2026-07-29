import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../lib/api";
import { PageHeader, Card, Button, Input } from "../components/ui";
import { Save, RotateCcw, PanelBottom } from "lucide-react";
import toast from "react-hot-toast";

export default function Footer() {
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiGet("/admin/settings"),
  });

  useEffect(() => {
    if (data) {
      setLogoUrl(data.logoUrl || "");
      setLinkedinUrl(data.socialLinks?.linkedin || "");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: any) => apiPut("/admin/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Footer settings saved successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save footer settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    mutation.mutate({
      ...data,
      logoUrl,
      socialLinks: {
        ...data.socialLinks,
        linkedin: linkedinUrl,
      },
    });
  };

  const handleReset = () => {
    if (data) {
      setLogoUrl(data.logoUrl || "");
      setLinkedinUrl(data.socialLinks?.linkedin || "");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading Footer settings...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Footer Settings"
        description="Update information and links displayed in the website footer."
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
            <PanelBottom className="w-5 h-5 text-[var(--color-primary)]" />
            Footer Brand & Links
          </h3>
          <div className="space-y-4">
            <Input
              label="Footer Logo URL"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="e.g. /logo.jpeg"
            />
            <Input
              label="LinkedIn Page URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="e.g. https://linkedin.com/company/sustainpro"
            />
          </div>
        </Card>
      </form>
    </div>
  );
}
