"use client";

import React from "react";
import { Users2, Search, MoreVertical, ShieldCheck, Clock } from "lucide-react";

interface MemberDirectoryTabProps {
  members: any[];
}

export function MemberDirectoryTab({ members }: MemberDirectoryTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Hanapin ang miyembro..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Kabuuan: {members.length} Miyembro
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
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
                Mga Loan
              </th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-20 text-center text-slate-400 font-medium"
                >
                  Walang nahanap na miyembro.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const name = member.profile
                  ? `${member.profile.first_name} ${member.profile.last_name}`
                  : member.username;
                return (
                  <tr
                    key={member.user_id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                          {name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {member.email}
                          </p>
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
                        {member.status === "active" ? "aktibo" : member.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {member.loans.length}{" "}
                      {member.loans.length === 1 ? "Loan" : "mga Loan"}
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
    </div>
  );
}
