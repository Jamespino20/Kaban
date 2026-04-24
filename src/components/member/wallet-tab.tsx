"use client";

import { useState } from "react";
import {
  Wallet,
  PiggyBank,
  Landmark,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Loader2,
  CheckCircle2,
  History,
} from "lucide-react";
import { depositToWallet } from "@/actions/wallet-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface WalletTabProps {
  savings: any[];
  transactions: any[];
}

export function WalletTab({ savings, transactions }: WalletTabProps) {
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Valid na halaga ang kailangan.");
      return;
    }

    setIsDepositing(true);
    const result = await depositToWallet(amount);
    setIsDepositing(false);

    if (result.success) {
      toast.success(result.success);
      setDepositAmount("");
      setIsDialogOpen(false);
    } else {
      toast.error(result.error || "May error sa pagdeposito.");
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "share_capital":
        return <Landmark className="h-6 w-6 text-blue-600" />;
      case "regular_savings":
        return <PiggyBank className="h-6 w-6 text-emerald-600" />;
      case "personal_wallet":
        return <Wallet className="h-6 w-6 text-amber-600" />;
      default:
        return <Wallet className="h-6 w-6 text-slate-600" />;
    }
  };

  const getAccountLabel = (type: string) => {
    switch (type) {
      case "share_capital":
        return "Share Capital";
      case "regular_savings":
        return "Regular Savings";
      case "personal_wallet":
        return "Pansariling Wallet";
      default:
        return type;
    }
  };

  const getAccountBg = (type: string) => {
    switch (type) {
      case "share_capital":
        return "bg-blue-50 border-blue-100";
      case "regular_savings":
        return "bg-emerald-50 border-emerald-100";
      case "personal_wallet":
        return "bg-amber-50 border-amber-100";
      default:
        return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Wallet Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Aking Pananalapi
          </h2>
          <p className="text-slate-500 text-sm">
            Pamahalaan ang iyong savings at personal na pondo.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-emerald-600 px-6 py-6 font-bold text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-700">
              <Plus className="mr-2 h-5 w-5" />
              Magdagdag sa Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] border-emerald-100 bg-white p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">
                Magdagdag ng Pondo
              </DialogTitle>
              <DialogDescription>
                Magpasok ng halagang ilalagay sa iyong Pansariling Wallet para
                sa daily credits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Halaga (PHP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ₱
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-14 rounded-2xl border-slate-100 pl-10 text-xl font-display font-bold focus:border-emerald-300 focus:ring-emerald-300"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="h-14 w-full rounded-2xl bg-emerald-600 text-lg font-bold text-white hover:bg-emerald-700"
              >
                {isDepositing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUpCircle className="mr-2 h-5 w-5" />
                )}
                Kumpirmahin ang Deposito
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account Grids */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {savings.map((acc) => (
          <Card
            key={acc.account_id}
            className={`overflow-hidden rounded-[2.5rem] border ${getAccountBg(acc.account_type)} shadow-sm transition-all hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">
                {getAccountLabel(acc.account_type)}
              </CardTitle>
              <div className="rounded-xl bg-white/80 p-2 shadow-sm backdrop-blur-sm">
                {getAccountIcon(acc.account_type)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display font-bold text-slate-900">
                {formatCurrency(Number(acc.balance))}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Status: Aktibo</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table */}
      <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-50 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-display font-bold">
                Kamakailang Transaksyon
              </CardTitle>
              <CardDescription>
                Ang iyong huling 10 aktibidad sa pananalapi.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-8 py-4">Petsa</th>
                  <th className="px-8 py-4">Uri</th>
                  <th className="px-8 py-4">Deskripsyon</th>
                  <th className="px-8 py-4 text-right">Halaga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-8 py-5">
                        <p className="text-sm font-semibold text-slate-600">
                          {new Date(tx.created_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.created_at).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            tx.transaction_type === "deposit"
                              ? "bg-emerald-100 text-emerald-700"
                              : tx.transaction_type.includes("recovery")
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">
                            {getAccountLabel(tx.account.account_type)}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {tx.reference}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-8 py-5 text-right font-display font-bold ${
                          tx.transaction_type === "deposit" ||
                          tx.transaction_type.includes("credit")
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {tx.transaction_type === "deposit" ||
                        tx.transaction_type.includes("credit")
                          ? "+"
                          : "-"}
                        {formatCurrency(Number(tx.amount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center text-slate-400 italic"
                    >
                      Wala pang naitalang transaksyon.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
