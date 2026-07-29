import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, getToken } from "../lib/api";
import { PageHeader, Card, Button, Skeleton } from "../components/ui";
import { Download, Database, Image as ImageIcon, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface BackupStatus {
  databaseBytes: number;
  uploadFiles: number;
  uploadBytes: number;
  totalBytes: number;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-[var(--color-text)] mt-1">{value}</p>
        {hint && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export default function Backup() {
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading } = useQuery<BackupStatus>({
    queryKey: ["backup-status"],
    queryFn: () => apiGet("/admin/backup/status"),
  });

  // The export endpoint requires the auth header, so a plain <a href> download
  // would come back 401. Fetch it as a blob and save that instead.
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/backup/export", {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Backup failed (${res.status})`);

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "sustainpro-backup.zip";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Backup failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Backup & Export"
        description="Download a copy of everything on the website — all content, settings and uploaded photos — as a single zip file."
      />

      <Card className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatTile
              icon={<Database className="w-5 h-5" />}
              label="Website content"
              value={formatBytes(data?.databaseBytes || 0)}
              hint="Pages, services, programs, messages"
            />
            <StatTile
              icon={<ImageIcon className="w-5 h-5" />}
              label="Uploaded photos"
              value={`${data?.uploadFiles ?? 0} ${data?.uploadFiles === 1 ? "file" : "files"}`}
              hint={formatBytes(data?.uploadBytes || 0)}
            />
            <StatTile
              icon={<Download className="w-5 h-5" />}
              label="Total backup size"
              value={formatBytes(data?.totalBytes || 0)}
              hint="Before compression"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            The download includes the database and every uploaded file. Keep a recent copy
            somewhere safe — especially before the site is redeployed.
          </p>
          <Button onClick={handleDownload} loading={downloading} className="shrink-0">
            <Download className="w-4 h-4" />
            Download backup
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-sm text-[var(--color-text-muted)] leading-relaxed space-y-2">
            <p className="font-semibold text-[var(--color-text)]">How to restore a backup</p>
            <p>
              Unzip the file. Stop the API server, copy <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] text-[var(--color-text)]">sustainpro.db</code>{" "}
              into the project root and the <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-alt)] text-[var(--color-text)]">uploads</code> folder
              next to it, then start the server again.
            </p>
            <p>
              The server must be stopped first — it keeps the database in memory and rewrites
              the file every few seconds, so it would overwrite anything restored while running.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
