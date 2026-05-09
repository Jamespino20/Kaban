"use client";

import { useEffect, useState, useTransition } from "react";
import { getSystemFiles, deleteSystemFile } from "@/actions/file-management";
import {
  FileText,
  Trash2,
  Download,
  Eye,
  Search,
  Filter,
  FileIcon,
  Calendar,
  User as UserIcon,
  Building2,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GlobalFileView({ tenantId }: { tenantId?: number }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();

  const fetchFiles = async () => {
    setLoading(true);
    const result = await getSystemFiles(tenantId);
    if (result.success) {
      setFiles(result.data || []);
    } else {
      toast.error("Failed to retrieve the list of files.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [tenantId]);

  const handleDelete = (id: string) => {
    if (!confirm("Sigurado ka bang nais mong burahin ang file na ito?")) return;

    startDeleteTransition(async () => {
      const result = await deleteSystemFile(id);
      if (result.success) {
        toast.success("File deleted successfully.");
        fetchFiles();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDownload = (file: any) => {
    const link = document.createElement("a");
    link.href = file.content_base64;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFiles = files.filter(
    (f) =>
      f.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.uploader?.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Maghanap ng file, tenant, o uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            className="rounded-xl h-10"
          >
            Refresh
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-sm font-medium">
            <HardDrive className="h-4 w-4" />
            <span>{files.length} Files</span>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] font-bold text-slate-700">
                File Name
              </TableHead>
              <TableHead className="font-bold text-slate-700">
                Tenant / Tenant
              </TableHead>
              <TableHead className="font-bold text-slate-700">
                Uploader
              </TableHead>
              <TableHead className="font-bold text-slate-700">
                Date Uploaded
              </TableHead>
              <TableHead className="font-bold text-slate-700">Size</TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-400"
                >
                  Loading files...
                </TableCell>
              </TableRow>
            ) : filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-400"
                >
                  Walang nakitang files.
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((file) => (
                <TableRow key={file.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">
                          {file.file_name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {file.mime_type}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4 opacity-70" />
                      <span>{file.tenant?.name || "Global / System"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <UserIcon className="h-4 w-4 opacity-70" />
                      <span>{file.uploader?.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>
                        {format(
                          new Date(file.created_at),
                          "MMM d, yyyy h:mm a",
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-sm">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file)}
                        className="h-9 w-9 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id)}
                        disabled={isDeleting}
                        className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
