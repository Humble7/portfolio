"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { Plus, Trash2, Upload, FileText, X, Camera } from "lucide-react";

interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  logoUrl: string | null;
  companyUrl: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
}

interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

type Profile = {
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  avatarUrl: string;
  resumeUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
};

export default function ResumePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    title: "",
    bio: "",
    email: "",
    location: "",
    avatarUrl: "",
    resumeUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });
  const savedProfile = useRef<Profile>(profile);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resumeFilename, setResumeFilename] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/resume/profile").then((r) => r.json()),
      fetch("/api/resume/experience").then((r) => r.json()),
      fetch("/api/resume/education").then((r) => r.json()),
      fetch("/api/resume/skills").then((r) => r.json()),
    ]).then(async ([p, exp, edu, sk]) => {
      if (p.data) {
        const loaded: Profile = {
          name: p.data.name || "",
          title: p.data.title || "",
          bio: p.data.bio || "",
          email: p.data.email || "",
          location: p.data.location || "",
          avatarUrl: p.data.avatarUrl || "",
          resumeUrl: p.data.resumeUrl || "",
          linkedinUrl: p.data.linkedinUrl || "",
          githubUrl: p.data.githubUrl || "",
          websiteUrl: p.data.websiteUrl || "",
        };
        setProfile(loaded);
        savedProfile.current = loaded;
        if (p.data.resumeUrl) {
          const u = await fetch(`/api/upload/by-url?url=${encodeURIComponent(p.data.resumeUrl)}`).then((r) => r.json());
          if (u.data?.filename) setResumeFilename(u.data.filename);
        }
      }
      setExperiences(exp.data || []);
      setEducations(edu.data || []);
      setSkills(sk.data || []);
    });
  }, []);

  const saveProfile = useCallback(async (updated: Profile) => {
    // Skip if nothing changed
    if (JSON.stringify(updated) === JSON.stringify(savedProfile.current)) return;
    savedProfile.current = updated;
    await fetch("/api/resume/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updated,
        avatarUrl: updated.avatarUrl || null,
        resumeUrl: updated.resumeUrl || null,
        linkedinUrl: updated.linkedinUrl || null,
        githubUrl: updated.githubUrl || null,
        websiteUrl: updated.websiteUrl || null,
      }),
    });
  }, []);

  // Auto-save profile on blur
  const handleProfileBlur = () => saveProfile(profile);

  // Auto-save when avatar/resume URL changes (uploaded or removed)
  const updateProfileField = useCallback(
    (field: keyof Profile, value: string) => {
      setProfile((p) => {
        const updated = { ...p, [field]: value };
        saveProfile(updated);
        return updated;
      });
    },
    [saveProfile]
  );

  const addExperience = async () => {
    const res = await fetch("/api/resume/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: "New Company",
        role: "Role",
        startDate: new Date().toISOString(),
      }),
    });
    const d = await res.json();
    if (d.data) setExperiences((prev) => [...prev, d.data]);
  };

  const deleteExperience = async (id: string) => {
    await fetch(`/api/resume/experience/${id}`, { method: "DELETE" });
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const saveExperience = async (exp: Experience, patch: Partial<Experience>) => {
    const updated = { ...exp, ...patch };
    await fetch(`/api/resume/experience/${exp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: updated.company,
        role: updated.role,
        description: updated.description,
        logoUrl: updated.logoUrl,
        companyUrl: updated.companyUrl,
        location: updated.location,
        startDate: updated.startDate,
        endDate: updated.endDate,
        current: updated.current,
      }),
    });
    setExperiences((prev) =>
      prev.map((x) => (x.id === exp.id ? { ...x, ...patch } : x))
    );
  };

  const addEducation = async () => {
    const res = await fetch("/api/resume/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institution: "Institution",
        degree: "Degree",
        startDate: new Date().toISOString(),
      }),
    });
    const d = await res.json();
    if (d.data) setEducations((prev) => [...prev, d.data]);
  };

  const saveEducation = async (edu: Education, patch: Partial<Education>) => {
    const updated = { ...edu, ...patch };
    await fetch(`/api/resume/education/${edu.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institution: updated.institution,
        degree: updated.degree,
        field: updated.field,
        startDate: updated.startDate,
        endDate: updated.endDate,
      }),
    });
    setEducations((prev) =>
      prev.map((x) => (x.id === edu.id ? { ...x, ...patch } : x))
    );
  };

  const deleteEducation = async (id: string) => {
    await fetch(`/api/resume/education/${id}`, { method: "DELETE" });
    setEducations((prev) => prev.filter((e) => e.id !== id));
  };

  const addSkill = async () => {
    const res = await fetch("/api/resume/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Skill", category: "General" }),
    });
    const d = await res.json();
    if (d.data) setSkills((prev) => [...prev, d.data]);
  };

  const saveSkill = async (skill: SkillItem, patch: Partial<SkillItem>) => {
    const updated = { ...skill, ...patch };
    await fetch(`/api/resume/skills/${skill.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: updated.name,
        category: updated.category,
        proficiency: updated.proficiency,
      }),
    });
    setSkills((prev) =>
      prev.map((x) => (x.id === skill.id ? { ...x, ...patch } : x))
    );
  };

  const deleteSkill = async (id: string) => {
    await fetch(`/api/resume/skills/${id}`, { method: "DELETE" });
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl mb-8">Resume</h1>

      {/* Profile */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 hairline"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-foreground/[0.08] flex items-center justify-center border-2 hairline">
                  <Camera size={24} className="text-muted" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingAvatar(true);
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    const data = await res.json();
                    if (data.data?.url) {
                      updateProfileField("avatarUrl", data.data.url);
                    }
                    setUploadingAvatar(false);
                    e.target.value = "";
                  }}
                />
              </label>
              {profile.avatarUrl && (
                <button
                  onClick={() => updateProfileField("avatarUrl", "")}
                  className="absolute -top-1 -right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500/70 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="text-sm text-muted">
              {uploadingAvatar ? "Uploading..." : "Hover to change avatar"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="name" label="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} onBlur={handleProfileBlur} />
            <Input id="title" label="Title" value={profile.title} onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))} onBlur={handleProfileBlur} />
          </div>
          <Textarea id="bio" label="Bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} onBlur={handleProfileBlur} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="pemail" label="Email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} onBlur={handleProfileBlur} />
            <Input id="location" label="Location" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} onBlur={handleProfileBlur} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input id="linkedin" label="LinkedIn" value={profile.linkedinUrl} onChange={(e) => setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))} onBlur={handleProfileBlur} />
            <Input id="github" label="GitHub" value={profile.githubUrl} onChange={(e) => setProfile((p) => ({ ...p, githubUrl: e.target.value }))} onBlur={handleProfileBlur} />
            <Input id="website" label="Website" value={profile.websiteUrl} onChange={(e) => setProfile((p) => ({ ...p, websiteUrl: e.target.value }))} onBlur={handleProfileBlur} />
          </div>
        </div>
      </Card>

      {/* Resume PDF */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Resume PDF</h2>
        {profile.resumeUrl ? (
          <div className="flex items-center justify-between p-3 rounded-sm bg-foreground/[0.03] border hairline">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <FileText size={16} />
              {resumeFilename || "Resume.pdf"}
            </a>
            <button
              onClick={() => updateProfileField("resumeUrl", "")}
              className="p-1.5 text-muted hover:text-red-600 cursor-pointer"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted mb-3">No PDF uploaded yet.</p>
        )}
        <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-foreground/[0.08] hover:bg-foreground/20 text-sm cursor-pointer transition-colors">
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              const formData = new FormData();
              formData.append("file", file);
              const res = await fetch("/api/upload", { method: "POST", body: formData });
              const data = await res.json();
              if (data.data?.url) {
                updateProfileField("resumeUrl", data.data.url);
                setResumeFilename(file.name);
              }
              setUploading(false);
              e.target.value = "";
            }}
          />
        </label>
      </Card>

      {/* Experiences */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Experience</h2>
          <Button size="sm" variant="secondary" onClick={addExperience}>
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-3 rounded-sm bg-foreground/[0.03] border hairline space-y-2">
              <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="relative group shrink-0">
                  {exp.logoUrl ? (
                    <img
                      src={exp.logoUrl}
                      alt={`${exp.company} logo`}
                      className="w-10 h-10 rounded-sm object-contain bg-foreground/[0.04]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-foreground/[0.04] flex items-center justify-center text-xs text-muted">
                      Logo
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center rounded-sm bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload size={14} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
                        const uploadData = await uploadRes.json();
                        if (uploadData.data?.url) {
                          saveExperience(exp, { logoUrl: uploadData.data.url });
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {exp.logoUrl && (
                    <button
                      onClick={() => saveExperience(exp, { logoUrl: null })}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-500/70 transition-colors cursor-pointer hidden group-hover:block"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    type="text"
                    placeholder="Role"
                    defaultValue={exp.role}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val === exp.role) return;
                      saveExperience(exp, { role: val });
                    }}
                    className="w-full font-medium text-sm bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    defaultValue={exp.company}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val === exp.company) return;
                      saveExperience(exp, { company: val });
                    }}
                    className="w-full text-xs text-muted bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Location"
                      defaultValue={exp.location || ""}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val === (exp.location || "")) return;
                        saveExperience(exp, { location: val });
                      }}
                      className="flex-1 text-xs bg-transparent border-b hairline focus:border-accent/50 outline-none text-muted placeholder:text-white/20 pb-0.5"
                    />
                    <input
                      type="url"
                      placeholder="Company URL"
                      defaultValue={exp.companyUrl || ""}
                      onBlur={(e) => {
                        const url = e.target.value.trim();
                        if (url === (exp.companyUrl || "")) return;
                        saveExperience(exp, { companyUrl: url || null });
                      }}
                      className="flex-1 text-xs bg-transparent border-b hairline focus:border-accent/50 outline-none text-muted placeholder:text-white/20 pb-0.5"
                    />
                  </div>
                </div>
                <button onClick={() => deleteExperience(exp.id)} className="p-1.5 text-muted hover:text-red-600 cursor-pointer shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              {/* Description */}
              <textarea
                placeholder="Description"
                defaultValue={exp.description || ""}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val === (exp.description || "")) return;
                  saveExperience(exp, { description: val });
                }}
                rows={2}
                className="w-full text-xs bg-transparent border hairline rounded-sm px-2 py-1.5 focus:border-accent/50 outline-none text-muted placeholder:text-white/20 resize-none"
              />
              {/* Dates & Current */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <label className="text-xs text-muted">Start</label>
                  <input
                    type="date"
                    defaultValue={exp.startDate ? exp.startDate.slice(0, 10) : ""}
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      const iso = new Date(e.target.value).toISOString();
                      if (iso === exp.startDate) return;
                      saveExperience(exp, { startDate: iso });
                    }}
                    className="text-xs bg-transparent border hairline rounded px-1.5 py-0.5 text-muted focus:border-accent/50 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-muted">End</label>
                  <input
                    type="date"
                    defaultValue={exp.endDate ? exp.endDate.slice(0, 10) : ""}
                    disabled={exp.current}
                    onBlur={(e) => {
                      const val = e.target.value || null;
                      const iso = val ? new Date(val).toISOString() : null;
                      if (iso === exp.endDate) return;
                      saveExperience(exp, { endDate: iso });
                    }}
                    className="text-xs bg-transparent border hairline rounded px-1.5 py-0.5 text-muted focus:border-accent/50 outline-none disabled:opacity-30"
                  />
                </div>
                <label className="flex items-center gap-1 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => {
                      const current = e.target.checked;
                      saveExperience(exp, { current, endDate: current ? null : exp.endDate });
                    }}
                    className="accent-accent"
                  />
                  Current
                </label>
              </div>
            </div>
          ))}
          {experiences.length === 0 && <p className="text-sm text-muted">No experiences added.</p>}
        </div>
      </Card>

      {/* Education */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <Button size="sm" variant="secondary" onClick={addEducation}>
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {educations.map((edu) => (
            <div key={edu.id} className="p-3 rounded-sm bg-foreground/[0.03] border hairline space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    placeholder="Degree"
                    defaultValue={edu.degree}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val === edu.degree) return;
                      saveEducation(edu, { degree: val });
                    }}
                    className="w-full font-medium text-sm bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    defaultValue={edu.institution}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val === edu.institution) return;
                      saveEducation(edu, { institution: val });
                    }}
                    className="w-full text-xs text-muted bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Field of study"
                    defaultValue={edu.field || ""}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val === (edu.field || "")) return;
                      saveEducation(edu, { field: val });
                    }}
                    className="w-full text-xs text-muted bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                  />
                </div>
                <button onClick={() => deleteEducation(edu.id)} className="p-1.5 text-muted hover:text-red-600 cursor-pointer shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <label className="text-xs text-muted">Start</label>
                  <input
                    type="date"
                    defaultValue={edu.startDate ? edu.startDate.slice(0, 10) : ""}
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      const iso = new Date(e.target.value).toISOString();
                      if (iso === edu.startDate) return;
                      saveEducation(edu, { startDate: iso });
                    }}
                    className="text-xs bg-transparent border hairline rounded px-1.5 py-0.5 text-muted focus:border-accent/50 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-muted">End</label>
                  <input
                    type="date"
                    defaultValue={edu.endDate ? edu.endDate.slice(0, 10) : ""}
                    onBlur={(e) => {
                      const val = e.target.value || null;
                      const iso = val ? new Date(val).toISOString() : null;
                      if (iso === edu.endDate) return;
                      saveEducation(edu, { endDate: iso });
                    }}
                    className="text-xs bg-transparent border hairline rounded px-1.5 py-0.5 text-muted focus:border-accent/50 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {educations.length === 0 && <p className="text-sm text-muted">No education added.</p>}
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <Button size="sm" variant="secondary" onClick={addSkill}>
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-3 p-3 rounded-sm bg-foreground/[0.03] border hairline">
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  type="text"
                  placeholder="Skill name"
                  defaultValue={skill.name}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val === skill.name) return;
                    saveSkill(skill, { name: val });
                  }}
                  className="w-full font-medium text-sm bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                />
                <input
                  type="text"
                  placeholder="Category"
                  defaultValue={skill.category}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val === skill.category) return;
                    saveSkill(skill, { category: val });
                  }}
                  className="w-full text-xs text-muted bg-transparent border-b hairline focus:border-accent/50 outline-none placeholder:text-white/20 pb-0.5"
                />
              </div>
              <button onClick={() => deleteSkill(skill.id)} className="p-1.5 text-muted hover:text-red-600 cursor-pointer shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {skills.length === 0 && <p className="text-sm text-muted">No skills added.</p>}
        </div>
      </Card>
    </div>
  );
}
