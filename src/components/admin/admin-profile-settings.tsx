"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User2, Mail, Phone } from "lucide-react";
import { updateProfileInfo } from "@/actions/admin-actions";

export function AdminProfileSettings({
  initialData,
}: {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}) {
  const [form, setForm] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    startTransition(async () => {
      const res = await updateProfileInfo(form);
      if (res.success) {
        toast.success("Profile updated successfully.");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    });
  };

  return (
    <div className="dashboard-card p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <User2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900">
            Personal Information
          </h3>
          <p className="text-sm text-slate-500">
            Update your name, email, and contact details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="first-name" className="text-slate-700 font-bold">
            First Name
          </Label>
          <Input
            id="first-name"
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="last-name" className="text-slate-700 font-bold">
            Last Name
          </Label>
          <Input
            id="last-name"
            value={form.lastName}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="email" className="text-slate-700 font-bold flex items-center gap-2">
          <Mail className="h-4 w-4" /> Email
        </Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="phone" className="text-slate-700 font-bold flex items-center gap-2">
          <Phone className="h-4 w-4" /> Phone
        </Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+63..."
          className="h-11 rounded-xl"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="h-12 px-8 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 font-bold"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
