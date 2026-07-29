import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../lib/api";
import { PageHeader, Card, Button, Input } from "../components/ui";
import { Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";

export default function ChangePassword() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: (body: any) => apiPost("/admin/auth/change-password", body),
    onSuccess: () => {
      toast.success("Password updated successfully! Please log in again.");
      logout();
      setLocation("/admin/login");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    mutation.mutate({ oldPassword, newPassword });
  };

  return (
    <div>
      <PageHeader
        title="Change Password"
        description="Update your administrator login password."
      />

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--color-primary)]" />
            Update Password
          </h3>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <Button
              type="submit"
              loading={mutation.isPending}
              className="w-full mt-2"
            >
              <Save className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
