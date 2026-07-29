import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../lib/api";
import { PageHeader, Card, Button, Input, TextArea, Skeleton, Badge, Modal } from "../components/ui";
import { MediaPicker } from "../components/ui/MediaPicker";
import { cn } from "../lib/utils";
import { Mail, Phone, MapPin, Home, FileText, Pencil, UserCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export interface SirProfile {
  id: number;
  fullName: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  fullAddress: string;
  photoUrl: string | null;
  bio: string;
  updatedAt: string;
}

interface ProfileForm {
  fullName: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  fullAddress: string;
  photoUrl: string;
  bio: string;
}

const emptyForm: ProfileForm = {
  fullName: "",
  designation: "",
  email: "",
  phone: "",
  city: "",
  fullAddress: "",
  photoUrl: "",
  bio: "",
};

export function getInitials(name?: string | null) {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function validate(form: ProfileForm): Partial<Record<keyof ProfileForm, string>> {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }
  const email = form.email.trim();
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  const phone = form.phone.trim();
  if (!phone) {
    errors.phone = "Phone is required";
  } else if (!/^[0-9+\-\s]{7,20}$/.test(phone)) {
    errors.phone = "Phone must be 7-20 characters (digits, +, spaces, dashes)";
  }
  if (!form.city.trim()) {
    errors.city = "City is required";
  }
  if (!form.fullAddress.trim()) {
    errors.fullAddress = "Full address is required";
  }
  return errors;
}

function Avatar({ name, photoUrl, className }: { name?: string | null; photoUrl?: string | null; className?: string }) {
  return photoUrl ? (
    <img
      src={photoUrl}
      alt={name || "Profile photo"}
      className={cn("rounded-full object-cover ring-4 ring-[var(--color-surface)] shadow-lg", className)}
    />
  ) : (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center ring-4 ring-[var(--color-surface)] shadow-lg",
        className
      )}
    >
      <span className="text-white font-bold font-serif text-[0.4em] leading-none tracking-wide">{getInitials(name)}</span>
    </div>
  );
}

function InfoRow({ icon, label, value, span }: { icon: React.ReactNode; label: string; value?: string | null; span?: boolean }) {
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-surface-alt)]/60 border border-[var(--color-border)]/60 transition-colors duration-300 hover:border-[var(--color-primary)]/25", span && "sm:col-span-2")}>
      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
        {value?.trim() ? (
          <p className="text-[15px] text-[var(--color-text)] font-medium mt-1 leading-relaxed break-words whitespace-pre-line">{value}</p>
        ) : (
          <p className="text-[15px] italic text-[var(--color-text-muted)]/70 mt-1">Not set</p>
        )}
      </div>
    </div>
  );
}

