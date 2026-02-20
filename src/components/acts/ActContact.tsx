"use client";

import { useState } from "react";
import { GlassPanel, Button, Input, Textarea } from "@/components/ui";
import { FadeInOnScroll } from "@/components/scroll";
import { Send, Github, Linkedin, Mail } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

export function ActContact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire up to API
    console.log("Contact form submitted:", formState);
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
                <Input
                  id="name"
                  label="Name"
                  placeholder="Your name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, name: e.target.value }))
                  }
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                />
                <Textarea
                  id="message"
                  label="Message"
                  placeholder="What's on your mind?"
                  value={formState.message}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, message: e.target.value }))
                  }
                />
                <Button type="submit" className="w-full gap-2">
                  <Send size={16} />
                  Send Message
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
                <a
                  href={SOCIAL_LINKS.email}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted">chenzhennba@gmail.com</p>
                  </div>
                </a>

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
