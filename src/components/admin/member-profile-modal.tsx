"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Wallet,
  FileText,
  ShieldCheck,
  Activity,
  History,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberProfileModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberProfileModal({
  member,
  isOpen,
  onClose,
}: MemberProfileModalProps) {
  if (!member) return null;

  const profile = member.profile || {};
  const name = profile.first_name ? `${profile.first_name} ${profile.last_name}` : member.username;

  const walletBalance = member.savings_accounts
    .filter((a: any) => a.account_type === "personal_wallet")
    .reduce((sum: number, a: any) => sum + Number(a.balance), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "suspended": return "bg-rose-500/10 text-rose-600 border-rose-200";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden flex flex-col rounded-3xl border-slate-200">
        <DialogHeader className="p-6 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl uppercase border border-emerald-100 shadow-sm">
              {name.substring(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-2xl font-display font-bold italic text-slate-950">
                  {name}
                </DialogTitle>
                <Badge className={getStatusColor(member.status)} variant="outline">
                  {member.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {member.role}
                </span>
                <span>•</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {member.member_code || "PENDING"}
                </span>
                <span>•</span>
                <span>{member.email}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b border-slate-100 shrink-0">
            <TabsList className="bg-transparent w-full justify-start gap-6 h-12 p-0 rounded-none border-none">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none px-0 font-bold text-slate-400"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="loans"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none px-0 font-bold text-slate-400"
              >
                Loan History
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none px-0 font-bold text-slate-400"
              >
                Wallet & Ledger
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none px-0 font-bold text-slate-400"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none px-0 font-bold text-slate-400"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="dashboard-card p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Personal Info</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Gender</dt>
                      <dd className="font-medium text-slate-900">{profile.gender || "Not specified"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Marital Status</dt>
                      <dd className="capitalize font-medium text-slate-900">{profile.marital_status || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Region</dt>
                      <dd className="font-medium text-slate-900">{profile.region || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Province</dt>
                      <dd className="font-medium text-slate-900">{profile.province || "N/A"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="dashboard-card p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Financial Summary</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Interest Tier</dt>
                      <dd className="font-bold text-emerald-600">{member.interest_tier}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Personal Wallet</dt>
                      <dd className="font-bold text-slate-900">₱{walletBalance.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Tier-Based Score</dt>
                      <dd className="font-bold text-slate-900">
                        {member.interest_tier === 'T5_3_PERCENT' ? 92 :
                         member.interest_tier === 'T4_3_5_PERCENT' ? 80 :
                         member.interest_tier === 'T3_4_PERCENT' ? 70 :
                         member.interest_tier === 'T2_4_5_PERCENT' ? 60 : 40}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Active Loans</dt>
                      <dd className="font-medium text-slate-900">{member.loans?.length || 0}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="dashboard-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900">Document Verification</h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {member.documents?.length > 0 ? (
                    member.documents.map((doc: any) => (
                      <div key={doc.document_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-slate-500">Uploaded on {new Date(doc.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={
                          doc.verification_status === "verified" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                            : doc.verification_status === "rejected"
                            ? "bg-rose-500/10 text-rose-600 border-rose-200"
                            : "bg-amber-500/10 text-amber-600 border-amber-200"
                        } variant="outline">
                          {doc.verification_status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-sm italic">
                      No documents uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loans" className="mt-0">
               <div className="space-y-4">
                  {member.loans?.length > 0 ? (
                    member.loans.map((loan: any) => (
                      <div key={loan.loan_id} className="dashboard-card p-5 group hover:border-slate-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-bold text-slate-900">Loan #{loan.loan_id}</h5>
                            <p className="text-xs text-slate-500">{loan.product?.name || "Standard Product"}</p>
                          </div>
                          <Badge className={
                            loan.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                            loan.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                            "bg-slate-500/10 text-slate-600 border-slate-200"
                          } variant="outline">
                            {loan.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Applied</p>
                            <p className="font-medium">{new Date(loan.applied_at || member.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Remaining</p>
                            <p className="font-bold text-rose-600">₱{Number(loan.balance_remaining).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Default Risk</p>
                            <p className="font-medium text-slate-600">{loan.is_recovery_loan ? "High (Recovery)" : "Normal"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No loan applications found.</p>
                    </div>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="wallet" className="mt-0">
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {member.savings_accounts?.map((acc: any) => (
                        <div key={acc.account_id} className="dashboard-card p-5">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                 <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                    {acc.account_type.replace(/_/g, ' ')}
                                 </p>
                                 <p className="text-xl font-display font-bold text-slate-900">
                                    ₱{Number(acc.balance).toLocaleString()}
                                 </p>
                              </div>
                           </div>
                           <button 
                             className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                             onClick={() => toast.info("Ledger entry feature coming soon in detailed view.")}
                           >
                             Post Correction
                           </button>
                        </div>
                     ))}
                  </div>

                  <div className="dashboard-card p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                       <h5 className="font-bold text-slate-900 text-sm">Recent Ledger Entries</h5>
                       <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest">
                          View Full Statement
                       </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                       <div className="p-4 text-center text-xs text-slate-400 italic">
                          Ledger deep-dive requires direct database fetch [Action Required].
                       </div>
                    </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
               <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm font-medium">
                     <History className="w-5 h-5 shrink-0" />
                     <p>Audit logs for this member are retrieved dynamically based on system-wide audit table.</p>
                  </div>
                  <div className="dashboard-card p-6 text-center">
                     <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium italic">Detailed activity log integration pending module synchronization.</p>
                  </div>
               </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end gap-3">
          <button 
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            onClick={() => window.print()}
          >
            Export Dataroom
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { toast } from "sonner";
