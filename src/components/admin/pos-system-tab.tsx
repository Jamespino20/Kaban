"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CreditCard,
  Wallet,
  CheckCircle2,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processPosTransaction } from "@/actions/wallet-actions";
import { toast } from "sonner";
import { useFormPersistence } from "@/hooks/use-form-persistence";

interface POSSystemTabProps {
  members: any[];
}

export function POSSystemTab({ members }: POSSystemTabProps) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [type, setType] = useState<"deposit" | "repayment">("deposit");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState(
    `CASH-${Date.now().toString().slice(-6)}`,
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Persistence
  const formData = useMemo(
    () => ({
      type,
      amount,
      reference,
      notes,
      selectedMemberId: selectedMember?.user_id,
    }),
    [type, amount, reference, notes, selectedMember],
  );

  const { clearPersistence } = useFormPersistence(
    "pos_system",
    formData,
    (saved) => {
      setType(saved.type);
      setAmount(saved.amount);
      setReference(saved.reference);
      setNotes(saved.notes);
      if (saved.selectedMemberId) {
        const m = members.find(
          (member) => member.user_id === saved.selectedMemberId,
        );
        if (m) setSelectedMember(m);
      }
    },
  );

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return [];
    return members
      .filter((m) => {
        const name = m.profile
          ? `${m.profile.first_name} ${m.profile.last_name}`
          : m.username;
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          m.member_code?.toLowerCase().includes(search.toLowerCase())
        );
      })
      .slice(0, 5);
  }, [members, search]);

  const handleProcess = async () => {
    if (!selectedMember) return toast.error("Pumili ng miyembro.");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return toast.error("Ilagay ang tamang halaga.");

    setLoading(true);
    const res = await processPosTransaction({
      targetUserId: selectedMember.user_id,
      type,
      amount: Number(amount),
      reference,
      notes,
    });
    setLoading(true); // Should be false after res, fixing it below

    if (res.success) {
      toast.success(res.success);
      clearPersistence();
      setSelectedMember(null);
      setAmount("");
      setSearch("");
      setReference(`CASH-${Date.now().toString().slice(-6)}`);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-slate-900 italic text-xl">
              Search Member
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Pangalan o Member Code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-slate-900/5 transition-all"
            />
          </div>

          <div className="space-y-2 mt-4">
            {filteredMembers.map((m) => (
              <button
                key={m.user_id}
                onClick={() => {
                  setSelectedMember(m);
                  setSearch("");
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                  {m.profile?.first_name?.[0]}
                  {m.profile?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900LeadingTight mb-0.5">
                    {m.profile?.first_name} {m.profile?.last_name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {m.member_code}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedMember && (
          <div className="bg-primary p-6 rounded-2xl text-white shadow-xl shadow-emerald-900/20 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Active Status
                </p>
                <p className="text-sm font-bold capitalize">
                  {selectedMember.status}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                Miyembro
              </p>
              <h3 className="text-2xl font-display font-medium leading-tight">
                {selectedMember.profile?.first_name} <br />{" "}
                {selectedMember.profile?.last_name}
              </h3>
              <p className="text-xs text-emerald-300/70 font-mono mt-1">
                {selectedMember.member_code}
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  Wallet Balance
                </p>
                <p className="text-lg font-bold">
                  ₱
                  {Number(
                    selectedMember.savings_accounts?.[0]?.balance || 0,
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  Active Loan
                </p>
                <p className="text-lg font-bold">
                  {selectedMember.loans?.filter(
                    (l: any) => l.status === "active",
                  ).length > 0
                    ? "Yes"
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 italic">
                  Cash Transaction Portal
                </h2>
                <p className="text-sm text-slate-500">
                  Process real-world cash payments directly into Agapay.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Transaction Type
                </Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold focus:ring-slate-900/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                    <SelectItem
                      value="deposit"
                      className="py-3 rounded-xl focus:bg-emerald-50 focus:text-emerald-900"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4" />
                        <span>Wallet Deposit</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="repayment"
                      className="py-3 rounded-xl focus:bg-indigo-50 focus:text-indigo-900"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Loan Repayment</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Cash Amount (₱)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 text-2xl font-display font-bold rounded-2xl border-slate-200 bg-slate-50 focus:ring-slate-900/5 transition-all text-slate-900 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Reference Number
                </Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-14 font-mono font-bold rounded-2xl border-slate-200 bg-slate-50 focus:ring-slate-900/5"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Additional Notes
                </Label>
                <Input
                  placeholder="e.g. Over-the-counter cash"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 bg-slate-50 focus:ring-slate-900/5"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium max-w-xs leading-relaxed italic">
                Siguraduhin na nabilang na ang cash bago iconfirm ang
                transaksyon. Ang transaksyong ito ay final.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleProcess}
              disabled={loading || !selectedMember}
              className="w-full md:w-auto h-16 px-12 rounded-[1.25rem] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-600/20 gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : `Confirm ${type === "deposit" ? "Deposit" : "Repayment"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
