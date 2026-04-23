"use client";

import {
  deleteHomepageFaq,
  deleteHomepageTestimonial,
  reviewHomepageFaqProposal,
  reviewHomepageTestimonialProposal,
  submitHomepageFaqProposal,
  submitHomepageTestimonialProposal,
} from "@/actions/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeCheck, Clock3, FileStack, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

type HomepageFaqRecord = {
  id: number;
  tenant_id: number | null;
  question: string;
  answer: string;
  season_tag: string | null;
  workflow_status: string;
  review_notes: string | null;
  sort_order: number;
  is_active: boolean;
};

type HomepageTestimonialRecord = {
  id: number;
  tenant_id: number | null;
  name: string;
  role_label: string;
  photo_url: string | null;
  content: string;
  season_tag: string | null;
  workflow_status: string;
  review_notes: string | null;
  sort_order: number;
  is_active: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  pending_superadmin_review: "Pending Superadmin Review",
  published: "Published",
  rejected: "Rejected",
};

export function HomepageContentTab({
  role,
  faqs,
  testimonials,
}: {
  role: string;
  faqs: HomepageFaqRecord[];
  testimonials: HomepageTestimonialRecord[];
}) {
  const faqGroups = useMemo(() => groupByStatus(faqs), [faqs]);
  const testimonialGroups = useMemo(
    () => groupByStatus(testimonials),
    [testimonials],
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WorkflowSummaryCard
          icon={<Clock3 className="w-5 h-5 text-amber-600" />}
          label="Pending FAQs"
          value={faqGroups.pending.length}
          tone="amber"
        />
        <WorkflowSummaryCard
          icon={<FileStack className="w-5 h-5 text-blue-600" />}
          label="Pending Testimonials"
          value={testimonialGroups.pending.length}
          tone="blue"
        />
        <WorkflowSummaryCard
          icon={<BadgeCheck className="w-5 h-5 text-emerald-600" />}
          label="Published Entries"
          value={faqGroups.published.length + testimonialGroups.published.length}
          tone="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ContentSectionCard
          title={role === "superadmin" ? "FAQ Moderation" : "FAQ Proposals"}
          description={
            role === "superadmin"
              ? "I-review at i-publish ang mga FAQ na isinumite ng admins."
              : "Magpasa ng seasonal at relevant na FAQs para sa homepage."
          }
        >
          <FaqEditor role={role} />
          <ContentList
            role={role}
            type="faq"
            pending={faqGroups.pending}
            rejected={faqGroups.rejected}
            published={faqGroups.published}
          />
        </ContentSectionCard>

        <ContentSectionCard
          title={
            role === "superadmin"
              ? "Testimonial Moderation"
              : "Testimonial Proposals"
          }
          description={
            role === "superadmin"
              ? "I-finalize at i-publish ang piniling testimonials."
              : "I-curate ang testimonials mula sa feedback at tenant stories."
          }
        >
          <TestimonialEditor role={role} />
          <ContentList
            role={role}
            type="testimonial"
            pending={testimonialGroups.pending}
            rejected={testimonialGroups.rejected}
            published={testimonialGroups.published}
          />
        </ContentSectionCard>
      </div>
    </div>
  );
}

function groupByStatus<T extends { workflow_status: string }>(records: T[]) {
  return {
    pending: records.filter(
      (record) => record.workflow_status === "pending_superadmin_review",
    ),
    rejected: records.filter((record) => record.workflow_status === "rejected"),
    published: records.filter((record) => record.workflow_status === "published"),
  };
}

function WorkflowSummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "amber" | "blue" | "emerald";
}) {
  const tones = {
    amber: "border-amber-200 bg-amber-50",
    blue: "border-blue-200 bg-blue-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };

  return (
    <div className={`rounded-[1.75rem] border p-5 ${tones[tone]}`}>
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

function ContentSectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-bold text-slate-900 italic">
          {title}
        </h3>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ContentList({
  role,
  type,
  pending,
  rejected,
  published,
}: {
  role: string;
  type: "faq" | "testimonial";
  pending: any[];
  rejected: any[];
  published: any[];
}) {
  const sections = [
    { label: "Pending", items: pending },
    { label: "Rejected", items: rejected },
    { label: "Published", items: published },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.label} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {section.label}
            </h4>
            <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-500">
              {section.items.length}
            </span>
          </div>
          {section.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Wala pang entries dito.
            </div>
          ) : (
            section.items.map((item) => (
              <ContentRecordCard
                key={item.id}
                role={role}
                type={type}
                item={item}
              />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

function ContentRecordCard({
  role,
  type,
  item,
}: {
  role: string;
  type: "faq" | "testimonial";
  item: any;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reviewNotes, setReviewNotes] = useState(item.review_notes ?? "");

  const handleReview = (action: "publish" | "reject") => {
    if (role !== "superadmin") return;

    startTransition(async () => {
      const res =
        type === "faq"
          ? await reviewHomepageFaqProposal({
              id: item.id,
              action,
              question: item.question,
              answer: item.answer,
              season_tag: item.season_tag ?? "",
              sort_order: item.sort_order ?? 0,
              is_active: item.is_active ?? true,
              review_notes: reviewNotes,
            })
          : await reviewHomepageTestimonialProposal({
              id: item.id,
              action,
              name: item.name,
              role_label: item.role_label,
              photo_url: item.photo_url ?? "",
              content: item.content,
              season_tag: item.season_tag ?? "",
              sort_order: item.sort_order ?? 0,
              is_active: item.is_active ?? true,
              review_notes: reviewNotes,
            });

      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (role !== "superadmin") return;

    startTransition(async () => {
      const res =
        type === "faq"
          ? await deleteHomepageFaq(item.id)
          : await deleteHomepageTestimonial(item.id);

      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {STATUS_LABELS[item.workflow_status] ?? item.workflow_status}
        </span>
        {item.season_tag ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {item.season_tag}
          </span>
        ) : null}
      </div>

      {type === "faq" ? (
        <>
          <p className="font-black text-slate-900">{item.question}</p>
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {item.answer}
          </p>
        </>
      ) : (
        <>
          <div>
            <p className="font-black text-slate-900">{item.name}</p>
            <p className="text-sm text-slate-500">{item.role_label}</p>
          </div>
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {item.content}
          </p>
        </>
      )}

      {item.review_notes ? (
        <div className="rounded-xl bg-white p-3 text-sm text-slate-600 border border-slate-200">
          <strong className="text-slate-900">Review notes:</strong>{" "}
          {item.review_notes}
        </div>
      ) : null}

      {role === "superadmin" ? (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <textarea
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
            placeholder="Review notes para sa admin"
            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={isPending}
              onClick={() => handleReview("publish")}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Publish
            </Button>
            <Button
              disabled={isPending}
              onClick={() => handleReview("reject")}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
            >
              Reject
            </Button>
            <Button
              disabled={isPending}
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FaqEditor({ role }: { role: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [seasonTag, setSeasonTag] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await submitHomepageFaqProposal({
        question,
        answer,
        season_tag: seasonTag,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        setQuestion("");
        setAnswer("");
        setSeasonTag("");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">
        {role === "superadmin"
          ? "Magdagdag ng direktang published FAQ"
          : "Magpasa ng bagong FAQ proposal"}
      </p>
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Tanong para sa homepage FAQ"
        className="rounded-xl bg-white"
      />
      <Input
        value={seasonTag}
        onChange={(e) => setSeasonTag(e.target.value)}
        placeholder="Season tag o topic (optional)"
        className="rounded-xl bg-white"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Maikling malinaw na sagot"
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
      <Button
        disabled={isPending || !question.trim() || !answer.trim()}
        onClick={handleSave}
        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {role === "superadmin" ? "Publish FAQ" : "Submit FAQ Proposal"}
      </Button>
    </div>
  );
}

function TestimonialEditor({ role }: { role: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [content, setContent] = useState("");
  const [seasonTag, setSeasonTag] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await submitHomepageTestimonialProposal({
        name,
        role_label: roleLabel,
        photo_url: photoUrl,
        content,
        season_tag: seasonTag,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        setName("");
        setRoleLabel("");
        setPhotoUrl("");
        setContent("");
        setSeasonTag("");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">
        {role === "superadmin"
          ? "Magdagdag ng direktang published testimonial"
          : "Magpasa ng curated testimonial proposal"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pangalan"
          className="rounded-xl bg-white"
        />
        <Input
          value={roleLabel}
          onChange={(e) => setRoleLabel(e.target.value)}
          placeholder="Role o negosyo"
          className="rounded-xl bg-white"
        />
      </div>
      <Input
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        placeholder="Photo URL (optional)"
        className="rounded-xl bg-white"
      />
      <Input
        value={seasonTag}
        onChange={(e) => setSeasonTag(e.target.value)}
        placeholder="Season tag o campaign (optional)"
        className="rounded-xl bg-white"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Mensahe ng miyembro o lender"
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
      <Button
        disabled={
          isPending || !name.trim() || !roleLabel.trim() || !content.trim()
        }
        onClick={handleSave}
        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {role === "superadmin"
          ? "Publish Testimonial"
          : "Submit Testimonial Proposal"}
      </Button>
    </div>
  );
}

