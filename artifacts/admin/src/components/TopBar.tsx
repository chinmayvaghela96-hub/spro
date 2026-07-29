import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";
import { Sun, Moon, LogOut, Menu, User, Lock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-20 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)] flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 shadow-2xs">
      {/* Left - Menu toggle + Welcome */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] hidden sm:block">
          Welcome back, <span className="text-[var(--color-text)] font-semibold">{admin?.name || "Admin"}</span>
        </h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "p-2.5 rounded-lg transition-colors cursor-pointer",
            "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          )}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              "flex items-center gap-2.5 p-1.5 pl-3 rounded-xl transition-all duration-300 cursor-pointer",
              "hover:bg-[var(--color-surface-hover)]",
              profileOpen && "bg-[var(--color-surface-hover)]"
            )}
          >
            <span className="text-sm font-semibold text-[var(--color-text)] hidden sm:block">
              {admin?.name || "Admin"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {(admin?.name || "A").charAt(0).toUpperCase()}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl py-1.5 animate-fade-in z-50">
              <div className="px-4 py-2 border-b border-[var(--color-border)]">
                <p className="text-sm font-semibold text-[var(--color-text)]">{admin?.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{admin?.email}</p>
              </div>
              <Link
                href="/admin/change-password"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] no-underline transition-colors"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] no-underline transition-colors"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </Link>
              <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] w-full cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
