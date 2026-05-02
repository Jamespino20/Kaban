"use client";

import { useTransition, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Trash2,
  Download,
  Eye,
  Search,
  FileIcon,
  HardDrive,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSystemFiles, deleteSystemFile } from "@/actions/file-management";
import { toast } from "sonner";
import { format } from "date-fns";

export function SystemFileManagement({ tenantId }: { tenantId?: number }) {
  const [files, setFiles] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const fetchFiles = () => {
    startTransition(async () => {
      const result = await getSystemFiles(tenantId);
      if (result.success) {
        setFiles(result.data || []);
      } else {
        toast.error(result.error || "Failed to load files");
      }
    });
  };

  useEffect(() => {
    fetchFiles();
  }, [tenantId]);

  const handleDelete = async (fileId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this file? This action is permanent.",
      )
    )
      return;

    const result = await deleteSystemFile(fileId);
    if (result.success) {
      toast.success("File deleted successfully");
      fetchFiles();
    } else {
      toast.error(result.error || "Failed to delete file");
    }
  };

  const handleDownload = (file: any) => {
    try {
      const link = document.createElement("a");
      link.href = `data:${file.mime_type};base64,${file.content_base64}`;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to process download");
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      file.file_name.toLowerCase().includes(query.toLowerCase()) ||
      file.mime_type.toLowerCase().includes(query.toLowerCase()) ||
      (file.tenant?.name || "").toLowerCase().includes(query.toLowerCase()),
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isPending && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
        <HardDrive className="h-10 w-10 text-slate-200 animate-bounce" />
        <p className="text-slate-400 font-medium">Loading system files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name or type..."
            className="pl-10 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
            Total Access: {filteredFiles.length} files
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 border-dashed border-2">
          <FileText className="h-16 w-16 text-slate-100 mb-4" />
          <h3 className="text-lg font-display font-medium text-slate-400">
            No files found
          </h3>
          <p className="text-sm text-slate-300">
            Try adjusting your search query.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="group relative overflow-hidden border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 rounded-[1.75rem] p-5 bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <FileIcon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(file)}
                    className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:text-emerald-600"
                    title="Download File"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                    className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600"
                    title="Delete File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {file.file_name}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <Building className="h-3 w-3" />
                    <span>{file.tenant?.name || "Global"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider justify-end">
                    <User className="h-3 w-3" />
                    <span>{file.uploader?.username || "System"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {file.mime_type.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formatSize(file.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(file.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
