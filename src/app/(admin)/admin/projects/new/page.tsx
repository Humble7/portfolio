"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { RichTextEditor, ImageUploader } from "@/components/admin";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    coverImage: "",
    youtubeUrl: "",
    githubUrl: "",
    liveUrl: "",
    tags: "",
    status: "DRAFT",
    featured: false,
  });

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          coverImage: form.coverImage || null,
          youtubeUrl: form.youtubeUrl || null,
          githubUrl: form.githubUrl || null,
          liveUrl: form.liveUrl || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/projects");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      <h1 className="text-3xl font-bold mb-8">New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <Input
          id="title"
          label="Title"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
        <Input
          id="slug"
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
        />
        <Textarea
          id="description"
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          required
        />

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Cover Image
          </label>
          <ImageUploader
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Content
          </label>
          <RichTextEditor
            content={form.content}
            onChange={(content) => setForm((f) => ({ ...f, content }))}
          />
        </div>

        <Input
          id="tags"
          label="Tags (comma-separated)"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="react, nextjs, typescript"
        />
        <Input
          id="youtubeUrl"
          label="YouTube URL"
          value={form.youtubeUrl}
          onChange={(e) =>
            setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
          }
        />
        <Input
          id="githubUrl"
          label="GitHub URL"
          value={form.githubUrl}
          onChange={(e) =>
            setForm((f) => ({ ...f, githubUrl: e.target.value }))
          }
        />
        <Input
          id="liveUrl"
          label="Live URL"
          value={form.liveUrl}
          onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
        />

        <div className="flex items-center gap-4">
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
              className="rounded"
            />
            <span className="text-sm">Featured</span>
          </label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Create Project"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
