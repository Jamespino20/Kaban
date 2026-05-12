"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MessageCircle,
  Quote,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getPlatformContentModeration,
  getTenantTestimonialsForPlatform,
  moderatePlatformFaq,
  moderatePlatformTestimonial,
  pickTenantTestimonialForPlatform,
  bulkUpdatePlatformSeason,
} from "@/actions/site-content";

type PlatformFaq = {
  id: number;
  question: string;
  answer: string;
  season_tag: string | null;
  is_active: boolean;
  workflow_status: string;
  sort_order: number;
  review_notes: string | null;
  created_at: Date;
  submitted_by_user:
    | { user_id?: number; username: string; email: string }
    | null
    | undefined;
  reviewed_by_user: { user_id?: number; username: string } | null | undefined;
};

type PlatformTestimonial = {
  id: number;
  name: string;
  role_label: string;
  content: string;
  photo_url: string | null;
  season_tag: string | null;
  is_active: boolean;
  workflow_status: string;
  sort_order: number;
  review_notes: string | null;
  created_at: Date;
  submitted_by_user:
    | { user_id?: number; username: string; email: string }
    | null
    | undefined;
  reviewed_by_user: { user_id?: number; username: string } | null | undefined;
};

type TenantTestimonial = {
  id: number;
  name: string;
  role_label: string;
  content: string;
  photo_url: string | null;
  season_tag: string | null;
  is_active: boolean;
  workflow_status: string;
  sort_order: number;
  review_notes: string | null;
  created_at: Date;
  submitted_by_user: { username: string } | null;
  tenant: { name: string } | null;
};

