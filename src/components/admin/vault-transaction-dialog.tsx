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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { recordCapitalTransaction } from "@/actions/vault-actions";

const VaultSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number(value) > 0, "Amount must be positive"),
  type: z.enum(["share_capital", "regular_savings"]),
  description: z.string().min(5, "Please provide a detailed description"),
});

export function VaultTransactionDialog({
  direction,
  trigger,
}: {
  direction: "invest" | "withdraw";
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof VaultSchema>>({
    resolver: zodResolver(VaultSchema),
    defaultValues: {
      amount: "",
      type: "share_capital",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof VaultSchema>) => {
    startTransition(async () => {
      try {
        const res = await recordCapitalTransaction({
          amount: Number(values.amount),
          type: values.type,
          description: values.description,
          direction,
        });

        if (res.success) {
          toast.success(`Successfully ${direction === 'invest' ? 'invested' : 'withdrawn'} funds!`);
          setOpen(false);
          form.reset();
          window.location.reload(); // Refresh to show new balances
        }
      } catch (error: any) {
        toast.error(error.message || "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={direction === "invest" ? "default" : "outline"}
            className="w-full gap-2 rounded-xl"
          >
            {direction === "invest" ? (
              <>
                <ArrowDownCircle className="w-4 h-4" />
                Invest
              </>
            ) : (
              <>
                <ArrowUpCircle className="w-4 h-4" />
                Withdraw
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {direction === "invest" ? (
              <ArrowDownCircle className="w-6 h-6 text-emerald-600" />
            ) : (
              <ArrowUpCircle className="w-6 h-6 text-amber-500" />
            )}
            {direction === "invest" ? "Capital Investment" : "Funds Withdrawal"}
          </DialogTitle>
          <DialogDescription>
            {direction === "invest"
              ? "Inject capital into the cooperative funds to increase loan capacity."
              : "Withdraw funds from the cooperative pool. Subject to liquid asset availability."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select fund type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="share_capital">Share Capital (Fixed)</SelectItem>
                      <SelectItem value="regular_savings">Regular Savings (Liquid)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (PHP)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0.00"
                        className="rounded-xl h-12 pl-8 bg-slate-50 border-slate-200"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Ledger Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g. Initial capital injection for Q3 ops"
                      className="rounded-xl min-h-[100px] bg-slate-50 border-slate-200 resize-none"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-xl"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 rounded-xl font-bold ${
                  direction === "invest"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  direction === "invest" ? "Confirm Investment" : "Confirm Withdrawal"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
