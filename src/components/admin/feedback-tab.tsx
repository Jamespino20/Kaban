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
  const unresolvedCount = entries.filter(
    (entry) => entry.status !== "resolved",
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FeedbackMetric
          icon={<MessageSquareMore className="h-5 w-5 text-sky-600" />}
          label="Total Feedback"
          value={entries.length}
          tone="sky"
        />
        <FeedbackMetric
          icon={<Sparkles className="h-5 w-5 text-amber-600" />}
          label="Testimonial Leads"
          value={testimonialCount}
          tone="amber"
        />
        <FeedbackMetric
          icon={<RefreshCcw className="h-5 w-5 text-emerald-600" />}
          label="Open / In Review"
          value={unresolvedCount}
          tone="emerald"
        />
      </div>

      <div className="dashboard-card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Feedback Operations
            </p>
            <h3 className="text-xl font-display font-bold italic text-slate-900">
              Feedback Inbox
            </h3>
            <p className="text-sm text-slate-500">
              {role === "superadmin"
                ? "Cross-tenant feedback, concerns, and testimonial leads in a compact triage view."
                : "Feedback from your tenant and potential homepage stories."}
            </p>
          </div>

          <div className="dashboard-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Filtered Results
            </p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm font-black text-slate-900">
                {filteredEntries.length}{" "}
                {filteredEntries.length === 1 ? "entry" : "entries"}
              </span>
                <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-black text-white">
                {currentPage}/{totalPages}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.7fr_0.7fr]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, sender, or feedback content..."
            className="rounded-xl bg-white"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full rounded-xl bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
          <span className="font-bold text-slate-800">{unresolvedCount}</span>{" "}
          still need follow-up. Use filters for faster triage.
        </div>

        <div className="space-y-3">
          {paginatedEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No feedback entries at the moment.
            </div>
          ) : (
            paginatedEntries.map((entry) => (
              <FeedbackRow key={entry.id} entry={entry} />
            ))
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filteredEntries.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              -{Math.min(currentPage * pageSize, filteredEntries.length)}
            </span>{" "}
            ng{" "}
            <span className="font-bold text-slate-700">
              {filteredEntries.length}
            </span>{" "}
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
    <div className={`rounded-xl border p-4 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function FeedbackRow({ entry }: { entry: FeedbackItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (status: "open" | "in_review" | "resolved") => {
    startTransition(async () => {
      const res = await updateFeedbackEntryStatus({ id: entry.id, status });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill>{entry.category}</BadgePill>
            <BadgePill
              tone={entry.status === "resolved" ? "neutral" : "active"}
            >
              {entry.status}
            </BadgePill>
            {entry.tenant?.name ? (
              <BadgePill>{entry.tenant.name}</BadgePill>
            ) : null}
          </div>
          <p className="line-clamp-2 font-black text-slate-900">
            {entry.subject || "No subject"}
          </p>
          <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600 md:grid-cols-3">
            <MetaCell
              label="From"
              value={`${entry.name}${entry.email ? ` (${entry.email})` : ""}`}
            />
            <MetaCell label="Page" value={entry.page_path || "Not specified"} />
            <MetaCell
              label="Created"
              value={new Date(entry.created_at).toLocaleString()}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:max-w-[18rem] xl:justify-end">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              disabled={isPending || entry.status === option.value}
              onClick={() => handleUpdate(option.value)}
              className={`rounded-xl px-3 ${
                entry.status === option.value
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="dashboard-card p-4 text-sm text-slate-700 whitespace-pre-line">
        {entry.message}
      </div>
    </div>
  );
}

function BadgePill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "active" | "neutral";
}) {
  const toneClass = {
    default: "bg-white text-slate-600",
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="line-clamp-2 font-medium text-slate-700">{value}</p>
    </div>
  );
}
