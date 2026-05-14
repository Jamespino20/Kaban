"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Building2, 
  Mail, 
  Phone,
  MapPin,
  Users,
  Eye,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTenantApplicationsForReview } from "@/actions/superadmin-actions";
import { processApplication } from "@/actions/tenant-applications";

// Application status badge colors
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

// Application interface
interface TenantApplication {
  application_id: number;
  tenant_name: string;
  tenant_slug: string;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
  estimated_members: number | null;
  selected_plan: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: Date;
  reviewed_at: Date | null;
  review_notes: string | null;
  attached_documents: any;
  tenant_group: {
    name: string;
  };
  submitted_by_user?: {
    username: string;
    email: string;
  };
}

interface ApprovalsTabProps {
  initialApplications?: TenantApplication[];
}

export function SuperadminApprovalsTab({ initialApplications = [] }: ApprovalsTabProps) {
  const [applications, setApplications] = useState<TenantApplication[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(!initialApplications.length);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Fetch applications on mount
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await getTenantApplicationsForReview() as any;
        if (response.success && response.data) {
          setApplications(response.data as unknown as TenantApplication[]);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!initialApplications.length) {
      fetchApplications();
    }
  }, [initialApplications.length]);

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === "" ||
      app.tenant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle approve/reject
  async function handleProcess(applicationId: number, action: "approve" | "reject") {
    startTransition(async () => {
      try {
        const result = await processApplication(applicationId, action);
        if (result.success) {
          toast.success(`Application ${action === "approve" ? "approved" : "rejected"} successfully`);
          // Refresh the list
          const response = await getTenantApplicationsForReview() as any;
          if (response.success && response.data) {
            setApplications(response.data as unknown as TenantApplication[]);
          }
        } else {
          toast.error(result.error || "Failed to process application");
        }
      } catch (error) {
        console.error("Failed to process:", error);
        toast.error("An unexpected error occurred");
      }
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <div className="dashboard-card border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 font-medium mb-2">No applications found</h3>
            <p className="text-slate-500">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your filters"
                : "No tenant applications pending approval"}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <Card 
              key={app.application_id}
              className={`overflow-hidden transition-all ${
                expandedCard === app.application_id 
                  ? "ring-2 ring-slate-400" 
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{app.tenant_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {app.tenant_group?.name || "Region"}
                        {app.selected_plan && (
                          <>
                            <span>•</span>
                            <span>{app.selected_plan}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[app.status]}>
                      {app.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {app.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {app.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setExpandedCard(app.application_id === expandedCard ? null : app.application_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {app.status === "pending" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleProcess(app.application_id, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleProcess(app.application_id, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              {/* Expandable Content */}
              {expandedCard === app.application_id && (
                <CardContent className="pt-0 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">Applicant Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {app.applicant_name || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {app.applicant_email || "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {app.applicant_phone || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">Application Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Estimated Members: </span>
                          <span className="text-slate-900 font-medium">
                            {app.estimated_members || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Submitted: </span>
                          <span className="text-slate-900">
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {app.reviewed_at && (
                          <div>
                            <span className="text-slate-500">Reviewed: </span>
                            <span className="text-slate-900">
                              {new Date(app.reviewed_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {app.status === "pending" && (
                    <div className="flex gap-2 mt-6">
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleProcess(app.application_id, "approve")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleProcess(app.application_id, "reject")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
              
              {/* Click to expand */}
              {expandedCard !== app.application_id && (
                <CardContent className="pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-center text-slate-500"
                    onClick={() => setExpandedCard(app.application_id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
      
      {/* Results count */}
      {filteredApplications.length > 0 && (
        <div className="text-sm text-slate-500 text-center">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}
    </div>
  );
}