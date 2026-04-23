"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveHomepageFaq, saveHomepageTestimonial } from "@/actions/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function HomepageContentTab({
  faqs,
  testimonials,
}: {
  faqs: any[];
  testimonials: any[];
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <ContentEditorCard title="Homepage FAQs">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FaqEditor key={faq.id} faq={faq} />
          ))}
          <FaqEditor />
        </div>
      </ContentEditorCard>

      <ContentEditorCard title="Homepage Testimonials">
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <TestimonialEditor key={testimonial.id} testimonial={testimonial} />
          ))}
          <TestimonialEditor />
        </div>
      </ContentEditorCard>
    </div>
  );
}

function ContentEditorCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-xl font-display font-bold text-slate-900 italic">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FaqEditor({ faq }: { faq?: any }) {
  const router = useRouter();
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [sortOrder, setSortOrder] = useState(String(faq?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(faq?.is_active ?? true);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveHomepageFaq({
        id: faq?.id,
        question,
        answer,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Tanong"
        className="rounded-xl bg-white"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Sagot"
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
      <div className="flex gap-3 items-center">
        <Input
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="Sort"
          type="number"
          className="w-24 rounded-xl bg-white"
        />
        <label className="text-sm text-slate-600 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        <Button
          disabled={isPending || !question.trim() || !answer.trim()}
          onClick={handleSave}
          className="rounded-xl ml-auto bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save FAQ
        </Button>
      </div>
    </div>
  );
}

function TestimonialEditor({ testimonial }: { testimonial?: any }) {
  const router = useRouter();
  const [name, setName] = useState(testimonial?.name ?? "");
  const [roleLabel, setRoleLabel] = useState(testimonial?.role_label ?? "");
  const [photoUrl, setPhotoUrl] = useState(testimonial?.photo_url ?? "");
  const [content, setContent] = useState(testimonial?.content ?? "");
  const [seasonTag, setSeasonTag] = useState(testimonial?.season_tag ?? "");
  const [sortOrder, setSortOrder] = useState(String(testimonial?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(testimonial?.is_active ?? true);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveHomepageTestimonial({
        id: testimonial?.id,
        name,
        role_label: roleLabel,
        photo_url: photoUrl,
        content,
        season_tag: seasonTag,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pangalan" className="rounded-xl bg-white" />
        <Input value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} placeholder="Role label" className="rounded-xl bg-white" />
      </div>
      <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Photo URL (optional)" className="rounded-xl bg-white" />
      <Input value={seasonTag} onChange={(e) => setSeasonTag(e.target.value)} placeholder="Season tag (optional)" className="rounded-xl bg-white" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Testimonial content"
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
      <div className="flex gap-3 items-center">
        <Input
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="Sort"
          type="number"
          className="w-24 rounded-xl bg-white"
        />
        <label className="text-sm text-slate-600 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        <Button
          disabled={isPending || !name.trim() || !roleLabel.trim() || !content.trim()}
          onClick={handleSave}
          className="rounded-xl ml-auto bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save Testimonial
        </Button>
      </div>
    </div>
  );
}
