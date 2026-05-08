"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users2, Search, MoreVertical, ShieldCheck, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateStaffModal } from "./create-staff-modal";

interface MemberDirectoryTabProps {
  members: any[];
  userRole?: string;
  branches?: { id: number; name: string }[];
}

export function MemberDirectoryTab({
  members,
  userRole,
  branches = [],
}: MemberDirectoryTabProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const isSuperadmin = userRole === "superadmin";

  const branchNames = useMemo(() => {
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

      const matchesBranch =
        branchFilter === "all" || member.tenant?.name === branchFilter;

      const matchesTier =
        tierFilter === "all" || member.interest_tier === tierFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesRole &&
        matchesBranch &&
        matchesTier
      );
    });
  }, [members, query, statusFilter, roleFilter, branchFilter, tierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, roleFilter, branchFilter, tierFilter]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Hanapin ang miyembro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isSuperadmin && branchNames.length > 0 && (
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sanga: Lahat</SelectItem>
                {branchNames.map((b: any) => (
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
              <SelectItem value="member">Miyembro</SelectItem>
              <SelectItem value="lender">Lender</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Tier</SelectItem>
              <SelectItem value="T1_5_PERCENT">Tier 1 (5%)</SelectItem>
              <SelectItem value="T2_4_5_PERCENT">Tier 2 (4.5%)</SelectItem>
              <SelectItem value="T3_4_PERCENT">Tier 3 (4%)</SelectItem>
              <SelectItem value="T4_3_5_PERCENT">Tier 4 (3.5%)</SelectItem>
              <SelectItem value="T5_3_PERCENT">Tier 5 (3%)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-xl bg-white shadow-sm h-11 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="active">Aktibo</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap bg-white border border-slate-200 px-3 py-2.5 rounded-xl">
            Count: {filteredMembers.length}
          </span>
          {isSuperadmin && branches.length > 0 && (
            <CreateStaffModal branches={branches} />
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-bottom border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Miyembro
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Koda
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Katayuan
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Loans
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-slate-400 font-medium"
                  >
                    Walang nahanap na miyembro.
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
                                {member.role || "member"}
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
                          {member.member_code || "HINIHINTAY"}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            member.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {member.status === "active" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {member.status === "active"
                            ? "aktibo"
                            : member.status}
                        </div>
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
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
          itemLabel="miyembro"
          pageSize={pageSize}
          totalItems={filteredMembers.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
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
        Ipinapakita ang{" "}
        <span className="font-bold text-slate-700">
          {start}-{end}
        </span>{" "}
        ng <span className="font-bold text-slate-700">{totalItems}</span>{" "}
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
