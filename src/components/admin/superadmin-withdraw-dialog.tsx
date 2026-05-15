"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";

const WithdrawSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  methodLabel: z.string().optional(),
  externalReference: z.string().optional(),
});

type WithdrawFormValues = z.infer<typeof WithdrawSchema>;

export default function SuperadminWithdrawDialog({
  balance,
}: {
  balance: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(WithdrawSchema),
    defaultValues: {
      amount: "",
      methodLabel: "Bank transfer",
      externalReference: "",
    },
  });

  const onSubmit = (values: WithdrawFormValues) => {
    startTransition(async () => {
      try {
        const result = await api.admin.withdrawSuperadminEarnings(
          Number(values.amount),
          values.methodLabel?.trim(),
          values.externalReference?.trim(),
        );

        if (result.status !== "success") {
          throw new Error(result?.message || "Withdrawal failed.");
        }

        toast.success(result.message || "Withdrawal completed.");
        setOpen(false);
        form.reset();
        window.location.reload();
      } catch (error: any) {
        toast.error(error?.message || "Unable to complete withdrawal.");
      }
    });
  };

  const availableBalance = Number(balance || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-xl"
          disabled={availableBalance <= 0}
        >
          <ArrowUpCircle className="w-4 h-4" />
          Withdraw Earnings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 text-amber-500" />
            Withdraw Superadmin Earnings
          </DialogTitle>
          <DialogDescription>
            Withdraw funds from the platform earnings wallet. The ledger will be updated automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Available balance: ₱{availableBalance.toLocaleString()}
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₱</span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="rounded-xl h-12 pl-10 bg-white border-slate-200"
                        disabled={isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="methodLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Method</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Bank transfer, GCash, etc."
                      className="rounded-xl h-12 bg-white border-slate-200"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Optional transaction reference or note"
                      className="rounded-2xl min-h-[110px] bg-white border-slate-200"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto rounded-xl"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto rounded-xl font-semibold"
                disabled={isPending || availableBalance <= 0}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Withdrawal"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
