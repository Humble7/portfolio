"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

interface Section {
  title: string;
  fields: { key: string; label: string; multiline?: boolean }[];
}

const SECTIONS: Section[] = [
  {
    title: "Hero",
    fields: [
      { key: "hero.title1", label: "Title Line 1" },
      { key: "hero.title2", label: "Title Line 2" },
      { key: "hero.subtitle", label: "Subtitle", multiline: true },
    ],
  },
  {
    title: "Experience",
    fields: [
      { key: "engineer.label", label: "Section Label" },
      { key: "engineer.heading", label: "Heading" },
    ],
  },
  {
    title: "Skills",
    fields: [
      { key: "builder.label", label: "Section Label" },
      { key: "builder.heading", label: "Heading" },
      { key: "builder.paragraph1", label: "Paragraph 1 (use {keyword} for highlights)", multiline: true },
      { key: "builder.paragraph2", label: "Paragraph 2 (use {keyword} for highlights)", multiline: true },
    ],
  },
  {
    title: "Projects",
    fields: [
      { key: "projects.label", label: "Section Label" },
      { key: "projects.heading", label: "Heading" },
    ],
  },
  {
    title: "Vision",
    fields: [
      { key: "vision.label", label: "Section Label" },
      { key: "vision.heading", label: "Heading (use {word} for gradient)" },
      { key: "vision.description", label: "Description", multiline: true },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "contact.label", label: "Section Label" },
      { key: "contact.heading", label: "Heading (use {word} for gradient)" },
      { key: "contact.description", label: "Description", multiline: true },
    ],
  },
];

export default function ContentPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    // Fetch all content settings
    const allKeys = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));
    Promise.all(
      allKeys.map((key) =>
        fetch(`/api/admin/settings/content.${key}`)
          .then((r) => r.json())
          .then((d) => ({ key, value: d.data?.value ?? "" }))
      )
    ).then((results) => {
      const map: Record<string, string> = {};
      for (const r of results) map[r.key] = r.value;
      setValues(map);
      setLoading(false);
    });
  }, []);

  const save = async (key: string) => {
    setSaving((s) => ({ ...s, [key]: true }));
    await fetch(`/api/admin/settings/content.${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: values[key] }),
    });
    setSaving((s) => ({ ...s, [key]: false }));
    setSaved((s) => ({ ...s, [key]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
  };

  const seedDefaults = async () => {
    setSeeding(true);
    const res = await fetch("/api/site-content/seed", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      // Reload values
      window.location.reload();
    }
    setSeeding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50";

  const hasAnyValues = Object.values(values).some((v) => v);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Site Content</h1>
          <p className="text-sm text-muted mt-1">
            Edit homepage section text. Changes take effect within 60 seconds.
          </p>
        </div>
        {!hasAnyValues && (
          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="px-4 py-2 text-sm bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Load Defaults"}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-muted mb-1">{field.label}</label>
                  <div className="flex gap-2">
                    {field.multiline ? (
                      <textarea
                        value={values[field.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                        onBlur={() => save(field.key)}
                        rows={3}
                        className={inputClass}
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[field.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                        onBlur={() => save(field.key)}
                        className={inputClass}
                      />
                    )}
                    <div className="w-16 flex items-start justify-center pt-2">
                      {saving[field.key] ? (
                        <span className="text-xs text-muted">Saving...</span>
                      ) : saved[field.key] ? (
                        <span className="text-xs text-green-400">Saved</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
