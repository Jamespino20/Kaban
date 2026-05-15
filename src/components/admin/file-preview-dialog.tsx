"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, X } from "lucide-react";

interface FilePreviewDialogProps {
  url: string;
  label?: string;
  className?: string;
  triggerVariant?: "link" | "button";
}

function getFileType(url: string): "image" | "pdf" | "unknown" {
  if (!url) return "unknown";
  if (url.startsWith("data:image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) return "image";
  if (url.startsWith("data:application/pdf") || /\.pdf$/i.test(url)) return "pdf";
  return "unknown";
}

function getFilename(url: string, label: string): string {
  if (url.startsWith("data:")) {
    const ext = url.split(";")[0].split("/")[1] || "file";
    return `${label.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
  }
  const parts = url.split("/");
  return parts[parts.length - 1] || label;
}

export function FilePreviewDialog({
  url,
  label = "Document",
  className,
  triggerVariant = "link",
}: FilePreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const fileType = getFileType(url);
  const filename = getFilename(url, label);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const trigger =
    triggerVariant === "button" ? (
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 rounded-xl text-xs ${className}`}
      >
        <Eye className="h-3.5 w-3.5" />
        {label}
      </Button>
    ) : (
      <button
        className={`inline-flex items-center gap-1 text-xs font-medium text-sky-600 underline underline-offset-2 hover:text-sky-800 transition-colors cursor-pointer ${className}`}
      >
        <Eye className="h-3 w-3" />
        {label}
      </button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-slate-800 truncate max-w-xs">
              {label}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 rounded-xl text-xs border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" />
              I-download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto bg-slate-100/50 p-4">
          {fileType === "image" ? (
            <div className="flex items-center justify-center min-h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={label}
                className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-md"
              />
            </div>
          ) : fileType === "pdf" ? (
            <iframe
              src={url}
              title={label}
              className="w-full rounded-xl border border-slate-200 bg-white"
              style={{ height: "60vh" }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <FileText className="h-12 w-12" />
              <p className="text-sm font-medium">
                Hindi ma-preview ang file na ito.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 rounded-xl text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                I-download ang {label}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
