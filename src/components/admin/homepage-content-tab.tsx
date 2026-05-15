"use client";

import {
  deleteHomepageFaq,
  deleteHomepageTestimonial,
  reviewHomepageFaqProposal,
  reviewHomepageTestimonialProposal,
  submitHomepageFaqProposal,
  submitHomepageTestimonialProposal,
  updateTenantMetadata,
} from "@/actions/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BellRing,
  Clock3,
  MessageSquareWarning,
  ShieldCheck,
  Trash2,
  Image,
  Eye,
  EyeOff,
  Globe,
  Target,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, useRef } from "react";
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
  initialVision,
  initialMission,
}: {
  role: string;
  faqs: HomepageFaqRecord[];
  testimonials: HomepageTestimonialRecord[];
  initialVision?: string;
  initialMission?: string;
}) {
  const [vision, setVision] = useState(initialVision ?? "");
  const [mission, setMission] = useState(initialMission ?? "");
  const [showHero, setShowHero] = useState(true);
  const [showFaqs, setShowFaqs] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [heroTagline, setHeroTagline] = useState("Iyong Agapay, Ating Tagumpay");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Transparent cooperative finance powered by Agapay.",
  );
  const [heroMediaUrl, setHeroMediaUrl] = useState("");
  const [navIconUrl, setNavIconUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingMeta, startMetaTransition] = useTransition();
  const router = useRouter();
  const faqGroups = useMemo(() => groupByStatus(faqs), [faqs]);
  const testimonialGroups = useMemo(
    () => groupByStatus(testimonials),
    [testimonials],
  );

  const handleNavIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNavIconUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveMeta = () => {
    startMetaTransition(async () => {
      const res = await updateTenantMetadata({
        vision,
        mission,
        tagline: heroTagline,
        heroSubheadline: heroSubtitle,
        heroMediaUrl,
        navIconUrl,
        sectionVisibility: {
          hero: showHero,
          faqs: showFaqs,
          testimonials: showTestimonials,
          stats: showStats,
        },
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Homepage settings saved");
        router.refresh();
      }
    });
  };

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-5 gap-8">
      <div className="2xl:col-span-3 space-y-8">
        {role === "operator" && (
          <SuperadminRequestsSection
            pendingTestimonials={testimonialGroups.pending}
            rejectedTestimonials={testimonialGroups.rejected}
          />
        )}

        {/* Hero Content Editor */}
        <ContentSectionCard
          title="Hero Content"
          description="Edit the hero banner tagline, subtitle, and media for the homepage."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHero}
                  onChange={(e) => setShowHero(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                {showHero ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span className="text-sm font-medium text-slate-700">Visible</span>
              </label>
            </div>
            <Input
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              placeholder="Hero tagline (e.g. Iyong Agapay, Ating Tagumpay)"
              className="rounded-xl"
            />
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Hero subtitle / description"
              className="w-full min-h-[60px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <Input
              value={heroMediaUrl}
              onChange={(e) => setHeroMediaUrl(e.target.value)}
              placeholder="Hero image or video URL (optional)"
              className="rounded-xl"
            />
            {role === "superadmin" && (
              <Button
                size="sm"
                disabled={savingMeta}
                onClick={handleSaveMeta}
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Hero Content
              </Button>
            )}
          </div>
        </ContentSectionCard>

        {/* Vision & Mission Editor */}
        <ContentSectionCard
          title="Vision & Mission"
          description="Set the platform or tenant vision and mission statements."
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-2">
                <Target className="w-3 h-3" /> Mission
              </label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Enter mission statement..."
                className="w-full min-h-[60px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-2">
                <Globe className="w-3 h-3" /> Vision
              </label>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Enter vision statement..."
                className="w-full min-h-[60px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            {role === "superadmin" && (
              <Button
                size="sm"
                disabled={savingMeta}
                onClick={handleSaveMeta}
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Vision & Mission
              </Button>
            )}
          </div>
        </ContentSectionCard>

        {/* Section Visibility Toggles */}
        <ContentSectionCard
          title="Section Visibility"
          description="Toggle visibility of homepage sections."
        >
          <div className="space-y-3">
            {[
              { key: "hero", label: "Hero Section", state: showHero, setter: setShowHero },
              { key: "faqs", label: "FAQs Section", state: showFaqs, setter: setShowFaqs },
              { key: "testimonials", label: "Testimonials Section", state: showTestimonials, setter: setShowTestimonials },
              { key: "stats", label: "Stats Section", state: showStats, setter: setShowStats },
            ].map((section) => (
              <label key={section.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-sm font-medium text-slate-700">{section.label}</span>
                <input
                  type="checkbox"
                  checked={section.state}
                  onChange={(e) => section.setter(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </label>
            ))}
          </div>
        </ContentSectionCard>

        {/* Platform Navbar Icon */}
        <ContentSectionCard
          title="Platform Navbar Icon"
          description="Upload or change the platform navbar icon (favicon / logo)."
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              {navIconUrl ? (
                <img src={navIconUrl} className="h-full w-full object-contain" />
              ) : (
                <Camera className="h-5 w-5 text-slate-300" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleNavIconUpload}
              className="text-sm"
            />
            {navIconUrl && (
              <Button size="sm" variant="outline" onClick={() => setNavIconUrl("")}>
                Clear
              </Button>
            )}
          </div>
        </ContentSectionCard>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ContentSectionCard
            title={
              role === "superadmin"
                ? "Platform FAQ Moderation"
                : "Tenant Storefront FAQs"
            }
            description={
              role === "superadmin"
                ? "Review and publish platform homepage and platform subpage FAQs."
                : "Create tenant-specific FAQs for this cooperative storefront."
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
                ? "Platform Testimonial Moderation"
                : "Tenant Storefront Testimonials"
            }
            description={
              role === "superadmin"
                ? "Review testimonials for the platform homepage, including stories selected from tenants."
                : "Curate testimonials from this tenant's members and feedback."
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

      <div className="2xl:col-span-2">
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Content Preview
            </h4>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Live View
            </span>
          </div>
          <div className="h-[700px] w-full">
            <MockHomepagePreview
              branding={{
                logoUrl: navIconUrl || undefined,
              }}
              content={{
                heroHeadline: heroTagline,
                heroSubheadline: heroSubtitle,
              }}
            />
          </div>
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Tenant storefront changes appear after they are published.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { MockHomepagePreview } from "./mock-homepage-preview";

function groupByStatus<T extends { workflow_status: string }>(records: T[]) {
  return {
    pending: records.filter(
      (record) => record.workflow_status === "pending_superadmin_review",
    ),
    rejected: records.filter((record) => record.workflow_status === "rejected"),
    published: records.filter(
      (record) => record.workflow_status === "published",
    ),
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
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
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
    <div className="dashboard-card p-6 space-y-6">
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
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {section.items.map((item) => (
                <ContentRecordCard
                  key={item.id}
                  role={role}
                  type={type}
                  item={item}
                />
              ))}
            </div>
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
    <div className="dashboard-card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {STATUS_LABELS[item.workflow_status] ?? item.workflow_status}
        </span>
        {item.season_tag ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {item.season_tag}
          </span>
        ) : null}
        {typeof item.sort_order === "number" && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-500">
            #{item.sort_order}
          </span>
        )}
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
            placeholder="Review notes for the operator"
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

function SuperadminRequestsSection({
  pendingTestimonials,
  rejectedTestimonials,
}: {
  pendingTestimonials: HomepageTestimonialRecord[];
  rejectedTestimonials: HomepageTestimonialRecord[];
}) {
  const hasRequests =
    pendingTestimonials.length > 0 || rejectedTestimonials.length > 0;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <BellRing className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900 italic">
            Superadmin Requests
          </h3>
          <p className="text-sm text-slate-500">
            Status of testimonial proposals submitted for platform review.
          </p>
        </div>
      </div>

      {!hasRequests ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-5 text-sm text-slate-500 flex items-center gap-3">
          <MessageSquareWarning className="w-5 h-5 text-slate-300" />
          No proposals yet. Submit a testimonial proposal above.
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTestimonials.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Awaiting Review
                </h4>
                <span className="text-xs rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-600">
                  {pendingTestimonials.length}
                </span>
              </div>
              <div className="space-y-2">
                {pendingTestimonials.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-amber-200 bg-white p-4 flex items-start gap-3"
                  >
                    <Clock3 className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.role_label}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Pending Superadmin Review
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedTestimonials.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Needs Revision
                </h4>
                <span className="text-xs rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-600">
                  {rejectedTestimonials.length}
                </span>
              </div>
              <div className="space-y-2">
                {rejectedTestimonials.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-rose-200 bg-white p-4 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquareWarning className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.role_label}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          Rejected
                        </span>
                      </div>
                    </div>
                    {item.review_notes && (
                      <div className="rounded-lg bg-rose-50 p-3 text-xs text-slate-600 border border-rose-100">
                        <strong className="text-rose-800">
                          Superadmin feedback:
                        </strong>{" "}
                        {item.review_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
    <div className="dashboard-card p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">
        {role === "superadmin"
          ? "Add a directly published platform FAQ"
          : "Add a tenant storefront FAQ proposal"}
      </p>
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question for the storefront FAQ"
        className="rounded-xl bg-white"
      />
      <Input
        value={seasonTag}
        onChange={(e) => setSeasonTag(e.target.value)}
        placeholder="Season tag or topic (optional)"
        className="rounded-xl bg-white"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Short, clear answer"
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
    <div className="dashboard-card p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">
        {role === "superadmin"
          ? "Add a directly published platform testimonial"
          : "Add a curated tenant storefront testimonial"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-xl bg-white"
        />
        <Input
          value={roleLabel}
          onChange={(e) => setRoleLabel(e.target.value)}
          placeholder="Role or business"
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
        placeholder="Season tag or campaign (optional)"
        className="rounded-xl bg-white"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Member or operator story"
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
