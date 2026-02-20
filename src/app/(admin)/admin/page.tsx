import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { FolderKanban, FileText, Briefcase, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [projectCount, postCount, experienceCount, skillCount] =
    await Promise.all([
      prisma.project.count(),
      prisma.blogPost.count(),
      prisma.experience.count(),
      prisma.skill.count(),
    ]);

  const stats = [
    { label: "Projects", value: projectCount, icon: FolderKanban },
    { label: "Blog Posts", value: postCount, icon: FileText },
    { label: "Experiences", value: experienceCount, icon: Briefcase },
    { label: "Skills", value: skillCount, icon: GraduationCap },
  ];

  const recentProjects = await prisma.project.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  const recentPosts = await prisma.blogPost.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Icon size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <p className="text-muted text-sm">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm">{p.title}</span>
                  <span className="text-xs text-muted">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Recent Blog Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-muted text-sm">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm">{p.title}</span>
                  <span className="text-xs text-muted">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
