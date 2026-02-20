import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { Navbar, Footer } from "@/components/layout";
import { Briefcase, GraduationCap, Code, MapPin, Mail, Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "Professional experience, education, and skills.",
};

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const [profile, experiences, educations, skills] = await Promise.all([
    prisma.resumeProfile.findFirst(),
    prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] }),
    prisma.education.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] }),
    prisma.skill.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
  ]);

  let resumeFilename: string | null = null;
  if (profile?.resumeUrl) {
    const upload = await prisma.upload.findFirst({ where: { url: profile.resumeUrl } });
    resumeFilename = upload?.filename ?? null;
  }

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          {profile && (
            <div className="mb-16">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white/10 mb-6"
                />
              )}
              <h1 className="text-5xl md:text-6xl font-bold mb-2">{profile.name}</h1>
              <p className="text-xl text-accent mb-4">{profile.title}</p>
              <p className="text-muted leading-relaxed max-w-2xl mb-4">{profile.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {profile.location}
                  </span>
                )}
                {profile.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {profile.email}
                  </span>
                )}
              </div>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  download={resumeFilename || "resume.pdf"}
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-accent/15 text-accent hover:bg-accent/25 text-sm font-medium transition-colors"
                >
                  <Download size={16} />
                  Download Resume
                </a>
              )}
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Briefcase size={22} className="text-accent" />
                <h2 className="text-2xl font-bold">Experience</h2>
              </div>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <Card key={exp.id}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{exp.role}</h3>
                        <p className="text-accent text-sm">{exp.company}</p>
                      </div>
                      <p className="text-xs text-muted whitespace-nowrap">
                        {new Date(exp.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        —{" "}
                        {exp.current
                          ? "Present"
                          : exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-muted leading-relaxed">{exp.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {educations.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap size={22} className="text-accent" />
                <h2 className="text-2xl font-bold">Education</h2>
              </div>
              <div className="space-y-6">
                {educations.map((edu) => (
                  <Card key={edu.id}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{edu.degree}</h3>
                        <p className="text-accent text-sm">{edu.institution}</p>
                        {edu.field && <p className="text-xs text-muted mt-1">{edu.field}</p>}
                      </div>
                      <p className="text-xs text-muted whitespace-nowrap">
                        {new Date(edu.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        —{" "}
                        {edu.endDate
                          ? new Date(edu.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Present"}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Code size={22} className="text-accent" />
                <h2 className="text-2xl font-bold">Skills</h2>
              </div>
              <div className="space-y-8">
                {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {catSkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="glass rounded-xl px-4 py-2 text-sm"
                        >
                          {skill.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
