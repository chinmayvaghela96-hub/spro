import { cn } from "../lib/utils";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-[var(--color-border)] pb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-[var(--color-text)] tracking-tight">{title}</h1>
        {description && <p className="text-[15px] md:text-base text-[var(--color-text-muted)] mt-2 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300",
        padding && "p-6 md:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  change?: string;
}

export function StatCard({ label, value, icon, color = "var(--color-primary)", change }: StatCardProps) {
  return (
    <Card className="flex items-center gap-5 hover:border-[var(--color-primary)]/20 transition-all duration-300">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 hover:scale-105"
        style={{ backgroundColor: `${color}12`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
        <p className="text-3xl font-bold font-serif text-[var(--color-text)] mt-1">{value}</p>
        {change && <p className="text-xs text-[var(--color-success)] mt-1 flex items-center gap-1 font-medium">{change}</p>}
      </div>
    </Card>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, children, className, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 hover:-translate-y-0.5";
  const sizes = { 
    sm: "px-5 py-2.5 text-[13px]", 
    md: "px-6 py-3.5 text-[15px]", 
    lg: "px-8 py-4.5 text-base" 
  };
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white hover:shadow-lg hover:shadow-[var(--color-primary)]/20 border border-transparent",
    secondary: "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-text-muted)]/30",
    danger: "bg-gradient-to-r from-[var(--color-danger)] to-red-500 text-white hover:shadow-lg hover:shadow-red-500/20 border border-transparent",
    ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-[var(--color-text)] tracking-tight">{label}</label>}
      <input
        className={cn(
          "w-full px-5 py-3.5 rounded-xl text-[15px] transition-all duration-300",
          "bg-[var(--color-surface-alt)] border border-[var(--color-border)]",
          "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60",
          "focus:outline-none focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
          error && "border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20 focus:border-[var(--color-danger)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-danger)] mt-1 font-medium">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-[var(--color-text)] tracking-tight">{label}</label>}
      <textarea
        className={cn(
          "w-full px-5 py-3.5 rounded-xl text-[15px] resize-y min-h-[140px] transition-all duration-300",
          "bg-[var(--color-surface-alt)] border border-[var(--color-border)]",
          "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60",
          "focus:outline-none focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
          error && "border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20 focus:border-[var(--color-danger)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-danger)] mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-[var(--color-border)] rounded-2xl animate-pulse-soft", className)} />
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onCancel} />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-fade-in z-10">
        <h3 className="text-xl font-bold font-serif text-[var(--color-text)]">{title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[var(--color-surface-alt)]/50 rounded-2xl border border-dashed border-[var(--color-border)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)] mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text)]">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: "primary" | "success" | "warning" | "danger" | "info" | "muted";
}

export function Badge({ children, color = "primary" }: BadgeProps) {
  const colors = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20",
    success: "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20",
    warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20",
    danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20",
    info: "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20",
    muted: "bg-[var(--color-text-muted)]/10 text-[var(--color-text-muted)] border border-[var(--color-text-muted)]/20",
  };

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-2xs", colors[color])}>
      {children}
    </span>
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, title, children, onClose, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden",
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-[var(--color-border)] shrink-0">
          <h3 className="text-xl font-bold font-serif text-[var(--color-text)] tracking-tight truncate">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 -mr-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-colors duration-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 md:px-8 py-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-5 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
