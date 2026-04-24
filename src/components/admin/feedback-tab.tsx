"use client";

import { updateFeedbackEntryStatus } from "@/actions/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquareMore, RefreshCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

type FeedbackItem = {
  id: number;
  name: string;
  email: string | null;
  category: string;
  page_path: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: Date;
  tenant: { name: string } | null;
  user: { username: string | null; email: string | null } | null;
};

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
] as const;

export function FeedbackTab({
  role,
  entries,
}: {
  role: string;
  entries: FeedbackItem[];
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const testimonialCount = entries.filter(
    (entry) => entry.category === "testimonial",
  ).length;
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || entry.category === categoryFilter;
      const matchesQuery =
        query.trim().length === 0 ||
        entry.name.toLowerCase().includes(query.toLowerCase()) ||
        entry.message.toLowerCase().includes(query.toLowerCase()) ||
        (entry.subject || "").toLowerCase().includes(query.toLowerCase());

      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [entries, statusFilter, categoryFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, query]);

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeedbackMetric
          icon={<MessageSquareMore className="w-5 h-5 text-sky-600" />}
          label="Kabuuang Feedback"
          value={entries.length}
          tone="sky"
        />
        <FeedbackMetric
          icon={<Sparkles className="w-5 h-5 text-amber-600" />}
          label="Testimonial Leads"
          value={testimonialCount}
          tone="amber"
        />
        <FeedbackMetric
          icon={<RefreshCcw className="w-5 h-5 text-emerald-600" />}
          label="Open / In Review"
          value={
            entries.filter((entry) => entry.status !== "resolved").length
          }
          tone="emerald"
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 italic">
            Feedback Inbox
          </h3>
          <p className="text-sm text-slate-500">
            {role === "superadmin"
              ? "Tingnan ang cross-tenant feedback, concerns, at testimonial leads."
              : "Tingnan ang feedback mula sa inyong tenant at piliin ang puwedeng iangat bilang homepage stories."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_0.7fr_0.7fr]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hanapin ang subject, sender, o laman ng feedback..."
            className="rounded-xl bg-white"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full rounded-xl bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lahat ng category</SelectItem>
              <SelectItem value="testimonial">Testimonial</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="concern">Concern</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full rounded-xl bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lahat ng status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {paginatedEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Wala pang feedback entries sa ngayon.
            </div>
          ) : (
            paginatedEntries.map((entry) => <FeedbackRow key={entry.id} entry={entry} />)
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Ipinapakita ang{" "}
            <span className="font-bold text-slate-700">
              {filteredEntries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredEntries.length)}
            </span>{" "}
            ng <span className="font-bold text-slate-700">{filteredEntries.length}</span>{" "}
            entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-xl"
            >
              Previous
            </Button>
            <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackMetric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "sky" | "amber" | "emerald";
}) {
  const toneClass = {
    sky: "border-sky-200 bg-sky-50",
    amber: "border-amber-200 bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };

  return (
    <div className={`rounded-[1.75rem] border p-5 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function FeedbackRow({ entry }: { entry: FeedbackItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (status: "open" | "in_review" | "resolved") => {
    startTransition(async () => {
      const res = await updateFeedbackEntryStatus({ id: entry.id, status });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {entry.category}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {entry.status}
            </span>
            {entry.tenant?.name ? (
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {entry.tenant.name}
              </span>
            ) : null}
          </div>
          <p className="font-black text-slate-900">
            {entry.subject || "Walang subject"}
          </p>
          <p className="text-sm text-slate-500">
            Mula kay {entry.name}
            {entry.email ? ` (${entry.email})` : ""}
            {entry.page_path ? ` • ${entry.page_path}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              disabled={isPending || entry.status === option.value}
              onClick={() => handleUpdate(option.value)}
              className={`rounded-xl ${
                entry.status === option.value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 text-sm text-slate-700 border border-slate-200 whitespace-pre-line">
        {entry.message}
      </div>
    </div>
  );
}
