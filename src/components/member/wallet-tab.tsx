"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  PiggyBank,
  Landmark,
  ArrowUpCircle,
  Plus,
  Loader2,
  CheckCircle2,
  History,
  Info,
  ShieldCheck,
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
import { useRouter } from "next/navigation";

interface WalletTabProps {
  savings: any[];
  transactions: any[];
}

export function WalletTab({ savings, transactions }: WalletTabProps) {
  const router = useRouter();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  const walletAccount = useMemo(
    () => savings.find((acc) => acc.account_type === "personal_wallet"),
    [savings],
  );
  const savingsAccounts = useMemo(
    () => savings.filter((acc) => acc.account_type !== "personal_wallet"),
    [savings],
  );
  const totalSavingsBalance = savingsAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0,
  );
  const walletBalance = Number(walletAccount?.balance || 0);

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
      router.refresh();
    } else {
      toast.error(result.error || "May error sa pagdeposito.");
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "share_capital":
        return <Landmark className="h-5 w-5 text-blue-600" />;
      case "regular_savings":
        return <PiggyBank className="h-5 w-5 text-emerald-600" />;
      case "personal_wallet":
        return <Wallet className="h-5 w-5 text-amber-600" />;
      default:
        return <Wallet className="h-5 w-5 text-slate-600" />;
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

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Dagdag pondo";
      case "withdrawal":
        return "Bawas pondo";
      case "dividend":
        return "Dividend";
      case "fee":
        return "Fee";
      case "default_recovery_debit":
        return "Recovery debit";
      case "default_recovery_credit":
        return "Recovery credit";
      default:
        return type.replaceAll("_", " ");
    }
  };

  const getTransactionTone = (type: string) => {
    if (type === "deposit" || type.includes("credit")) {
      return {
        badge: "bg-emerald-100 text-emerald-700",
        amount: "text-emerald-600",
        sign: "+",
      };
    }

    return {
      badge: "bg-rose-100 text-rose-700",
      amount: "text-rose-600",
      sign: "-",
    };
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Wallet at Ipon
            </h2>
            <p className="text-sm text-slate-500">
              Mas malinaw na tingin sa iyong pansariling wallet, ipon, at branch
              records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[420px]">
            <SummaryCard
              icon={<Wallet className="h-4 w-4" />}
              label="Pansariling Wallet"
              value={formatCurrency(walletBalance)}
              accent="amber"
            />
            <SummaryCard
              icon={<PiggyBank className="h-4 w-4" />}
              label="Kabuuang Ipon"
              value={formatCurrency(totalSavingsBalance)}
              accent="emerald"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-700">
              <Info className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Mock Money Flow
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Ang wallet sa prototype na ito ay internal record ng personal
              branch funds. Kapag nagdagdag ka ng pondo, ang ibig sabihin nito
              ay may totoong cash o transfer na natanggap sa labas ng app, at
              ang Agapay ang nagtatala ng digital history.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Simple Guide
              </p>
            </div>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>1. Magdagdag ng pondo sa wallet kapag may aktwal na cash-in.</li>
              <li>2. Gamitin ang wallet para sa mabilis na loan repayment.</li>
              <li>3. Suriin ang history para sa malinaw na branch record.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-start lg:justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-emerald-600 px-5 py-5 font-bold text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-700">
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
                  I-record ang aktwal na cash-in o transfer na ilalagay sa iyong
                  Pansariling Wallet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Ang action na ito ay para sa branch-recorded wallet top-up.
                  Hindi ito live payment processing.
                </div>
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {savings.map((acc) => (
          <Card
            key={acc.account_id}
            className={`overflow-hidden rounded-[2rem] border ${getAccountBg(acc.account_type)} shadow-sm transition-all hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                {getAccountLabel(acc.account_type)}
              </CardTitle>
              <div className="rounded-xl bg-white/80 p-2 shadow-sm backdrop-blur-sm">
                {getAccountIcon(acc.account_type)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-display font-bold text-slate-900">
                {formatCurrency(Number(acc.balance))}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Status: Aktibo</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-slate-100 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                Kamakailang Transaksyon
              </CardTitle>
              <CardDescription>
                Huling 10 galaw sa wallet at savings records mo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((tx) => {
                const tone = getTransactionTone(tx.transaction_type);

                return (
                  <div
                    key={tx.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${tone.badge}`}
                          >
                            {getTransactionLabel(tx.transaction_type)}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            {getAccountLabel(tx.account.account_type)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {tx.reference || "Walang reference na naitala"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(tx.processed_at).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}{" "}
                            •{" "}
                            {new Date(tx.processed_at).toLocaleTimeString(
                              "en-PH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p
                          className={`text-lg font-display font-bold ${tone.amount}`}
                        >
                          {tone.sign}
                          {formatCurrency(Number(tx.amount))}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          processed
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-400 italic">
                Wala pang naitalang transaksyon.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "amber" | "emerald";
}) {
  const accentClasses =
    accent === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-xl border px-3 py-3 ${accentClasses}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-[0.18em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-xl font-display font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
