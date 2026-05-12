"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  Loader2,
} from "lucide-react";
import { submitContextualFeedback, submitTrustLinkedSurvey } from "@/actions/transactional-feedback";

interface SupportTicket {
  id: number;
  category: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: Date;
  resolved_at: Date | null;
}

interface SupportTabProps {
  tenantSlug: string;
  tickets?: SupportTicket[];
}

const categoryOptions = [
  { value: "loan_inquiry", label: "Loan Inquiry" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "account_problem", label: "Account Problem" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "general_inquiry", label: "General Inquiry" },
  { value: "testimony", label: "Submit Testimony" },
];

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
    case "closed":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolved
        </Badge>
      );
    case "in_progress":
    case "pending":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Open
        </Badge>
      );
  }
};

export function SupportTab({ tenantSlug, tickets = [] }: SupportTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await submitContextualFeedback({
      category: formData.category,
      subject: formData.subject,
      message: formData.message,
      pagePath: `/${tenantSlug}/agapay-pintig`,
    });

    setIsSubmitting(false);
    if (result?.success) {
      setSubmitSuccess(true);
      setFormData({ category: "", subject: "", message: "" });
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  return (
    <Tabs defaultValue="new-ticket" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="new-ticket" className="gap-2">
          <Send className="w-4 h-4" />
          New Ticket
        </TabsTrigger>
        <TabsTrigger value="my-tickets" className="gap-2">
          <Clock className="w-4 h-4" />
          My Tickets
        </TabsTrigger>
        <TabsTrigger value="survey" className="gap-2">
          <Star className="w-4 h-4" />
          Survey
        </TabsTrigger>
      </TabsList>

      <TabsContent value="new-ticket" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-slate-100 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Submit a Concern
            </CardTitle>
            <CardDescription>
              Have a question or comment? We're here to help. Just fill in the details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Successfully Submitted!
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Thank you for your feedback. Our team will reach out to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your concern"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your concern in detail..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="my-tickets" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-slate-100 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              My Tickets
            </CardTitle>
            <CardDescription>
              Track the status of your submitted concerns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Tickets Yet
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  You haven't submitted any tickets yet. Create a new ticket if you have a concern.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            #{ticket.id}
                          </span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <h4 className="font-bold text-slate-900">
                          {ticket.subject || ticket.category}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {ticket.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          Submitted:{" "}
                          {new Date(ticket.created_at).toLocaleDateString(
                            "en-PH",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="survey" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-slate-100 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Satisfaction Survey
            </CardTitle>
            <CardDescription>
              Help us improve — rate your experience across these areas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SurveyForm tenantSlug={tenantSlug} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

const SURVEY_QUESTIONS = [
  { id: "q1", label: "How satisfied are you with the loan application process?" },
  { id: "q2", label: "How would you rate customer support responsiveness?" },
  { id: "q3", label: "How easy was the repayment process?" },
  { id: "q4", label: "Would you recommend our services to others?" },
  { id: "q5", label: "How satisfied are you with the mobile app experience?" },
];

function SurveyForm({ tenantSlug }: { tenantSlug?: string }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allRated = SURVEY_QUESTIONS.every((q) => ratings[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!allRated) return;
    setIsSubmitting(true);
    try {
      const res = await submitTrustLinkedSurvey({
        ratings,
        comment,
        tenantSlug,
      });
      if (res?.success) {
        toast.success(res.success);
        setSubmitted(true);
      } else {
        toast.error(res.error || "Failed to submit survey");
      }
    } catch {
      toast.error("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
          <Star className="w-8 h-8 text-amber-500 fill-current" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Survey Complete!</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Thank you for rating your experience. Your feedback helps us improve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
        <p className="font-bold flex items-center gap-2">
          <Star className="h-4 w-4" /> Your responses help build your Trust Score
        </p>
        <p className="text-xs mt-1 text-amber-700">
          Survey answers are linked to your profile and contribute to your
          cooperative trust rating. Honest feedback strengthens the community.
        </p>
      </div>
      {SURVEY_QUESTIONS.map((q) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">{q.label}</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatings((prev) => ({ ...prev, [q.id]: star }))}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  ratings[q.id] !== undefined && star <= ratings[q.id]
                    ? "border-amber-400 bg-amber-50 text-amber-600"
                    : "border-slate-200 bg-white text-slate-400 hover:border-amber-200 hover:bg-amber-50"
                }`}
              >
                {star}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800">Additional Comments (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more about your experience..."
          className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <Button
        disabled={!allRated || isSubmitting}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Star className="w-4 h-4 mr-2" />
            Submit Survey
          </>
        )}
      </Button>
    </div>
  );
}