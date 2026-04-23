"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitFeedback } from "@/actions/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FeedbackForm({
  defaultName = "",
  defaultEmail = "",
  defaultCategory = "general",
  pagePath,
  title = "Magbahagi ng feedback",
  description = "Sabihin sa amin ang concern, request, o suggestion mo.",
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultCategory?: string;
  pagePath?: string;
  title?: string;
  description?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [category, setCategory] = useState(defaultCategory);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await submitFeedback({
        name,
        email,
        category,
        page_path: pagePath,
        subject,
        message,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(res.success);
      setSubject("");
      setMessage("");
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-bold text-slate-900 italic">
          {title}
        </h3>
        <p className="text-slate-500">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Buong pangalan"
          className="rounded-2xl h-12"
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-2xl h-12"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm"
        >
          <option value="general">General</option>
          <option value="concern">Concern</option>
          <option value="cancellation">Cancellation</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
        </select>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Paksa"
          className="rounded-2xl h-12"
        />
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ilagay ang detalye ng iyong concern, suggestion, o tanong."
        className="min-h-32 w-full rounded-[1.5rem] border border-slate-200 px-4 py-3 text-sm"
      />

      <Button
        disabled={isPending || !name.trim() || !message.trim()}
        onClick={handleSubmit}
        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        Ipadala ang Feedback
      </Button>
    </div>
  );
}
