"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadsPage() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadUploads = async () => {
    const res = await fetch("/api/upload");
    const data = await res.json();
    if (data.data) setUploads(data.data);
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) {
      setUploads((prev) => [data.data, ...prev]);
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => handleUpload(file));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setUploads((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const copyUrl = (upload: UploadItem) => {
    navigator.clipboard.writeText(upload.url);
    setCopiedId(upload.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isImage = (mime: string) => mime.startsWith("image/");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Media Library</h1>

      {/* Upload zone */}
      <Card className="mb-8">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-10 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
            dragActive
              ? "border-accent bg-accent/5"
              : "border-white/10 hover:border-white/20"
          )}
        >
          <Upload size={28} className="text-muted" />
          <p className="text-sm text-muted">
            {uploading
              ? "Uploading..."
              : "Click or drag files here to upload"}
          </p>
          <p className="text-xs text-muted/60">
            Images and PDFs, max 10MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((file) => handleUpload(file));
            e.target.value = "";
          }}
        />
      </Card>

      {/* File list */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Files{" "}
            <span className="text-sm font-normal text-muted">
              ({uploads.length})
            </span>
          </h2>
        </div>

        {uploads.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">
            No files uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="group relative rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden"
              >
                {/* Preview */}
                <div className="aspect-square flex items-center justify-center bg-white/[0.02]">
                  {isImage(upload.mimeType) ? (
                    <img
                      src={upload.url}
                      alt={upload.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText size={36} className="text-muted" />
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p
                    className="text-xs font-medium truncate"
                    title={upload.filename}
                  >
                    {upload.filename}
                  </p>
                  <p className="text-xs text-muted">
                    {formatSize(upload.size)}
                  </p>
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(upload)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === upload.id ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/50 text-white transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
