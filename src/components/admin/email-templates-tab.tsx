"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  renderEmailTemplate,
} from "@/actions/email-template-actions";

const CATEGORIES = [
  "verification",
  "security",
  "loan",
  "repayment",
  "wallet",
  "support",
  "report",
  "announcement",
  "onboarding",
  "system",
] as const;

type Template = {
  id: number;
  tenant_id: number | null;
  category: string;
  slug: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  variables: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type FormState = {
  category: string;
  slug: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string;
};

const emptyForm: FormState = {
  category: "system",
  slug: "",
  subject: "",
  html_body: "",
  text_body: "",
  variables: "",
};

export function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    const res = await getEmailTemplates();
    if (res.success && res.data) {
      setTemplates(res.data as unknown as Template[]);
    } else {
      toast.error(res.error || "Failed to load templates");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (t: Template) => {
    setForm({
      category: t.category,
      slug: t.slug,
      subject: t.subject,
      html_body: t.html_body,
      text_body: t.text_body || "",
      variables: t.variables.join(", "),
    });
    setEditingId(t.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.subject || !form.html_body) {
      toast.error("Slug, subject, and HTML body are required");
      return;
    }
    setIsSaving(true);
    const variables = form.variables
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (editingId) {
      const res = await updateEmailTemplate(editingId, {
        category: form.category,
        slug: form.slug,
        subject: form.subject,
        html_body: form.html_body,
        text_body: form.text_body || undefined,
        variables,
      });
      if (res.success) {
        toast.success("Template updated");
        setDialogOpen(false);
        loadTemplates();
      } else {
        toast.error(res.error || "Failed to update");
      }
    } else {
      const res = await createEmailTemplate({
        category: form.category,
        slug: form.slug,
        subject: form.subject,
        html_body: form.html_body,
        text_body: form.text_body || undefined,
        variables,
      });
      if (res.success) {
        toast.success("Template created");
        setDialogOpen(false);
        loadTemplates();
      } else {
        toast.error(res.error || "Failed to create");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    const res = await deleteEmailTemplate(id);
    if (res.success) {
      toast.success("Template deleted");
      setDeleteConfirmId(null);
      loadTemplates();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const handleToggleActive = async (t: Template) => {
    const res = await updateEmailTemplate(t.id, { is_active: !t.is_active });
    if (res.success) {
      loadTemplates();
    } else {
      toast.error(res.error || "Failed to update");
    }
  };

  const handlePreview = async (t: Template) => {
    const sampleVars: Record<string, string> = {};
    for (const v of t.variables) {
      sampleVars[v] = `{{${v}}}`;
    }
    const res = await renderEmailTemplate(t.slug, sampleVars);
    if (res.success && res.data) {
      setPreviewSubject(res.data.subject);
      setPreviewHtml(res.data.html);
      setPreviewId(t.id);
    } else {
      toast.error(res.error || "Failed to render preview");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            Email Templates
          </CardTitle>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Template
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-pulse text-slate-400">
                Loading templates...
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No email templates yet. Click &quot;Add Template&quot; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Slug
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Active
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Variables
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {t.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-sm text-slate-700">
                          {t.slug}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-600 max-w-[260px] truncate">
                        {t.subject}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(t)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            t.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {t.is_active ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {t.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs text-slate-500">
                          {t.variables.length}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handlePreview(t)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Email Template" : "Add Email Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Slug
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. loan_approved"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Subject
              </label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Email subject line"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                HTML Body
              </label>
              <Textarea
                value={form.html_body}
                onChange={(e) =>
                  setForm({ ...form, html_body: e.target.value })
                }
                placeholder="<html>...</html>"
                className="min-h-[200px] font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Text Body (optional)
              </label>
              <Textarea
                value={form.text_body}
                onChange={(e) =>
                  setForm({ ...form, text_body: e.target.value })
                }
                placeholder="Plain text fallback"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Variables (comma-separated)
              </label>
              <Input
                value={form.variables}
                onChange={(e) =>
                  setForm({ ...form, variables: e.target.value })
                }
                placeholder="member_name, loan_amount, due_date"
              />
              <p className="text-xs text-slate-400">
                Use {"{{variable_name}}"} in the HTML body to reference these.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Update Template"
                    : "Create Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewId(null);
            setPreviewHtml(null);
            setPreviewSubject(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          {previewSubject && (
            <div className="text-sm font-medium text-slate-600 mb-2">
              Subject: {previewSubject}
            </div>
          )}
          {previewHtml && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs text-slate-500 font-mono">
                HTML Preview
              </div>
              <div
                className="p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This action cannot be undone. Are you sure you want to delete this
            email template?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmId !== null) handleDelete(deleteConfirmId);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
