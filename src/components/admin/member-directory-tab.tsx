"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Users2,
  Search,
  MoreVertical,
  ShieldCheck,
  Clock,
  Eye,
  Ban,
  CheckCircle2,
  UserCog,
  Trash2,
  KeyRound,
  Activity,
  Bell,
  Fingerprint,
  Mail,
  ShieldAlert,
  UserMinus,
  UserPlus,
  UserX,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { CreateStaffModal } from "./create-staff-modal";
import { MemberProfileModal } from "./member-profile-modal";
import { EditMemberModal } from "./edit-member-modal";
import { MemberActivityModal } from "./member-activity-modal";
import {
  updateMemberStatus,
  resetMemberPassword,
  sendMemberNotification,
} from "@/actions/admin-actions";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  member: "Member",
  operator: "Tenant Operator",
  superadmin: "Superadmin",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  suspended: "Suspended",
  inactive: "Inactive",
  deactivated: "Deactivated",
};

const TIER_LABELS: Record<string, string> = {
  T1_5_PERCENT: "Gabay (5%)",
  T2_4_5_PERCENT: "Bagong Sigla (4.5%)",
  T3_4_PERCENT: "Kasapi (4%)",
  T4_3_5_PERCENT: "Katuwang (3.5%)",
  T5_3_PERCENT: "Kaagapay (3%)",
};

function formatRole(role?: string | null) {
  return ROLE_LABELS[role || ""] || "Member";
}

function formatStatus(status?: string | null) {
  return STATUS_LABELS[status || ""] || "Pending";
}

function formatTier(tier?: string | null) {
  return TIER_LABELS[tier || ""] || "Gabay (5%)";
}

function getStatusStyles(status?: string | null) {
  if (status === "active") return "bg-emerald-500/10 text-emerald-600";
  if (status === "suspended") return "bg-rose-500/10 text-rose-600";
  if (status === "deactivated") return "bg-slate-900/10 text-slate-700";
  return "bg-amber-500/10 text-amber-600";
}

interface MemberDirectoryTabProps {
  members: any[];
  userRole?: string;
  tenants?: { id: number; name: string }[];
}

