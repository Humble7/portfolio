"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Clock } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success) setMessages(json.data);
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  };

  const toggleRead = async (msg: Message) => {
    const res = await fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
      );
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected === id) setSelected(null);
    }
  };

  const selectedMsg = messages.find((m) => m.id === selected);
  const unreadCount = messages.filter((m) => !m.read).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted mt-1">
            {messages.length} total{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Mail size={48} className="mx-auto mb-4 opacity-30" />
          <p>No messages yet</p>
          <p className="text-sm mt-1">Messages from your contact form will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Message list */}
          <div className="lg:col-span-2 space-y-1 max-h-[70vh] overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelected(msg.id);
                  if (!msg.read) toggleRead(msg);
                }}
                className={`w-full text-left p-4 rounded-xl transition-colors cursor-pointer ${
                  selected === msg.id
                    ? "bg-accent/10 border border-accent/20"
                    : "hover:bg-white/5 border border-transparent"
                } ${!msg.read ? "bg-white/[0.03]" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!msg.read && (
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                      <p className={`text-sm truncate ${!msg.read ? "font-semibold" : ""}`}>
                        {msg.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">{msg.email}</p>
                    <p className="text-xs text-muted truncate mt-1">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted shrink-0 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selectedMsg ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMsg.name}</h3>
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="text-sm text-accent hover:underline"
                    >
                      {selectedMsg.email}
                    </a>
                    <p className="text-xs text-muted mt-1">
                      {new Date(selectedMsg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRead(selectedMsg)}
                      className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-colors cursor-pointer"
                      title={selectedMsg.read ? "Mark as unread" : "Mark as read"}
                    >
                      {selectedMsg.read ? <MailOpen size={18} /> : <Mail size={18} />}
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMsg.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {selectedMsg.message}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: Message from your portfolio`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm"
                  >
                    <Mail size={14} />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted text-sm">
                Select a message to read
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