export default function SirInformation() {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  const { data: profile, isLoading, isError, refetch } = useQuery<SirProfile>({
    queryKey: ["sir-profile"],
    queryFn: () => apiGet("/admin/sir-profile"),
  });

  const mutation = useMutation({
    mutationFn: (body: Omit<ProfileForm, "photoUrl"> & { photoUrl: string | null }) =>
      apiPut("/admin/sir-profile", body),
    onSuccess: (updated: SirProfile) => {
      queryClient.setQueryData(["sir-profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["sir-profile"] });
      toast.success("Profile updated successfully");
      setEditOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const openEditor = () => {
    setForm({
      fullName: profile?.fullName ?? "",
      designation: profile?.designation ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      fullAddress: profile?.fullAddress ?? "",
      photoUrl: profile?.photoUrl ?? "",
      bio: profile?.bio ?? "",
    });
    setErrors({});
    setEditOpen(true);
  };

  const closeEditor = () => {
    if (!mutation.isPending) setEditOpen(false);
  };

  const setField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    mutation.mutate({
      fullName: form.fullName.trim(),
      designation: form.designation.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      fullAddress: form.fullAddress.trim(),
      photoUrl: form.photoUrl.trim() || null,
      bio: form.bio.trim(),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sir Information"
        description="Manage the profile details displayed across the website and admin portal."
        actions={
          !isLoading && !isError ? (
            <Button onClick={openEditor}>
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <Card padding={false} className="overflow-hidden hover:translate-y-0">
          <Skeleton className="h-28 md:h-32 rounded-none" />
          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="-mt-12 shrink-0">
                <Skeleton className="w-24 h-24 rounded-full" />
              </div>
              <div className="space-y-3 flex-1 pt-3">
                <Skeleton className="h-7 w-56 max-w-full" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className={cn("h-20", i >= 3 && "sm:col-span-2")} />
              ))}
            </div>
          </div>
        </Card>
      ) : isError ? (
        <Card className="text-center py-16">
          <UserCircle className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-40 mb-4" />
          <h3 className="text-lg font-bold text-[var(--color-text)]">Could not load profile</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">Something went wrong while fetching the profile details.</p>
          <Button variant="secondary" className="mt-6" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </Card>
      ) : (
        <Card padding={false} className="overflow-hidden hover:translate-y-0">
          {/* Gradient accent band */}
          <div className="relative h-28 md:h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden">
            <div className="absolute -top-10 -right-8 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute top-10 right-24 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-14 left-10 w-40 h-40 rounded-full bg-black/10" />
          </div>

          <div className="px-6 md:px-8 pb-8">
            {/* Avatar + identity */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="-mt-12 shrink-0">
                <Avatar name={profile?.fullName} photoUrl={profile?.photoUrl} className="w-24 h-24 text-[56px]" />
              </div>
              <div className="min-w-0 flex-1 pt-3">
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-[var(--color-text)] tracking-tight truncate">
                  {profile?.fullName?.trim() || "Unnamed Profile"}
                </h2>
                {profile?.designation?.trim() ? (
                  <div className="mt-2">
                    <Badge color="primary">{profile.designation}</Badge>
                  </div>
                ) : (
                  <p className="text-sm italic text-[var(--color-text-muted)]/70 mt-2">Designation not set</p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <InfoRow icon={<Mail className="w-5 h-5" />} label="Email" value={profile?.email} />
              <InfoRow icon={<Phone className="w-5 h-5" />} label="Phone" value={profile?.phone} />
              <InfoRow icon={<MapPin className="w-5 h-5" />} label="City" value={profile?.city} />
              <InfoRow icon={<Home className="w-5 h-5" />} label="Full Address" value={profile?.fullAddress} />
              <InfoRow icon={<FileText className="w-5 h-5" />} label="Bio" value={profile?.bio} span />
            </div>
          </div>
        </Card>
      )}

      {/* Edit dialog */}
      <Modal
        open={editOpen}
        title="Edit Profile"
        onClose={closeEditor}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeEditor} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="sir-profile-form" loading={mutation.isPending}>
              Save Changes
            </Button>
          </>
        }
      >
        <form id="sir-profile-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text)] tracking-tight">Profile Photo</label>
            <div className="flex items-start gap-4">
              <Avatar name={form.fullName} photoUrl={form.photoUrl.trim() || null} className="w-16 h-16 text-[38px] shrink-0" />
              <div className="flex-1 min-w-0">
                <MediaPicker
                  value={form.photoUrl}
                  onChange={(url: string) => setField("photoUrl", typeof url === "string" ? url : "")}
                  label="Select Photo"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="e.g. Dr. A. B. Sharma"
              error={errors.fullName}
            />
            <Input
              label="Designation"
              value={form.designation}
              onChange={(e) => setField("designation", e.target.value)}
              placeholder="e.g. Founder & Director"
              error={errors.designation}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="sustain.process@gmail.com"
              error={errors.email}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="8735045762"
              error={errors.phone}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="e.g. Ahmedabad"
              error={errors.city}
              className="sm:col-span-1"
            />
          </div>

          <TextArea
            label="Full Address"
            value={form.fullAddress}
            onChange={(e) => setField("fullAddress", e.target.value)}
            placeholder="Complete postal address"
            error={errors.fullAddress}
            className="min-h-[90px]"
          />
          <TextArea
            label="Bio"
            value={form.bio}
            onChange={(e) => setField("bio", e.target.value)}
            placeholder="A short professional biography"
            error={errors.bio}
          />
        </form>
      </Modal>
    </div>
  );
}
