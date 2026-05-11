"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { renameTenant } from "@/actions/tenant-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TenantNameSettingsCard({
  tenantId,
  initialName,
  title = "Tenant Identity",
  description = "I-update ang company o tenant name na makikita sa buong workspace.",
}: {
  tenantId?: number;
  initialName: string;
  title?: string;
  description?: string;
}) {
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await renameTenant({
        tenantId,
        name,
      });

      if (result.success) {
        toast.success("Tenant name updated successfully.");
      } else {
        toast.error(result.error || "Failed to update tenant name.");
      }
    });
  };

  return (
    <div className="dashboard-card p-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isPending}
          maxLength={100}
          className="h-11 rounded-xl"
          placeholder="Ilagay ang bagong company o tenant name"
        />
        <Button
          onClick={handleSubmit}
          disabled={isPending || name.trim().length < 3}
          className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
        >
          {isPending ? "Saving..." : "Save Name"}
        </Button>
      </div>
    </div>
  );
}
