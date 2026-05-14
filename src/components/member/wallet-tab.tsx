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
  Upload,
  X,
} from "lucide-react";
import { requestWalletTopUp } from "@/actions/wallet-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WalletTabProps {
  savings: any[];
  transactions: any[];
}

export function WalletTab({ savings, transactions }: WalletTabProps) {
  const router = useRouter();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("500");
  const [depositMethod, setDepositMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  const formatDate = (raw: string | Date | null | undefined) => {
    if (!raw) return "No date";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "Invalid date";
    return (
      d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
    );
  };

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
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!depositMethod) {
      toast.error("Please select a deposit method.");
      return;
    }
    if (!referenceNumber.trim()) {
      toast.error("Please enter a reference number.");
      return;
    }

    setIsDepositing(true);
    let receiptUrl: string | undefined;
    if (proofFile) {
      const formData = new FormData();
      formData.append("file", proofFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          receiptUrl = data.url;
        }
      } catch {
        // fallback: continue without URL on upload failure
      }
    }
    const result = await requestWalletTopUp(amount, receiptUrl, depositMethod, referenceNumber);
    setIsDepositing(false);

    if (result.success) {
      toast.success(result.success);
      setDepositAmount("");
      setDepositMethod("");
      setReferenceNumber("");
      setProofFile(null);
      setIsDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Error during deposit.");
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
        return "Personal Wallet";
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
        return "Add funds";
      case "withdrawal":
        return "Withdraw funds";
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
      <div className="dashboard-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Wallet & Savings</h2>
            <p className="text-sm text-slate-500">
              A clearer view of your personal wallet, savings, and tenant records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[420px]">
            <SummaryCard
              icon={<Wallet className="h-4 w-4" />}
              label="Personal Wallet"
              value={formatCurrency(walletBalance)}
              accent="amber"
            />
            <SummaryCard
              icon={<PiggyBank className="h-4 w-4" />}
              label="Total Savings"
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
              The wallet in this prototype is an internal record of personal
              tenant funds. When you add funds, it means actual cash or a
              transfer has been received outside the app, and Agapay records the
              digital history.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/[0.07] p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Simple Guide
              </p>
            </div>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>
                1. Add funds to your wallet when you have an actual cash-in.
              </li>
              <li>2. Use your wallet for fast loan repayment.</li>
              <li>3. Check your history for a clear tenant record.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-start lg:justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-primary px-5 py-5 font-bold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" />
                Add to Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-primary/10 bg-white p-8 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-bold">
                  Add Funds
                </DialogTitle>
                <DialogDescription>
                  Record the actual cash-in or transfer to be added to your
                  Personal Wallet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  This action will create a top-up request to the Operator.
                  Wait for their approval before the funds enter your wallet.
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Amount (PHP)
                    </label>
                    <span className="text-xs text-slate-400">₱{depositAmount || "0"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[100, 500, 1000, 2000, 5000, 10000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(String(preset))}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                          Number(depositAmount) === preset
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        ₱{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                      ₱
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-14 rounded-2xl border-slate-100 pl-10 text-xl font-display font-bold focus:border-primary/30 focus:ring-primary/30"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Deposit Method
                  </label>
                  <Select value={depositMethod} onValueChange={setDepositMethod}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 text-base font-bold focus:border-primary/30 focus:ring-primary/30">
                      <SelectValue placeholder="Select deposit method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GCash">GCash</SelectItem>
                      <SelectItem value="Maya">Maya</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Over-the-Counter">Over-the-Counter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Reference Number
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. GCash ref #, bank confirmation #"
                    className="h-14 rounded-2xl border-slate-100 text-base font-medium focus:border-primary/30 focus:ring-primary/30"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Proof of Deposit (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 hover:border-primary/30 hover:bg-primary/10 transition-colors">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="font-medium">
                        {proofFile ? proofFile.name : "Upload screenshot or receipt"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {proofFile && (
                      <button
                        type="button"
                        onClick={() => setProofFile(null)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={isDepositing}
                  className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {isDepositing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowUpCircle className="mr-2 h-5 w-5" />
                  )}
                  Submit Deposit Request
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
                <span>Status: Active</span>
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
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Last 10 movements in your wallet and savings records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((tx: any) => {
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
                            {tx.reference || "No reference recorded"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(tx.processed_at)}
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
                No transactions recorded yet.
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
