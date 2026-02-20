"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, Toggle } from "@/components/ui";
import { DataTable } from "@/components/admin";
import { Plus } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [timestampInitial, setTimestampInitial] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/blog").then((r) => r.json()),
      fetch("/api/admin/settings/showBlogTimestamp").then((r) => r.json()),
    ]).then(([d, s]) => {
      setPosts(d.data || []);
      setTimestampInitial(s.data?.value !== "false");
      setLoading(false);
    });
  }, []);

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "status",
      label: "Status",
      render: (p: Post) => (
        <Badge variant={p.status === "PUBLISHED" ? "accent" : "default"}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (p: Post) => new Date(p.updatedAt).toLocaleDateString(),
    },
  ];

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <Toggle label="Timestamps" initial={timestampInitial} settingKey="showBlogTimestamp" />
        </div>
        <Button onClick={() => router.push("/admin/blog/new")}>
          <Plus size={16} className="mr-2" />
          New Post
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={posts}
        onRowClick={(p) => router.push(`/admin/blog/${p.id}`)}
        emptyMessage="No blog posts yet."
      />
    </div>
  );
}
