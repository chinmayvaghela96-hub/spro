import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import {
  LayoutDashboard,
  Home,
  Info,
  Briefcase,
  Factory,
  FlaskConical,
  Monitor,
  GraduationCap,
  Calendar,
  Bell,
  Mail,
  Image,
  Phone,
  PanelBottom,
  Settings,
  Heart,
  ChevronLeft,
  Leaf,
  Sliders,
  BookOpen,
  Link2,
  LayoutTemplate,
  BriefcaseBusiness,
  UserCircle,
  DownloadCloud,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { divider: true, label: "Content Management" },
  { label: "Page Builder", path: "/admin/pages", icon: LayoutTemplate },
  { label: "Services", path: "/admin/services", icon: Briefcase },
  { label: "Industries", path: "/admin/industries", icon: Factory },
  { label: "Software", path: "/admin/software", icon: Monitor },
  { label: "Training Categories", path: "/admin/training", icon: GraduationCap },
  { label: "Training Programs", path: "/admin/training-programs", icon: GraduationCap },
  { label: "Careers", path: "/admin/careers", icon: BriefcaseBusiness },
  { label: "Hero Slides", path: "/admin/hero-slides", icon: Sliders },
  { label: "Photo Gallery", path: "/admin/gallery", icon: Image },
  { label: "Page Banners", path: "/admin/page-banners", icon: Image },
  { label: "Navigation Links", path: "/admin/nav-items", icon: Link2 },
  { label: "Faculty Advisors", path: "/admin/faculty-advisors", icon: UserCircle },
  { label: "Publications", path: "/admin/publications", icon: BookOpen },
  { divider: true, label: "Platform Management" },
  { label: "Events", path: "/admin/events", icon: Calendar },
  { label: "Notices", path: "/admin/notices", icon: Bell },
  { label: "Messages", path: "/admin/messages", icon: Mail },
  { label: "Media Library", path: "/admin/media", icon: Image },
  { divider: true, label: "Settings" },
  { label: "Contact Info", path: "/admin/contact-info", icon: Phone },
  { label: "Footer", path: "/admin/footer", icon: PanelBottom },
  { label: "Donations", path: "/admin/donations", icon: Heart },
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Backup & Export", path: "/admin/backup", icon: DownloadCloud },
] as const;

export default function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "h-screen flex flex-col",
        "bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-sm",
        "admin-sidebar"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "h-20 flex items-center border-b border-[var(--color-border)] shrink-0",
        collapsed ? "justify-center px-0 gap-0" : "px-5 gap-3.5"
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shrink-0 shadow-md shadow-[var(--color-primary)]/25">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="font-bold font-serif text-lg text-[var(--color-text)] whitespace-nowrap tracking-tight">SustainPro</h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-primary)] whitespace-nowrap">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto space-y-1.5", collapsed ? "py-5 px-2" : "py-6")}>
        {navItems.map((item) => {
          if ("divider" in item) {
            if (collapsed) {
              return <div key={item.label} className="mx-3 my-4 border-t border-[var(--color-border)]" />;
            }
            return (
              <div key={item.label} className="px-6 pt-7 pb-2 first:pt-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]/70 select-none">
                  {item.label}
                </span>
              </div>
            );
          }

          if (!("path" in item)) return null;
          const Icon = item.icon;
          const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path + "/"));

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold mb-3",
                "transition-all duration-300 no-underline relative group",
                isActive
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white shadow-md shadow-[var(--color-primary)]/20"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] hover:translate-x-1.5",
                collapsed 
                  ? "justify-center p-3 mx-2 hover:translate-x-0" 
                  : "gap-3.5 px-4 py-3.5"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-3.5 bg-white/80 rounded-full animate-fade-in" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "h-14 flex items-center justify-center border-t border-[var(--color-border)]",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
          "transition-colors cursor-pointer shrink-0"
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
}
