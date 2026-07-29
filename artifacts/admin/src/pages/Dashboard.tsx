import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import { PageHeader, StatCard, Card, Skeleton, Button, Badge } from "../components/ui";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Mail,
  Image,
  Bell,
  Eye,
  TrendingUp,
  Phone,
  MapPin,
  Pencil,
  UserCircle,
  BriefcaseBusiness,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { SirProfile } from "./SirInformation";
import { getInitials } from "./SirInformation";
import type { Career } from "./Careers";

interface DashboardStats {
  totalPages: number;
  totalEvents: number;
  totalNotices: number;
  totalMessages: number;
  unreadMessages: number;
  totalMedia: number;
}

function ContactChip({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] max-w-full">
      <span className="text-[var(--color-primary)] shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function ProfileHero() {
  const [, navigate] = useLocation();
  const { data: profile, isLoading, isError } = useQuery<SirProfile>({
    queryKey: ["sir-profile"],
    queryFn: () => apiGet("/admin/sir-profile"),
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card padding={false} className="overflow-hidden hover:translate-y-0">
        <Skeleton className="h-24 md:h-28 rounded-none" />
        <div className="px-6 md:px-8 pb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="-mt-10 shrink-0">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
            <div className="flex-1 space-y-2.5 pt-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-64 max-w-full" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-44 rounded-full" />
          </div>
        </div>
      </Card>
    );
  }

  const hasProfile = !isError && !!profile;

  return (
    <Card padding={false} className="overflow-hidden hover:translate-y-0">
      {/* Gradient banner */}
      <div
        className="relative h-24 md:h-28 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="absolute -top-12 -right-6 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-1/3 w-40 h-40 rounded-full bg-black/10" />
      </div>

      <div className="px-6 md:px-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="flex flex-col sm:flex-row gap-4 min-w-0">
            {/* Avatar */}
            <div className="-mt-10 shrink-0">
              {hasProfile && profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName || "Profile photo"}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[var(--color-surface)] shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] ring-4 ring-[var(--color-surface)] shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold font-serif text-xl tracking-wide">
                    {hasProfile ? getInitials(profile.fullName) : "SP"}
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 pt-2">
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Welcome back,</p>
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-[var(--color-text)] tracking-tight truncate">
                {hasProfile && profile.fullName?.trim() ? profile.fullName : "SustainPro Admin"}
              </h2>
              {hasProfile && profile.designation?.trim() && (
                <div className="mt-1.5">
                  <Badge color="primary">{profile.designation}</Badge>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <Button variant="secondary" size="sm" onClick={() => navigate("/admin/sir-info")}>
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Contact chips */}
        {hasProfile ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.phone?.trim() && <ContactChip icon={<Phone className="w-3.5 h-3.5" />} value={profile.phone} />}
            {profile.email?.trim() && <ContactChip icon={<Mail className="w-3.5 h-3.5" />} value={profile.email} />}
            {profile.city?.trim() && <ContactChip icon={<MapPin className="w-3.5 h-3.5" />} value={profile.city} />}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
            Manage your website content, careers, and profile from this dashboard.
          </p>
        )}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet("/admin/dashboard/stats"),
  });

  const { data: careers } = useQuery<Career[]>({
    queryKey: ["admin-careers"],
    queryFn: () => apiGet("/admin/careers"),
    retry: 1,
  });

  const openPositions = (careers ?? []).filter((c) => c.isOpen).length;

  const stats = data || {
    totalPages: 8,
    totalEvents: 0,
    totalNotices: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalMedia: 0,
  };

  const quickActions = [
    { label: "Page Builder", path: "/admin/pages", icon: <FileText className="w-5 h-5" />, color: "var(--color-primary)" },
    { label: "Careers", path: "/admin/careers", icon: <BriefcaseBusiness className="w-5 h-5" />, color: "#0ea5e9" },
    { label: "Sir Information", path: "/admin/sir-info", icon: <UserCircle className="w-5 h-5" />, color: "var(--color-accent)" },
    { label: "Manage Events", path: "/admin/events", icon: <Calendar className="w-5 h-5" />, color: "#14b8a6" },
    { label: "View Messages", path: "/admin/messages", icon: <Mail className="w-5 h-5" />, color: "#f59e0b" },
    { label: "Upload Media", path: "/admin/media", icon: <Image className="w-5 h-5" />, color: "#8b5cf6" },
    { label: "Post Notice", path: "/admin/notices", icon: <Bell className="w-5 h-5" />, color: "#ef4444" },
    { label: "Site Settings", path: "/admin/settings", icon: <Eye className="w-5 h-5" />, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome to the SustainPro admin dashboard. Manage your website content from here."
      />

      {/* Profile hero */}
      <ProfileHero />

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard label="Content Pages" value={stats.totalPages} icon={<FileText className="w-6 h-6" />} color="var(--color-primary)" />
          <StatCard
            label="Open Positions"
            value={openPositions}
            icon={<BriefcaseBusiness className="w-6 h-6" />}
            color="#0ea5e9"
            change={openPositions > 0 ? "Accepting applications" : undefined}
          />
          <StatCard label="Events" value={stats.totalEvents} icon={<Calendar className="w-6 h-6" />} color="var(--color-accent)" />
          <StatCard label="Active Notices" value={stats.totalNotices} icon={<Bell className="w-6 h-6" />} color="#f59e0b" />
          <StatCard
            label="Messages"
            value={stats.totalMessages}
            icon={<Mail className="w-6 h-6" />}
            color="#8b5cf6"
            change={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : undefined}
          />
          <StatCard label="Media Files" value={stats.totalMedia} icon={<Image className="w-6 h-6" />} color="#06b6d4" />
          <StatCard label="Site Status" value="Live" icon={<TrendingUp className="w-6 h-6" />} color="#22c55e" change="All systems operational" />
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold font-serif text-[var(--color-text)] mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-[var(--color-primary)]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              href={action.path}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-300 no-underline group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-sm"
                style={{ backgroundColor: `${action.color}12`, color: action.color }}
              >
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] text-center tracking-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <h2 className="text-xl font-bold font-serif text-[var(--color-text)] mb-4">Getting Started</h2>
        <div className="space-y-1">
          {[
            { step: "1", text: "Build and customize pages with the Page Builder", link: "/admin/pages" },
            { step: "2", text: "Add hero slider images to the homepage", link: "/admin/hero-slides" },
            { step: "3", text: "Publish events and notices", link: "/admin/events" },
            { step: "4", text: "Open career positions for applications", link: "/admin/careers" },
            { step: "5", text: "Review Sir Information and site settings", link: "/admin/sir-info" },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.link}
              className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-[var(--color-surface-hover)] transition-all duration-300 no-underline group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                {item.step}
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] tracking-tight">{item.text}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
