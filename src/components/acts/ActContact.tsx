"use client";

import { useState } from "react";
import { GlassPanel, Button, Input, Textarea } from "@/components/ui";
import { FadeInOnScroll } from "@/components/scroll";
import { Send, Github, Linkedin, Mail, Check, AlertCircle, Copy } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

const EMAIL = "chenzhennba@gmail.com";

export function ActContact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailCopied, setEmailCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const validate = (): boolean => {
    const errs: typeof errors = {};
    const { name, email, message } = formState;

    if (!name.trim()) errs.name = "Name is required";
    else if (name.length > 100) errs.name = "Name is too long (max 100)";

    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";

    if (!message.trim()) errs.message = "Message is required";
    else if (message.length > 2000) errs.message = "Message is too long (max 2000)";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation — avoid unnecessary API calls
    if (!validate()) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, website: honeypot }),
      });

      if (res.ok) {
        setStatus("sent");
        setFormState({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        const json = await res.json();
        setErrorMsg(json.error || "Failed to send");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section className="min-h-screen py-32 px-6" id="contact">
      <div className="max-w-4xl mx-auto">
        <FadeInOnScroll>
          <p className="text-accent text-sm uppercase tracking-widest mb-4 text-center">
            Get in Touch
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-16">
            Let&apos;s build something{" "}
            <span className="text-gradient">together</span>.
          </h2>
        </FadeInOnScroll>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeInOnScroll direction="left" delay={0.1}>
            <GlassPanel hover3d className="h-full p-8">
              <h3 className="text-xl font-semibold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field — hidden from real users, bots fill it */}
                <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                  <input
                    type="text"
                    name="website"
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                <Input
                  id="name"
                  label="Name"
                  placeholder="Your name"
                  required
                  maxLength={100}
                  value={formState.name}
                  error={errors.name}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, name: e.target.value }));
                    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                  }}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formState.email}
                  error={errors.email}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, email: e.target.value }));
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                  }}
                />
                <Textarea
                  id="message"
                  label="Message"
                  placeholder="What's on your mind?"
                  required
                  maxLength={2000}
                  value={formState.message}
                  error={errors.message}
                  onChange={(e) => {
                    setFormState((s) => ({ ...s, message: e.target.value }));
                    if (errors.message) setErrors((e) => ({ ...e, message: undefined }));
                  }}
                />
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={status === "sending" || status === "sent"}
                >
                  {status === "sending" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-current" />
                      Sending...
                    </>
                  ) : status === "sent" ? (
                    <>
                      <Check size={16} />
                      Message Sent!
                    </>
                  ) : status === "error" ? (
                    <>
                      <AlertCircle size={16} />
                      {errorMsg || "Failed — Try Again"}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </GlassPanel>
          </FadeInOnScroll>

          <FadeInOnScroll direction="right" delay={0.2}>
            <GlassPanel hover3d className="h-full p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-6">Connect</h3>
                <p className="text-muted leading-relaxed mb-8">
                  I&apos;m always interested in hearing about new projects,
                  opportunities, and ideas. Whether you want to collaborate or
                  just say hello, I&apos;d love to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(EMAIL);
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2000);
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group w-full text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    {emailCopied ? (
                      <Check size={18} className="text-green-400" />
                    ) : (
                      <Mail size={18} className="text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {emailCopied ? "Copied!" : "Email"}
                    </p>
                    <p className="text-xs text-muted">{EMAIL}</p>
                  </div>
                </button>

                <a
                  href={SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Github size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">GitHub</p>
                    <p className="text-xs text-muted">github.com/Humble7</p>
                  </div>
                </a>

                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Linkedin size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">LinkedIn</p>
                    <p className="text-xs text-muted">linkedin.com/in/humble7</p>
                  </div>
                </a>
              </div>
            </GlassPanel>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}
