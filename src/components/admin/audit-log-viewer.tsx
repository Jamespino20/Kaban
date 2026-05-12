"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAuditLogsPaginated, getAuditLogStats } from "@/actions/audit-logs";

type AuditLogEntry = {
  log_id: number;
  tenant_id: number | null;
  user_id: number | null;
  actor_label: string | null;
  module: string;
  action: string;
  action_category: string;
  severity: string;
  entity_type: string | null;
  entity_id: number | null;
  old_values: any | null;
  new_values: any | null;
  ip_address: string | null;
  route: string | null;
  city: string | null;
  created_at: Date;
  tenant: { name: string } | null;
  user: { username: string; email: string } | null;
};

type AuditStats = {
  totalLogs: number;
  byCategory: { action_category: string; _count: number }[];
  bySeverity: { severity: string; _count: number }[];
  topActions: { action: string; _count: number }[];
};

export function AuditLogViewer({ 
  tenantId, 
  userId 
}: { 
  tenantId?: number;
  userId?: number;
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const pageSize = 30;

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [currentPage, moduleFilter, severityFilter, tenantId, userId]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const result = await getAuditLogsPaginated({
        module: moduleFilter !== "all" ? moduleFilter : undefined,
        severity: severityFilter !== "all" ? severityFilter : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        pageSize,
        tenantId,
        userId,
      });

      if (result.success && result.data) {
        setLogs(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getAuditLogStats(tenantId, userId);
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Info className="w-3 h-3 mr-1" />
            Info
          </Badge>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      "": "bg-slate-100 text-slate-500",
      auth: "bg-violet-100 text-violet-700",
      loan: "bg-emerald-100 text-emerald-700",
      payment: "bg-blue-100 text-blue-700",
      user: "bg-cyan-100 text-cyan-700",
      tenant: "bg-amber-100 text-amber-700",
      system: "bg-slate-100 text-slate-700",
      other: "bg-slate-100 text-slate-500",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[category] || colors.other}`}
      >
        {category}
      </span>
    );
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">
                  {stats.totalLogs.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 font-medium">Total Logs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">
                  {stats.byCategory.length}
                </p>
                <p className="text-sm text-slate-500 font-medium">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">
                  {stats.bySeverity.find((s) => s.severity === "critical")
                    ?._count || 0}
                </p>
                <p className="text-sm text-slate-500 font-medium">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">
                  {stats.bySeverity.find((s) => s.severity === "warning")
                    ?._count || 0}
                </p>
                <p className="text-sm text-slate-500 font-medium">Warnings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search actions, entities, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadLogs()}
            className="pl-10"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Modules</option>
          <option value="auth">Authentication</option>
          <option value="loan">Loans</option>
          <option value="payment">Payments</option>
          <option value="user">Users</option>
          <option value="tenant">Tenants</option>
          <option value="system">System</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <Button variant="outline" onClick={loadLogs}>
          <Search className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Logs {tenantId ? "(Tenant)" : "(Cross-Tenant)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-8"></th>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Severity
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Entity
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    User
                  </th>
                  {!tenantId && (
                    <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Tenant
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={tenantId ? 7 : 8} className="py-8 text-center text-slate-400">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <>
                      <tr
                        key={log.log_id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === log.log_id ? null : log.log_id,
                          )
                        }
                      >
                        <td className="py-3 px-3 text-slate-400">
                          {expandedRow === log.log_id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("en-PH")}
                        </td>
                        <td className="py-3 px-3">
                          {getSeverityBadge(log.severity)}
                        </td>
                        <td className="py-3 px-3">
                          {getCategoryBadge(log.action_category)}
                        </td>
                        <td className="py-3 px-3 text-sm font-medium text-slate-900">
                          {log.action}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-600">
                          {log.entity_type && log.entity_id ? (
                            <span className="text-xs">
                              {log.entity_type} #{log.entity_id}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-3 text-sm text-slate-600">
                          {log.user?.username || log.actor_label || "-"}
                        </td>
                        {!tenantId && (
                          <td className="py-3 px-3 text-sm text-slate-600">
                            {log.tenant?.name || "Platform"}
                          </td>
                        )}
                      </tr>
                      {expandedRow === log.log_id && (
                        <tr key={`${log.log_id}-expanded`} className="bg-slate-50/70">
                          <td colSpan={tenantId ? 7 : 8} className="px-6 pb-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                  Previous Values
                                </div>
                                <pre className="max-h-44 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
                                  {log.old_values
                                    ? JSON.stringify(log.old_values, null, 2)
                                    : "{}"}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                                  New Values / Details
                                </div>
                                <pre className="max-h-44 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
                                  {log.new_values
                                    ? JSON.stringify(log.new_values, null, 2)
                                    : "{}"}
                                </pre>
                              </div>
                            </div>
                            {log.ip_address && (
                              <div className="mt-3 text-[10px] text-slate-500">
                                IP: {log.ip_address}
                                {log.city ? ` · ${log.city}` : ""}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
