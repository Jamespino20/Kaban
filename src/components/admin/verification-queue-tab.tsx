"use client";

import React from "react";
import {
  FileText,
  UserCheck,
  ArrowRight,
  Fingerprint,
  Calendar,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";

interface VerificationQueueTabProps {
  data: {
    loans: any[];
    verifications: any[];
  };
}

export function VerificationQueueTab({ data }: VerificationQueueTabProps) {
  const { loans, verifications } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pending Loans Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900 italic">
            Mga Application sa Loan
          </h3>
          <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {loans.length}
          </span>
        </div>

        <div className="space-y-4">
          {loans.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] text-slate-400">
              <p className="font-medium">Walang nakabinbing loan apps.</p>
            </div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.loan_id}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {loan.user?.profile?.first_name?.[0]}
                      {loan.user?.profile?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        {loan.user?.profile?.first_name}{" "}
                        {loan.user?.profile?.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {loan.product?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      ₱{Number(loan.principal_amount).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      {loan.term_months}{" "}
                      {loan.term_months === 1 ? "Buwan" : "mga Buwan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(loan.applied_at), "MMM d, yyyy")}
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                    Rebyuhin <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Member Identifications Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Fingerprint className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900 italic">
            Pagpapatunay ng Pagkakakilanlan
          </h3>
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {verifications.length}
          </span>
        </div>

        <div className="space-y-4">
          {verifications.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] text-slate-400">
              <p className="font-medium">Walang nakabinbing identity checks.</p>
            </div>
          ) : (
            verifications.map((user) => (
              <div
                key={user.user_id}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {user.profile?.first_name?.[0]}
                      {user.profile?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">
                        {user.profile?.first_name} {user.profile?.last_name}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold">
                        {user.documents.length} File(s) Uploaded
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
