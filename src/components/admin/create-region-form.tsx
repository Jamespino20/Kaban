"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Globe, Plus } from "lucide-react";

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
import { createRegion } from "@/actions/tenant-management";

const RegionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  regCode: z.string().min(2, "Region code is required"),
});

export function CreateRegionForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegionSchema>>({
    resolver: zodResolver(RegionSchema),
    defaultValues: {
      name: "",
      regCode: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegionSchema>) => {
    startTransition(async () => {
      const res = await createRegion(values.name, values.regCode);
      if (res.success) {
        toast.success("Region created successfully!");
        onOpenChange(false);
        window.location.reload(); // Refresh to see changes
      } else {
        toast.error(res.error || "Failed to create region");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    {...field}
                    placeholder="e.g. CALABARZON"
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 04" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isPending}
          type="submit"
          className="w-full bg-slate-900 text-white"
        >
          {isPending ? "Creating..." : "Create Region"}
        </Button>
      </form>
    </Form>
  );
}
