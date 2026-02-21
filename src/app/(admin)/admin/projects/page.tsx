"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { DataTable } from "@/components/admin";
import { Plus, GripVertical } from "lucide-react";
import { Reorder } from "motion/react";

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
  const [reorderMode, setReorderMode] = useState(false);
  const [orderedProjects, setOrderedProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);

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

  const enterReorderMode = () => {
    setOrderedProjects([...projects]);
    setReorderMode(true);
  };

  const cancelReorder = () => {
    setReorderMode(false);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: orderedProjects.map((p) => p.id) }),
      });
      if (res.ok) {
        setProjects(orderedProjects);
        setReorderMode(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-2">
          {!reorderMode && (
            <Button variant="secondary" onClick={enterReorderMode}>
              Reorder
            </Button>
          )}
          <Button onClick={() => router.push("/admin/projects/new")}>
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {reorderMode ? (
        <div>
          <Reorder.Group
            axis="y"
            values={orderedProjects}
            onReorder={setOrderedProjects}
            className="space-y-2"
          >
            {orderedProjects.map((project) => (
              <Reorder.Item
                key={project.id}
                value={project}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={16} className="text-muted shrink-0" />
                <span className="font-medium flex-1">{project.title}</span>
                <Badge
                  variant={
                    project.status === "PUBLISHED" ? "accent" : "default"
                  }
                >
                  {project.status}
                </Badge>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <div className="flex gap-2 mt-4">
            <Button onClick={saveOrder} disabled={saving}>
              {saving ? "Saving..." : "Save Order"}
            </Button>
            <Button variant="secondary" onClick={cancelReorder} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
          emptyMessage="No projects yet. Create your first one!"
        />
      )}
    </div>
  );
}
