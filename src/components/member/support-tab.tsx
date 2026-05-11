"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { submitContextualFeedback } from "@/actions/transactional-feedback";

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
              Rate your experience with our service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 space-y-4">
              <div className="space-y-2">
                <p className="text-slate-600 font-medium">
                  How would you rate your experience?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="w-12 h-12 rounded-full border-2 border-amber-200 hover:bg-amber-50 flex items-center justify-center text-amber-500 font-bold transition-colors"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  The survey will be available in your{" "}
                  <button className="text-emerald-600 hover:underline font-medium">
                    Settings
                  </button>{" "}
                  when there's a new update.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}