export function PlatformContentModerationTab() {
  const [faqs, setFaqs] = useState<PlatformFaq[]>([]);
  const [testimonials, setTestimonials] = useState<PlatformTestimonial[]>([]);
  const [tenantTestimonials, setTenantTestimonials] = useState<
    TenantTestimonial[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"faq" | "testimonial" | "tenant-testimonials">("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const [platResult, tenantResult] = await Promise.all([
        getPlatformContentModeration(),
        getTenantTestimonialsForPlatform(),
      ]);
      if (platResult.success) {
        const validFaqs =
          platResult.faqs?.filter((faq) => faq && faq.submitted_by_user) || [];
        const validTestimonials =
          platResult.testimonials?.filter((t) => t && t.submitted_by_user) ||
          [];
        setFaqs(validFaqs);
        setTestimonials(validTestimonials);
      } else {
        toast.error(platResult.error || "Failed to load content");
      }
      if (tenantResult.success) {
        setTenantTestimonials(tenantResult.testimonials ?? []);
      }
    } catch (error) {
      console.error("Failed to load content:", error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerateFaq = async (
    faqId: number,
    action: "publish" | "reject",
    sortOrder?: number,
  ) => {
    try {
      const result = await moderatePlatformFaq(faqId, action, sortOrder);
      if (result.success) {
        toast.success(action === "publish" ? "FAQ published!" : "FAQ rejected");
        loadContent();
      } else {
        toast.error(result.error || "Failed to moderate FAQ");
      }
    } catch (error) {
      console.error("Failed to moderate FAQ:", error);
      toast.error("Failed to moderate FAQ");
    }
  };

  const handleModerateTestimonial = async (
    testimonialId: number,
    action: "publish" | "reject",
    sortOrder?: number,
  ) => {
    try {
      const result = await moderatePlatformTestimonial(
        testimonialId,
        action,
        sortOrder,
      );
      if (result.success) {
        toast.success(
          action === "publish"
            ? "Testimonial published!"
            : "Testimonial rejected",
        );
        loadContent();
      } else {
        toast.error(result.error || "Failed to moderate testimonial");
      }
    } catch (error) {
      console.error("Failed to moderate testimonial:", error);
      toast.error("Failed to moderate testimonial");
    }
  };

  const handlePickForPlatform = async (id: number) => {
    try {
      const result = await pickTenantTestimonialForPlatform(id);
      if (result.success) {
        toast.success(result.success);
        loadContent();
      } else {
        toast.error(result.error || "Failed to pick testimonial");
      }
    } catch (error) {
      console.error("Failed to pick testimonial:", error);
      toast.error("Failed to pick testimonial");
    }
  };

  const handleBulkSeasonUpdate = async (season: string, isActive: boolean) => {
    try {
      const result = await bulkUpdatePlatformSeason(season, isActive);
      if (result.success) {
        toast.success(
          `Successfully ${isActive ? "activated" : "deactivated"} ${result.data?.faqsCount} FAQs and ${result.data?.testimonialsCount} testimonials for ${season}`,
        );
        loadContent();
      } else {
        toast.error(result.error || "Failed to update season");
      }
    } catch (error) {
      console.error("Bulk season update error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const allSeasons = Array.from(
    new Set([
      ...faqs.map((f) => f.season_tag),
      ...testimonials.map((t) => t.season_tag),
    ]),
  ).filter(Boolean) as string[];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || faq.workflow_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || t.workflow_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingFaqs = faqs.filter(
    (f) => f.workflow_status === "pending",
  ).length;
  const pendingTestimonials = testimonials.filter(
    (t) => t.workflow_status === "pending",
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "faq"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Platform FAQs
          {pendingFaqs > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              {pendingFaqs}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("testimonial")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "testimonial"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Quote className="w-4 h-4" />
          Platform Testimonials
          {pendingTestimonials > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              {pendingTestimonials}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("tenant-testimonials")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tenant-testimonials"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Tenant Testimonials
          {tenantTestimonials.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {tenantTestimonials.length}
            </span>
          )}
        </button>
      </div>

      {/* Season Management Section */}
      {allSeasons.length > 0 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Season Management (Bulk Control)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allSeasons.map((season) => (
                <div
                  key={season}
                  className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200"
                >
                  <span className="text-xs font-bold px-2">{season}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleBulkSeasonUpdate(season, true)}
                    >
                      Show All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[10px] text-rose-600 hover:bg-rose-50"
                      onClick={() => handleBulkSeasonUpdate(season, false)}
                    >
                      Hide All
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Content Grid */}
      {activeTab === "faq" ? (
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No FAQs found</p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-slate-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(faq.workflow_status)}
                        {faq.season_tag && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {faq.season_tag}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Sort: {faq.sort_order}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        {faq.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400">
                      Submitted by{" "}
                      {faq.submitted_by_user?.username || "Unknown"} on{" "}
                      {new Date(faq.created_at).toLocaleDateString("en-PH")}
                      {faq.reviewed_by_user && (
                        <span className="ml-2">
                          • Reviewed by {faq.reviewed_by_user.username}
                        </span>
                      )}
                    </div>
                    {faq.workflow_status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit & Publish
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review & Publish FAQ</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Question
                                </label>
                                <p className="text-sm text-slate-600 mt-1">
                                  {faq.question}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Answer
                                </label>
                                <p className="text-sm text-slate-600 mt-1">
                                  {faq.answer}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Sort Order
                                </label>
                                <Input
                                  type="number"
                                  defaultValue={faq.sort_order}
                                  id={`sort-${faq.id}`}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => {
                                    const sortOrder = parseInt(
                                      (
                                        document.getElementById(
                                          `sort-${faq.id}`,
                                        ) as HTMLInputElement
                                      ).value,
                                    );
                                    handleModerateFaq(
                                      faq.id,
                                      "publish",
                                      sortOrder,
                                    );
                                  }}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Publish
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleModerateFaq(faq.id, "reject")
                                  }
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : activeTab === "testimonial" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTestimonials.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="py-12 text-center">
                <Quote className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No testimonials found</p>
              </CardContent>
            </Card>
          ) : (
            filteredTestimonials.map((t) => (
              <Card key={t.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-slate-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(t.workflow_status)}
                      {t.season_tag && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {t.season_tag}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 mb-4">
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-slate-400">
                          {t.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{t.name}</h3>
                      <p className="text-sm text-slate-500">{t.role_label}</p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-slate-600 italic">"{t.content}"</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400">
                      Submitted by {t.submitted_by_user?.username || "Unknown"}{" "}
                      on {new Date(t.created_at).toLocaleDateString("en-PH")}
                    </div>
                    {t.workflow_status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleModerateTestimonial(
                              t.id,
                              "publish",
                              t.sort_order,
                            )
                          }
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleModerateTestimonial(t.id, "reject")
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Published testimonials mula sa lahat ng tenants. Pumili ng
              ilalagay sa platform homepage.
            </p>
          </div>
          {tenantTestimonials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Quote className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">
                  No published testimonials from tenants yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenantTestimonials.map((t) => (
                <Card key={t.id} className="overflow-hidden border-blue-200">
                  <CardHeader className="pb-2 bg-blue-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                          {t.tenant?.name || "Unknown Tenant"}
                        </span>
                        {t.season_tag && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {t.season_tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4 mb-4">
                      {t.photo_url ? (
                        <img
                          src={t.photo_url}
                          alt={t.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-slate-400">
                            {t.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {t.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {t.role_label}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic mb-4">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-xs text-slate-400">
                        Submitted by{" "}
                        {t.submitted_by_user?.username || "Unknown"}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePickForPlatform(t.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Pick for Platform
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
