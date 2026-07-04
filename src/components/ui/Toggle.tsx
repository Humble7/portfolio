"use client";

import { useState } from "react";

interface ToggleProps {
  label: string;
  initial: boolean;
  settingKey: string;
}

export function Toggle({ label, initial, settingKey }: ToggleProps) {
  const [enabled, setEnabled] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const next = !enabled;
    try {
      const res = await fetch(`/api/admin/settings/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: next }),
      });
      if (res.ok) setEnabled(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
    >
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${
          enabled ? "bg-accent" : "bg-foreground/20"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? "translate-x-4" : ""
          }`}
        />
      </div>
      <span>{label}</span>
    </button>
  );
}
