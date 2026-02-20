"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { RichTextEditor, ImageUploader } from "@/components/admin";
import { ArrowLeft, Save } from "lucide-react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    status: "DRAFT",
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
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          coverImage: form.coverImage || null,
        }),
      });

      const data = await res.json();
      if (data.success) router.push("/admin/blog");
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
        Back to Blog
      </button>

      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>

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
          id="excerpt"
          label="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Brief summary for cards and SEO"
        />
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Cover Image</label>
          <ImageUploader
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Content</label>
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
        />
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Create Post"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