export function MemberDirectoryTab({
  members,
  userRole,
  tenants = [],
}: MemberDirectoryTabProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const pageSize = 8;

  const isSuperadmin = userRole === "superadmin";

  const tenantNames = useMemo(() => {
    const b = new Set(members.map((m) => m.tenant?.name).filter(Boolean));
    return Array.from(b).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member: any) => {
      const name = member.profile
        ? `${member.profile.first_name} ${member.profile.last_name}`
        : member.username;

      const matchesQuery =
        query.trim().length === 0 ||
        name.toLowerCase().includes(query.toLowerCase()) ||
        member.email?.toLowerCase().includes(query.toLowerCase()) ||
        member.member_code?.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      const matchesRole = roleFilter === "all" || member.role === roleFilter;

      const matchesTenant =
        tenantFilter === "all" || member.tenant?.name === tenantFilter;

      const matchesTier =
        tierFilter === "all" || member.interest_tier === tierFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesRole &&
        matchesTenant &&
        matchesTier
      );
    });
  }, [members, query, statusFilter, roleFilter, tenantFilter, tierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, roleFilter, tenantFilter, tierFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-5">
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Tenant Operator
          </p>
          <h2 className="text-xl font-display font-bold italic text-slate-950">
            Member Management
          </h2>
          <p className="max-w-3xl text-sm text-slate-500">
            Directory view for member identity, loan exposure, wallet balance,
            document verification, trust scoring, and status controls.
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, or membership code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isSuperadmin && tenantNames.length > 0 && (
              <Select value={tenantFilter} onValueChange={setTenantFilter}>
                <SelectTrigger className="w-[160px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
                  <SelectValue placeholder="Tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenantNames.map((b: any) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Role</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="operator">Tenant Operator</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Tier</SelectItem>
                <SelectItem value="T1_5_PERCENT">Gabay (5%)</SelectItem>
                <SelectItem value="T2_4_5_PERCENT">
                  Bagong Sigla (4.5%)
                </SelectItem>
                <SelectItem value="T3_4_PERCENT">Kasapi (4%)</SelectItem>
                <SelectItem value="T4_3_5_PERCENT">Katuwang (3.5%)</SelectItem>
                <SelectItem value="T5_3_PERCENT">Kaagapay (3%)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap bg-white border border-slate-200 px-3 py-2.5 rounded-xl">
              Count: {filteredMembers.length}
            </span>
            {isSuperadmin && tenants.length > 0 && (
              <CreateStaffModal tenants={tenants} />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-bottom border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Member
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Code / Tier
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Loans / Wallet
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Interest Tier
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Documents
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-slate-400 font-medium"
                  >
                    No members match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member: any) => {
                  const name = member.profile
                    ? `${member.profile.first_name} ${member.profile.last_name}`
                    : member.username;
                  const walletBalance = member.savings_accounts
                    .filter(
                      (account: any) =>
                        account.account_type === "personal_wallet",
                    )
                    .reduce(
                      (sum: number, account: any) =>
                        sum + Number(account.balance),
                      0,
                    );
                  const recoveryLoans = member.loans.filter(
                    (loan: any) => loan.is_recovery_loan,
                  ).length;
                  const chargedGuarantees = member.guarantees.filter(
                    (guarantee: any) => guarantee.status === "charged",
                  ).length;
                  const verifiedDocuments = member.documents.filter(
                    (document: any) =>
                      document.verification_status === "verified",
                  ).length;
                  return (
                    <tr
                      key={member.user_id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs uppercase border border-emerald-100 shadow-sm">
                            {name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight mb-1">
                              {name}
                            </p>
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">
                                {formatRole(member.role)}
                              </span>
                              <span className="text-[10px] text-slate-300">
                                •
                              </span>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {member.tenant?.name || "Global"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {member.member_code || "PENDING"}
                        </code>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {formatTier(member.interest_tier)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(member.status)}`}
                        >
                          {member.status === "active" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {formatStatus(member.status)}
                        </div>
                        {member.is_deactivation_locked ? (
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                            Locked
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <div className="space-y-1">
                          <p>
                            {member.loans.length}{" "}
                            {member.loans.length === 1 ? "Loan" : "Loans"}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">
                            Wallet: ₱
                            {walletBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          {recoveryLoans > 0 && (
                            <p className="text-[10px] uppercase tracking-widest text-rose-500">
                              Recovery: {recoveryLoans}
                            </p>
                          )}
                          {chargedGuarantees > 0 && (
                            <p className="text-[10px] uppercase tracking-widest text-amber-500">
                              Charged guarantees: {chargedGuarantees}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">
                            {formatTier(member.interest_tier)}
                          </p>

                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        <div className="space-y-1">
                          <p>
                            {verifiedDocuments}/{member.documents.length}{" "}
                            verified
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">
                            Uploaded files
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 text-[11px] font-bold h-8 px-3"
                            onClick={() => {
                              setSelectedMember(member);
                              setIsProfileOpen(true);
                            }}
                          >
                            Manage
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Member Actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={() => {
                                  setSelectedMember(member);
                                  setIsEditOpen(true);
                              }}>
                                <UserCog className="h-4 w-4 text-indigo-500" />
                                <span>Update Role / Status</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                <Mail className="h-4 w-4 text-emerald-500" />
                                <span>Send Notification</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50" onClick={() => {
                                  setSelectedMember(member);
                                  setIsDeactivateOpen(true);
                              }}>
                                <UserX className="h-4 w-4" />
                                <span>Deactivate Account</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          itemLabel="members"
          pageSize={pageSize}
          totalItems={filteredMembers.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Deactivation Confirmation Dialog */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-rose-600" />
              Confirm Deactivation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate <strong>{selectedMember?.profile ? `${selectedMember.profile.first_name} ${selectedMember.profile.last_name}` : selectedMember?.username}</strong>? This will restrict their access to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsDeactivateOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
                variant="destructive" 
                className="rounded-xl"
                onClick={async () => {
                   const res = await updateMemberStatus(selectedMember.user_id, "deactivated") as any;
                   if (res.error) toast.error(String(res.error) + " Please refresh and try again.");
                   else {
                     toast.success("Member deactivated successfully.");
                     setIsDeactivateOpen(false);
                   }
                }}
            >
              Deactivate Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MemberProfileModal
        member={selectedMember}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <EditMemberModal
        member={selectedMember}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <MemberActivityModal
        member={selectedMember}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />
    </div>
  );
}

function MemberRowActions({ 
  member, 
  onViewProfile,
  onEditDetails,
  onViewActivity
}: { 
  member: any;
  onViewProfile: () => void;
  onEditDetails: () => void;
  onViewActivity: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"suspend" | "activate" | "deactivate" | null>(null);

  const handleResetPassword = () => {
    startTransition(async () => {
      const res = await resetMemberPassword(member.user_id);
      if (res.error) toast.error(String(res.error) + " Please try again.");
      else toast.success(res.success);
    });
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error("Please fill in both title and body");
      return;
    }
    startTransition(async () => {
      const res = await sendMemberNotification(member.user_id, notifTitle, notifBody);
      if (res.error) toast.error(String(res.error) + " Please try again.");
      else {
        toast.success(res.success);
        setNotifOpen(false);
        setNotifTitle("");
        setNotifBody("");
      }
    });
  };

  const executeStatusChange = () => {
    if (!confirmType) return;
    const newStatus = confirmType === "suspend" ? "suspended" : confirmType === "activate" ? "active" : "deactivated";
    
    startTransition(async () => {
      const res = await updateMemberStatus(member.user_id, newStatus);
      if (res.error) toast.error(String(res.error) + " Please refresh and try again.");
      else {
        toast.success(res.success);
        setConfirmOpen(false);
        setConfirmType(null);
      }
    });
  };

  return (
    <>
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              This will be sent to {member.profile?.first_name || member.username}'s dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Subject</label>
              <Input 
                value={notifTitle} 
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Identity Verified"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Message</label>
              <Textarea 
                value={notifBody} 
                onChange={(e) => setNotifBody(e.target.value)}
                placeholder="Write your message here..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSendNotification} disabled={isPending} className="rounded-xl">
              {isPending ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="capitalize">{confirmType} Member</DialogTitle>
            <DialogDescription>
              {confirmType === "deactivate" 
                ? "Sigurado ka ba? Hindi na ito mababalik kapag tinuloy mo." 
                : `Sigurado ka bang gusto mong i-${confirmType} ang miyembrong ito?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              variant={confirmType === "deactivate" || confirmType === "suspend" ? "destructive" : "default"}
              onClick={executeStatusChange} 
              disabled={isPending}
              className="rounded-xl"
            >
              {isPending ? "Processing..." : `Confirm ${confirmType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-2xl border-slate-200 p-1.5 shadow-lg"
      >
        <DropdownMenuItem
          className="rounded-xl py-2.5 text-sm cursor-pointer"
          onClick={onViewProfile}
        >
          <Eye className="mr-2.5 h-4 w-4 text-slate-400" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl py-2.5 text-sm cursor-pointer"
          onClick={onEditDetails}
        >
          <UserCog className="mr-2.5 h-4 w-4 text-slate-400" />
          Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl py-2.5 text-sm cursor-pointer"
          onClick={handleResetPassword}
          disabled={isPending}
        >
          <KeyRound className="mr-2.5 h-4 w-4 text-slate-400" />
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl py-2.5 text-sm cursor-pointer"
          onClick={onViewActivity}
        >
          <Activity className="mr-2.5 h-4 w-4 text-slate-400" />
          Activity Log
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl py-2.5 text-sm cursor-pointer"
          onClick={() => setNotifOpen(true)}
          disabled={isPending}
        >
          <Bell className="mr-2.5 h-4 w-4 text-slate-400" />
          Send Notification
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        {member.status === "active" ? (
          <DropdownMenuItem
            className="rounded-xl py-2.5 text-sm cursor-pointer text-amber-600"
            onClick={() => { setConfirmType("suspend"); setConfirmOpen(true); }}
            disabled={isPending}
          >
            <Ban className="mr-2.5 h-4 w-4" />
            Suspend Member
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="rounded-xl py-2.5 text-sm cursor-pointer text-emerald-600"
            onClick={() => { setConfirmType("activate"); setConfirmOpen(true); }}
            disabled={isPending}
          >
            <CheckCircle2 className="mr-2.5 h-4 w-4" />
            Activate Member
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        <DropdownMenuItem
          className="rounded-xl py-2.5 text-sm cursor-pointer text-rose-600"
          onClick={() => { setConfirmType("deactivate"); setConfirmOpen(true); }}
          disabled={isPending}
        >
          <Trash2 className="mr-2.5 h-4 w-4" />
          Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-bold text-slate-700">
          {start}-{end}
        </span>{" "}
        of <span className="font-bold text-slate-700">{totalItems}</span>{" "}
        {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
