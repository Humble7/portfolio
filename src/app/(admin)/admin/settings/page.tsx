"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import { Check, KeyRound } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [apiError, setApiError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required";
    if (form.newPassword.length < 8) errs.newPassword = "At least 8 characters";
    else if (form.newPassword === form.currentPassword)
      errs.newPassword = "Must be different from the current password";
    if (form.confirmPassword !== form.newPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("saving");
    setApiError("");
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("saved");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setApiError(data.error || "Failed to change password");
        setStatus("idle");
      }
    } catch {
      setApiError("Network error");
      setStatus("idle");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Settings</h1>

      <Card className="max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
            <KeyRound size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="text-xs text-muted">
              Use at least 8 characters. You stay signed in after the change.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="currentPassword"
            label="Current Password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            error={errors.currentPassword}
            onChange={set("currentPassword")}
          />
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            error={errors.newPassword}
            onChange={set("newPassword")}
          />
          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={set("confirmPassword")}
          />

          {apiError && <p className="text-sm text-red-600">{apiError}</p>}

          <Button type="submit" disabled={status === "saving"} className="gap-2">
            {status === "saving" ? (
              "Saving..."
            ) : status === "saved" ? (
              <>
                <Check size={16} />
                Password Changed
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
