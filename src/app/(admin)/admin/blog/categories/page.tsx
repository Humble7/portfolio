"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, Plus, Trash2, Check, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = () =>
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.data || []);
        setLoading(false);
      });

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/blog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setNewName("");
      fetchCategories();
    } else {
      alert(data.error);
    }
    setAdding(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/blog/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingId(null);
      fetchCategories();
    } else {
      alert(data.error);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? Posts using it will be reset to "General".`)) return;
    await fetch(`/api/blog/categories/${cat.id}`, { method: "DELETE" });
    fetchCategories();
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <button
        onClick={() => router.push("/admin/blog")}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Blog
      </button>

      <h1 className="font-serif text-4xl mb-8">Manage Categories</h1>

      {/* Add new category */}
      <div className="flex gap-3 mb-8 max-w-md">
        <Input
          id="new-category"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={adding || !newName.trim()}>
          <Plus size={16} className="mr-2" />
          Add
        </Button>
      </div>

      {/* Category list */}
      <div className="space-y-2 max-w-md">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3 rounded-sm bg-foreground/[0.04] border hairline"
          >
            {editingId === cat.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(cat.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-foreground/[0.04] border hairline rounded-sm px-3 py-1.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdate(cat.id)}
                  className="text-green-400 hover:text-green-300 cursor-pointer"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-muted hover:text-foreground cursor-pointer"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 text-sm cursor-pointer hover:text-accent"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditName(cat.name);
                  }}
                >
                  {cat.name}
                </span>
                <button
                  onClick={() => handleDelete(cat)}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-muted text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
