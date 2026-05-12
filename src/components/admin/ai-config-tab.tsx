"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Bot, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getAIConfig,
  updateAIConfig,
} from "@/actions/superadmin-actions";

type AIConfigData = {
  id?: number;
  snapshotPrompts?: {
    overview?: string;
    portfolio?: string;
    risk?: string;
    financial?: string;
  };
  riskSensitivity?: "low" | "medium" | "high";
  notificationSettings?: {
    enableRiskAlerts?: boolean;
    enablePortfolioInsights?: boolean;
    enableAutomatedReports?: boolean;
    reportFrequency?: "daily" | "weekly" | "monthly";
  };
  analysisConfig?: {
    maxLoanAmountToAnalyze?: number;
    minDataPointsForInsights?: number;
    anomalyDetectionThreshold?: number;
  };
};

const defaultConfig: AIConfigData = {
  riskSensitivity: "medium",
  snapshotPrompts: {
    overview: "",
    portfolio: "",
    risk: "",
    financial: "",
  },
  notificationSettings: {
    enableRiskAlerts: true,
    enablePortfolioInsights: true,
    enableAutomatedReports: false,
    reportFrequency: "weekly",
  },
  analysisConfig: {
    maxLoanAmountToAnalyze: 100000,
    minDataPointsForInsights: 10,
    anomalyDetectionThreshold: 3,
  },
};

export function AIConfigTab() {
  const [config, setConfig] = useState<AIConfigData>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    const res = await getAIConfig();
    if (res.success && res.data) {
      const d = res.data as AIConfigData;
      setConfig({
        riskSensitivity: d.riskSensitivity || "medium",
        snapshotPrompts: {
          overview: d.snapshotPrompts?.overview || "",
          portfolio: d.snapshotPrompts?.portfolio || "",
          risk: d.snapshotPrompts?.risk || "",
          financial: d.snapshotPrompts?.financial || "",
        },
        notificationSettings: {
          enableRiskAlerts:
            d.notificationSettings?.enableRiskAlerts ?? true,
          enablePortfolioInsights:
            d.notificationSettings?.enablePortfolioInsights ?? true,
          enableAutomatedReports:
            d.notificationSettings?.enableAutomatedReports ?? false,
          reportFrequency:
            d.notificationSettings?.reportFrequency || "weekly",
        },
        analysisConfig: {
          maxLoanAmountToAnalyze:
            d.analysisConfig?.maxLoanAmountToAnalyze ?? 100000,
          minDataPointsForInsights:
            d.analysisConfig?.minDataPointsForInsights ?? 10,
          anomalyDetectionThreshold:
            d.analysisConfig?.anomalyDetectionThreshold ?? 3,
        },
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateAIConfig({
      riskSensitivity: config.riskSensitivity,
      snapshotPrompts: config.snapshotPrompts,
      notificationSettings: config.notificationSettings,
      analysisConfig: config.analysisConfig,
    });
    if (res.success) {
      toast.success("AI configuration saved");
    } else {
      toast.error(res.error || "Failed to save AI configuration");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">
          Loading AI configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Risk Sensitivity */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Risk Sensitivity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls how aggressively the AI flags risks.
              </p>
            </div>
            <Select
              value={config.riskSensitivity}
              onValueChange={(v: "low" | "medium" | "high") =>
                setConfig({ ...config, riskSensitivity: v })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (1-4)</SelectItem>
                <SelectItem value="medium">Medium (5-7)</SelectItem>
                <SelectItem value="high">High (8-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Snapshot Prompts */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Snapshot Prompts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI prompt templates for generating platform snapshots.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Overview Prompt
                </label>
                <Textarea
                  value={config.snapshotPrompts?.overview || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      snapshotPrompts: {
                        ...config.snapshotPrompts,
                        overview: e.target.value,
                      },
                    })
                  }
                  placeholder="Prompt for platform overview snapshot..."
                  className="min-h-[100px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Portfolio Prompt
                </label>
                <Textarea
                  value={config.snapshotPrompts?.portfolio || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      snapshotPrompts: {
                        ...config.snapshotPrompts,
                        portfolio: e.target.value,
                      },
                    })
                  }
                  placeholder="Prompt for portfolio analysis..."
                  className="min-h-[100px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Risk Prompt
                </label>
                <Textarea
                  value={config.snapshotPrompts?.risk || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      snapshotPrompts: {
                        ...config.snapshotPrompts,
                        risk: e.target.value,
                      },
                    })
                  }
                  placeholder="Prompt for risk assessment..."
                  className="min-h-[100px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Financial Prompt
                </label>
                <Textarea
                  value={config.snapshotPrompts?.financial || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      snapshotPrompts: {
                        ...config.snapshotPrompts,
                        financial: e.target.value,
                      },
                    })
                  }
                  placeholder="Prompt for financial analysis..."
                  className="min-h-[100px] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Analysis Config */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Analysis Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Parameters for AI analysis engine.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Max Loan Amount to Analyze
                </label>
                <Input
                  type="number"
                  value={config.analysisConfig?.maxLoanAmountToAnalyze || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      analysisConfig: {
                        ...config.analysisConfig,
                        maxLoanAmountToAnalyze: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Min Data Points for Insights
                </label>
                <Input
                  type="number"
                  value={
                    config.analysisConfig?.minDataPointsForInsights || ""
                  }
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      analysisConfig: {
                        ...config.analysisConfig,
                        minDataPointsForInsights: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  Anomaly Detection Threshold
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={
                    config.analysisConfig?.anomalyDetectionThreshold || ""
                  }
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      analysisConfig: {
                        ...config.analysisConfig,
                        anomalyDetectionThreshold: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Notification Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure AI-generated notifications and reports.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Risk Alerts
                  </span>
                  <p className="text-xs text-slate-400">
                    Send alerts when risk thresholds are breached
                  </p>
                </div>
                <Switch
                  checked={
                    config.notificationSettings?.enableRiskAlerts ?? true
                  }
                  onCheckedChange={(v) =>
                    setConfig({
                      ...config,
                      notificationSettings: {
                        ...config.notificationSettings,
                        enableRiskAlerts: v,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Portfolio Insights
                  </span>
                  <p className="text-xs text-slate-400">
                    Periodic portfolio performance summaries
                  </p>
                </div>
                <Switch
                  checked={
                    config.notificationSettings?.enablePortfolioInsights ??
                    true
                  }
                  onCheckedChange={(v) =>
                    setConfig({
                      ...config,
                      notificationSettings: {
                        ...config.notificationSettings,
                        enablePortfolioInsights: v,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Automated Reports
                  </span>
                  <p className="text-xs text-slate-400">
                    Generate and send automated reports
                  </p>
                </div>
                <Switch
                  checked={
                    config.notificationSettings?.enableAutomatedReports ??
                    false
                  }
                  onCheckedChange={(v) =>
                    setConfig({
                      ...config,
                      notificationSettings: {
                        ...config.notificationSettings,
                        enableAutomatedReports: v,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Report Frequency
                  </span>
                </div>
                <Select
                  value={
                    config.notificationSettings?.reportFrequency || "weekly"
                  }
                  onValueChange={(
                    v: "daily" | "weekly" | "monthly",
                  ) =>
                    setConfig({
                      ...config,
                      notificationSettings: {
                        ...config.notificationSettings,
                        reportFrequency: v,
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
