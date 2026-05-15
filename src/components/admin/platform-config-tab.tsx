"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { updatePlatformConfig } from "@/actions/superadmin-actions";
import { Save, AlertCircle } from "lucide-react";

const configSchema = z.object({
  scoringWeights: z.object({
    repaymentBehavior: z.number().min(0).max(100),
    savingsDiscipline: z.number().min(0).max(100),
    loanUtilization: z.number().min(0).max(100),
    membershipActivity: z.number().min(0).max(100),
    peerValidation: z.number().min(0).max(100),
  }),
  riskThresholds: z.object({
    lowRisk: z.number().min(0).max(100),
    mediumRisk: z.number().min(0).max(100),
    highRisk: z.number().min(0).max(100),
  }),
  defaultLoanConfig: z.object({
    minAmount: z.number().min(0),
    maxAmount: z.number().min(0),
    defaultInterestRate: z.number().min(0).max(100),
  }),
  platformSettings: z.object({
    allowSelfRegistration: z.boolean(),
    requireIdentityVerification: z.boolean(),
    enableMentorship: z.boolean(),
    enableCommunity: z.boolean(),
  }),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export function PlatformConfigTab({ initialConfig }: { initialConfig: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      scoringWeights: {
        repaymentBehavior: initialConfig?.scoringWeights?.repaymentBehavior ?? 40,
        savingsDiscipline: initialConfig?.scoringWeights?.savingsDiscipline ?? 20,
        loanUtilization: initialConfig?.scoringWeights?.loanUtilization ?? 10,
        membershipActivity: initialConfig?.scoringWeights?.membershipActivity ?? 10,
        peerValidation: initialConfig?.scoringWeights?.peerValidation ?? 20,
      },
      riskThresholds: {
        lowRisk: initialConfig?.riskThresholds?.lowRisk ?? 70,
        mediumRisk: initialConfig?.riskThresholds?.mediumRisk ?? 40,
        highRisk: initialConfig?.riskThresholds?.highRisk ?? 20,
      },
      defaultLoanConfig: {
        minAmount: initialConfig?.defaultLoanConfig?.minAmount ?? 5000,
        maxAmount: initialConfig?.defaultLoanConfig?.maxAmount ?? 100000,
        defaultInterestRate: initialConfig?.defaultLoanConfig?.defaultInterestRate ?? 3,
      },
      platformSettings: {
        allowSelfRegistration: initialConfig?.platformSettings?.allowSelfRegistration ?? true,
        requireIdentityVerification: initialConfig?.platformSettings?.requireIdentityVerification ?? true,
        enableMentorship: initialConfig?.platformSettings?.enableMentorship ?? false,
        enableCommunity: initialConfig?.platformSettings?.enableCommunity ?? true,
      },
    },
  });

  async function onSubmit(data: ConfigFormValues) {
    setIsSubmitting(true);
    try {
      const result = await updatePlatformConfig(data);
      if (result.success) {
        toast.success("Platform configuration updated successfully");
      } else {
        toast.error(result.error || "Failed to update configuration");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again or contact support if the issue persists.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const { formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trust Scoring Weights */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">⚖️</span>
              Trust Scoring Weights
            </CardTitle>
            <CardDescription>
              Adjust exactly how much impact each category has on global trust computation.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sw-repayment">Repayment (%)</Label>
                <Input id="sw-repayment" type="number" {...form.register("scoringWeights.repaymentBehavior", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sw-savings">Savings (%)</Label>
                <Input id="sw-savings" type="number" {...form.register("scoringWeights.savingsDiscipline", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sw-loan">Loan Utilization (%)</Label>
                <Input id="sw-loan" type="number" {...form.register("scoringWeights.loanUtilization", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sw-peer">Peer Validation (%)</Label>
                <Input id="sw-peer" type="number" {...form.register("scoringWeights.peerValidation", { valueAsNumber: true })} />
              </div>
            </div>
            {errors.scoringWeights && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" /> Check weight values.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Global Settings */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">⚙️</span>
              Platform Feature Flags
            </CardTitle>
            <CardDescription>
              Toggle global operational constraints for all tenants.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Self-Registration</Label>
                <p className="text-sm text-slate-500">Users can create accounts without admin invite.</p>
              </div>
              <Switch 
                checked={form.watch("platformSettings.allowSelfRegistration")} 
                onCheckedChange={(val) => form.setValue("platformSettings.allowSelfRegistration", val)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Strict Identity Verification</Label>
                <p className="text-sm text-slate-500">Block loans until photo ID is approved.</p>
              </div>
              <Switch 
                checked={form.watch("platformSettings.requireIdentityVerification")} 
                onCheckedChange={(val) => form.setValue("platformSettings.requireIdentityVerification", val)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Community Feed</Label>
                <p className="text-sm text-slate-500">Allow members to see platform announcements.</p>
              </div>
              <Switch 
                checked={form.watch("platformSettings.enableCommunity")} 
                onCheckedChange={(val) => form.setValue("platformSettings.enableCommunity", val)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Loan Boundaries */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">💰</span>
              Default Loan Boundaries
            </CardTitle>
            <CardDescription>
              Set universal limits overriding individual cooperative configurations if breached.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lc-min">Minimum Amount (₱)</Label>
              <Input id="lc-min" type="number" {...form.register("defaultLoanConfig.minAmount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lc-max">Maximum Principal Cap (₱)</Label>
              <Input id="lc-max" type="number" {...form.register("defaultLoanConfig.maxAmount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lc-rate">Universal Starting Interest Rate (%)</Label>
              <Input id="lc-rate" type="number" step="0.1" {...form.register("defaultLoanConfig.defaultInterestRate", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        {/* Risk Thresholds */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">🚨</span>
              Risk Tiers
            </CardTitle>
            <CardDescription>
              Define the percentage parameters mapping to global system health tiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rt-high">High Risk Minimum (%)</Label>
              <Input id="rt-high" type="number" {...form.register("riskThresholds.highRisk", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rt-medium">Medium Risk Minimum (%)</Label>
              <Input id="rt-medium" type="number" {...form.register("riskThresholds.mediumRisk", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rt-low">Low Risk Threshold (%)</Label>
              <Input id="rt-low" type="number" {...form.register("riskThresholds.lowRisk", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="flex justify-end p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 mt-8 shadow-sm">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md min-w-[200px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving Rulesets...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Commit Platform Configuration
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
