"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { createLoanProduct } from "@/actions/loan-product";

const LoanProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  min_amount: z.coerce.number().min(0, "Min amount must be positive"),
  max_amount: z.coerce.number().min(0, "Max amount must be positive"),
  interest_rate_percent: z.coerce
    .number()
    .min(0, "Interest rate must be positive"),
  max_term_months: z.coerce.number().min(1, "Term must be at least 1 month"),
});

interface CreateProductFormProps {
  onSuccess: () => void;
}

export const CreateProductForm = ({ onSuccess }: CreateProductFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoanProductSchema>>({
    resolver: zodResolver(LoanProductSchema),
    defaultValues: {
      name: "",
      description: "",
      min_amount: 500,
      max_amount: 10000,
      interest_rate_percent: 5,
      max_term_months: 6,
    },
  });

  const onSubmit = (values: z.infer<typeof LoanProductSchema>) => {
    startTransition(async () => {
      try {
        const result = await createLoanProduct(values);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Loan product created!");
          form.reset();
          onSuccess();
        }
      } catch (error) {
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Micro-Business Loan"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Amount (₱)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Amount (₱)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interest_rate_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_term_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Term (Months)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          disabled={isPending}
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          {isPending ? "Creating..." : "Save Product"}
        </Button>
      </form>
    </Form>
  );
};
