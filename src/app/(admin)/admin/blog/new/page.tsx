"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { RichTextEditor, ImageUploader } from "@/components/admin";
import { ArrowLeft, Save } from "lucide-react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    category: "General",
    status: "DRAFT",
  });

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => { if (r.ok) return r.json(); })
      .then((d) => { if (d?.data) setCategories(d.data); });
  }, []);

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
      else setSaveError(data.error || "Save failed");
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

      <h1 className="font-serif text-4xl mb-8">New Blog Post</h1>

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
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-sm bg-foreground/[0.04] border hairline px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-sm bg-foreground/[0.04] border hairline px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {saveError && (
          <p className="text-sm text-red-600">{saveError}</p>
        )}

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
