"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAIConfig } from "@/actions/superadmin-actions";
import { Save, AlertCircle, Bot, Zap, Bell, Target } from "lucide-react";

const aiConfigSchema = z.object({
  snapshotPrompts: z.object({
    overview: z.string().min(1, "Prompt cannot be empty"),
    portfolio: z.string().min(1, "Prompt cannot be empty"),
    risk: z.string().min(1, "Prompt cannot be empty"),
    financial: z.string().min(1, "Prompt cannot be empty"),
  }),
  riskSensitivity: z.enum(["low", "medium", "high"]),
  notificationSettings: z.object({
    enableRiskAlerts: z.boolean(),
    enablePortfolioInsights: z.boolean(),
    enableAutomatedReports: z.boolean(),
    reportFrequency: z.enum(["daily", "weekly", "monthly"]),
  }),
  analysisConfig: z.object({
    maxLoanAmountToAnalyze: z.number().min(0, "Must be positive"),
    minDataPointsForInsights: z.number().min(1, "Must be at least 1"),
    anomalyDetectionThreshold: z.number().min(0).max(100),
  }),
});

type AIConfigFormValues = z.infer<typeof aiConfigSchema>;

export function AIConfigTab({ initialConfig }: { initialConfig?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AIConfigFormValues>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      snapshotPrompts: {
        overview: initialConfig?.snapshotPrompts?.overview ?? "Summarize the overall health of the cooperative.",
        portfolio: initialConfig?.snapshotPrompts?.portfolio ?? "Analyze the active loan portfolio and suggest improvements.",
        risk: initialConfig?.snapshotPrompts?.risk ?? "Identify high-risk patterns in recent repayments.",
        financial: initialConfig?.snapshotPrompts?.financial ?? "Provide financial tips based on wallet transactions.",
      },
      riskSensitivity: initialConfig?.riskSensitivity ?? "medium",
      notificationSettings: {
        enableRiskAlerts: initialConfig?.notificationSettings?.enableRiskAlerts ?? true,
        enablePortfolioInsights: initialConfig?.notificationSettings?.enablePortfolioInsights ?? true,
        enableAutomatedReports: initialConfig?.notificationSettings?.enableAutomatedReports ?? false,
        reportFrequency: initialConfig?.notificationSettings?.reportFrequency ?? "weekly",
      },
      analysisConfig: {
        maxLoanAmountToAnalyze: initialConfig?.analysisConfig?.maxLoanAmountToAnalyze ?? 1000000,
        minDataPointsForInsights: initialConfig?.analysisConfig?.minDataPointsForInsights ?? 5,
        anomalyDetectionThreshold: initialConfig?.analysisConfig?.anomalyDetectionThreshold ?? 80,
      },
    },
  });

  async function onSubmit(data: AIConfigFormValues) {
    setIsSubmitting(true);
    try {
      const result = await updateAIConfig(data);
      if (result.success) {
        toast.success("AI configuration updated successfully");
      } else {
        toast.error(result.error || "Failed to update configuration");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const { formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System Prompt Templates */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden lg:col-span-2">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                <Bot className="w-4 h-4" />
              </span>
              System Prompts
            </CardTitle>
            <CardDescription>
              Configure the templates used by the AI engine to generate insights and summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sp-overview">Overview Snapshot Prompt</Label>
                <Textarea id="sp-overview" className="h-24 resize-none" {...form.register("snapshotPrompts.overview")} />
                {errors.snapshotPrompts?.overview && (
                  <p className="text-xs text-rose-500">{errors.snapshotPrompts.overview.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-portfolio">Portfolio Prompt</Label>
                <Textarea id="sp-portfolio" className="h-24 resize-none" {...form.register("snapshotPrompts.portfolio")} />
                {errors.snapshotPrompts?.portfolio && (
                  <p className="text-xs text-rose-500">{errors.snapshotPrompts.portfolio.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-risk">Risk Assessment Prompt</Label>
                <Textarea id="sp-risk" className="h-24 resize-none" {...form.register("snapshotPrompts.risk")} />
                {errors.snapshotPrompts?.risk && (
                  <p className="text-xs text-rose-500">{errors.snapshotPrompts.risk.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp-financial">Financial Tips Prompt</Label>
                <Textarea id="sp-financial" className="h-24 resize-none" {...form.register("snapshotPrompts.financial")} />
                {errors.snapshotPrompts?.financial && (
                  <p className="text-xs text-rose-500">{errors.snapshotPrompts.financial.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engine and Sensitivity */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Zap className="w-4 h-4" />
              </span>
              Analysis Engine
            </CardTitle>
            <CardDescription>
              Configure how aggressive the AI should be when flagging data patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Risk Sensitivity</Label>
              <Select 
                value={form.watch("riskSensitivity")} 
                onValueChange={(val: any) => form.setValue("riskSensitivity", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Relaxed</SelectItem>
                  <SelectItem value="medium">Medium - Balanced</SelectItem>
                  <SelectItem value="high">High - Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ac-max-loan">Max Loan Amount to Analyze (₱)</Label>
              <Input id="ac-max-loan" type="number" {...form.register("analysisConfig.maxLoanAmountToAnalyze", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac-min-dp">Minimum Data Points for Insights</Label>
              <Input id="ac-min-dp" type="number" {...form.register("analysisConfig.minDataPointsForInsights", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac-anomaly">Anomaly Detection Threshold (%)</Label>
              <Input id="ac-anomaly" type="number" {...form.register("analysisConfig.anomalyDetectionThreshold", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        {/* AI Notification Settings */}
        <Card className="hover:shadow-md transition-shadow border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                <Bell className="w-4 h-4" />
              </span>
              Alerts & Notifications
            </CardTitle>
            <CardDescription>
              Manage parameters for AI-generated alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Risk Alerts</Label>
                <p className="text-sm text-slate-500">Allow AI to trigger warnings for detected risks.</p>
              </div>
              <Switch 
                checked={form.watch("notificationSettings.enableRiskAlerts")} 
                onCheckedChange={(val) => form.setValue("notificationSettings.enableRiskAlerts", val)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Portfolio Insights</Label>
                <p className="text-sm text-slate-500">Allow AI to suggest growth opportunities to operators.</p>
              </div>
              <Switch 
                checked={form.watch("notificationSettings.enablePortfolioInsights")} 
                onCheckedChange={(val) => form.setValue("notificationSettings.enablePortfolioInsights", val)} 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automated Reports</Label>
                <p className="text-sm text-slate-500">Send digested summaries regularly.</p>
              </div>
              <Switch 
                checked={form.watch("notificationSettings.enableAutomatedReports")} 
                onCheckedChange={(val) => form.setValue("notificationSettings.enableAutomatedReports", val)} 
              />
            </div>
            
            {form.watch("notificationSettings.enableAutomatedReports") && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <Label>Report Frequency</Label>
                <Select 
                  value={form.watch("notificationSettings.reportFrequency")} 
                  onValueChange={(val: any) => form.setValue("notificationSettings.reportFrequency", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Digested Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Comprehensive Review</SelectItem>
                    <SelectItem value="monthly">Monthly Full Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
              Saving Configuration...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Commit AI Configuration
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
