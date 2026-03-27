"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, Plus, Map } from "lucide-react";

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
import { createBranch, getRegions } from "@/actions/tenant-management";

const BranchSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  groupId: z.string().min(1, "Region is required"),
});

export function CreateBranchForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getRegions().then(setRegions as any);
  }, []);

  const form = useForm<z.infer<typeof BranchSchema>>({
    resolver: zodResolver(BranchSchema),
    defaultValues: {
      name: "",
      slug: "",
      groupId: "",
    },
  });

  const onSubmit = (values: z.infer<typeof BranchSchema>) => {
    startTransition(async () => {
      const res = await createBranch(
        values.name,
        values.slug,
        parseInt(values.groupId),
      );
      if (res.success) {
        toast.success("Branch created successfully!");
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create branch");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Region</FormLabel>
              <FormControl>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm outline-none"
                  >
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id.toString()}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    {...field}
                    placeholder="e.g. Lipa Branch"
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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. lipa-branch" />
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
          {isPending ? "Creating..." : "Create Branch"}
        </Button>
      </form>
    </Form>
  );
}
