import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut, apiDelete } from "../lib/api";
import { PageHeader, Card, Button, Skeleton, ConfirmDialog, EmptyState, Badge } from "../components/ui";
import { Mail, Trash2, Eye, EyeOff, Search, MailOpen, Clock, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Messages() {
  const queryClient = useQueryClient();
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["admin-messages"],
    queryFn: () => apiGet("/admin/messages"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiPut(`/admin/messages/${id}`, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message deleted");
      setDeleteId(null);
      if (selectedMsg?.id === deleteId) setSelectedMsg(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSelect = (msg: Message) => {
    setSelectedMsg(msg);
    if (!msg.read) markReadMutation.mutate(msg.id);
  };

  const filtered = search
    ? messages.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.subject.toLowerCase().includes(search.toLowerCase())
      )
    : messages;

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <PageHeader
        title="Messages"
        description={`Contact form submissions. ${unreadCount > 0 ? `${unreadCount} unread.` : "All read."}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Message List */}
        <div className="lg:col-span-2">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState icon={<Mail className="w-8 h-8" />} title="No messages" description="When visitors submit the contact form, messages will appear here." />
            </Card>
          ) : (
            <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto">
              {filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    selectedMsg?.id === msg.id
                      ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!msg.read && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />}
                        <p className={`text-sm truncate ${msg.read ? "text-[var(--color-text)]" : "font-semibold text-[var(--color-text)]"}`}>
                          {msg.name}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{msg.subject || "No subject"}</p>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{msg.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          {selectedMsg ? (
            <Card className="animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">{selectedMsg.subject || "No Subject"}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-[var(--color-text-muted)]">{selectedMsg.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">·</span>
                    <a href={`mailto:${selectedMsg.email}`} className="text-sm text-[var(--color-primary)] hover:underline">
                      {selectedMsg.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[var(--color-text-muted)]">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(selectedMsg.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="border-t border-[var(--color-border)] pt-4">
                <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
              </div>
              {(() => {
                const cvRegex = /CV Attachment:\s*([^\s\n\r]+)/i;
                const match = selectedMsg.message.match(cvRegex);
                const cvUrl = match ? match[1] : null;
                const hasCV = cvUrl && cvUrl.startsWith("/uploads");
                if (!hasCV) return null;

                const getFileUrl = (path: string) => {
                  if (!path) return "";
                  if (path.startsWith("http")) return path;
                  if (window.location.port === "5174") {
                    return `http://localhost:5000${path}`;
                  }
                  return path;
                };

                return (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">Candidate CV/Resume</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{cvUrl.split('/').pop()}</p>
                      </div>
                    </div>
                    <a
                      href={getFileUrl(cvUrl)}
                      target="_blank"
                      rel="noreferrer"
                      download={cvUrl.split('/').pop()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-dark)] transition-colors no-underline cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download CV
                    </a>
                  </div>
                );
              })()}
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <a
                  href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject || "Your message"}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors no-underline"
                >
                  <MailOpen className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Mail className="w-12 h-12 text-[var(--color-text-muted)] mb-3" />
                <p className="text-sm text-[var(--color-text-muted)]">Select a message to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
