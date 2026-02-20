"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { DataTable } from "@/components/admin";
import { Plus } from "lucide-react";

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.data || []);
        setLoading(false);
      });
  }, []);

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "status",
      label: "Status",
      render: (p: Project) => (
        <Badge variant={p.status === "PUBLISHED" ? "accent" : "default"}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (p: Project) => (p.featured ? "Yes" : "No"),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (p: Project) =>
        new Date(p.updatedAt).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div className="text-muted">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => router.push("/admin/projects/new")}>
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
        emptyMessage="No projects yet. Create your first one!"
      />
    </div>
  );
}
