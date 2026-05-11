"use client";

import { useTransition, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  User,
  Database,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Globe,
} from "lucide-react";
import { getAuditLogs } from "@/actions/tenant-management";
import { format } from "date-fns";

export function AuditLogViewer({ tenantId }: { tenantId?: number }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    startTransition(async () => {
      const data = await getAuditLogs(tenantId);
      setLogs(data);
    });
  }, [tenantId]);

  const filteredLogs = logs.filter((log: any) => {
    const matchesAction =
      actionFilter === "all" ||
      log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesQuery =
      query.trim().length === 0 ||
      log.action.toLowerCase().includes(query.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(query.toLowerCase()) ||
      (log.username || "system").toLowerCase().includes(query.toLowerCase());

    return matchesAction && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getLogRowId = (log: any) => log.log_id ?? log.id ?? null;
  const getActionTone = (action: string) => {
    if (action.startsWith("READ")) {
      return {
        icon: <Eye className="h-4 w-4" />,
        panel: "bg-blue-50 text-blue-600",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      };
    }

    if (action === "CREATE") {
      return {
        icon: <Activity className="h-4 w-4" />,
        panel: "bg-emerald-50 text-emerald-600",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      };
    }

    if (action === "UPDATE") {
      return {
        icon: <Activity className="h-4 w-4" />,
        panel: "bg-amber-50 text-amber-600",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      };
    }

    return {
      icon: <Activity className="h-4 w-4" />,
      panel: "bg-rose-50 text-rose-600",
      badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    };
  };

  const readCount = filteredLogs.filter((log: any) =>
    log.action.startsWith("READ"),
  ).length;
  const createCount = filteredLogs.filter(
    (log: any) => log.action === "CREATE",
  ).length;
  const updateCount = filteredLogs.filter(
    (log: any) => log.action === "UPDATE",
  ).length;
  const alertCount = filteredLogs.filter(
    (log: any) =>
      !log.action.startsWith("READ") &&
      log.action !== "CREATE" &&
      log.action !== "UPDATE",
  ).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, query]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-pulse">
        <Activity className="h-8 w-8 animate-spin text-slate-300" />
        <p className="font-medium text-slate-400">
          Kinukuha ang kasaysayan ng audit...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="dashboard-card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <History className="h-5 w-5 text-emerald-600" />
              Kasaysayan ng Audit
            </h3>
            <p className="text-sm text-slate-500">
              Compact na triage view para sa galaw, pagbabago, at pag-access sa
              records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[420px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Read
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {readCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Create
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {createCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Update
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {updateCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Alerts
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {alertCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hanapin ang action, entity, o username..."
            className="rounded-xl bg-white"
          />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full rounded-xl bg-white">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lahat ng action</SelectItem>
              <SelectItem value="read">READ</SelectItem>
              <SelectItem value="create">CREATE</SelectItem>
              <SelectItem value="update">UPDATE</SelectItem>
              <SelectItem value="delete">DELETE</SelectItem>
              <SelectItem value="decommission">DECOMMISSION</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed p-16 text-center">
          <Database className="mb-2 h-10 w-10 text-slate-200" />
          <p className="text-slate-500">
            Walang audit logs na nakita para sa panahong ito.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {filteredLogs.length} log entries
              </p>
              <p className="text-xs text-slate-500">
                Mas madaling scanin ang importanteng galaw at changes.
              </p>
            </div>
            <p className="text-xs text-slate-500 md:text-right">
              Page <span className="font-bold text-slate-700">{currentPage}</span>{" "}
              of <span className="font-bold text-slate-700">{totalPages}</span>
            </p>
          </div>

          {paginatedLogs.map((log: any) => {
            const rowId = getLogRowId(log);
            const tone = getActionTone(log.action);

            return (
              <Card
                key={rowId ?? `${log.action}-${log.created_at}`}
                className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className="cursor-pointer p-4 hover:bg-slate-50"
                  onClick={() =>
                    setExpandedLog(expandedLog === rowId ? null : rowId)
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className={`rounded-lg p-2 ${tone.panel}`}>
                          {tone.icon}
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone.badge}`}
                        >
                          {log.action}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {log.entity_type}
                        </span>
                        {log.entity_id && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                            ID #{log.entity_id}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">
                            {log.username || "System"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {format(
                              new Date(log.created_at),
                              "MMM d, yyyy HH:mm:ss",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">
                            {log.city
                              ? `${log.city}, ${log.region ?? ""}`
                              : "Lokasyon unavailable"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
                          <Globe className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate font-mono">
                            {log.ip_address || "Walang IP"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-1 shrink-0">
                      {expandedLog === rowId ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedLog === rowId && (
                  <div className="animate-in slide-in-from-top-1 border-t border-slate-100 bg-slate-50/70 px-4 pb-4 pt-4 duration-200">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Dati
                        </div>
                        <pre className="max-h-44 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
                          {log.old_values
                            ? JSON.stringify(log.old_values, null, 2)
                            : "{}"}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                          Pagkatapos / Detalye
                        </div>
                        <pre className="max-h-44 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                    {log.user_agent && (
                      <div className="mt-3 break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500">
                        <span className="mr-2 font-bold uppercase text-slate-600">
                          User Agent:
                        </span>
                        {log.user_agent}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Ipinapakita ang{" "}
              <span className="font-bold text-slate-700">
                {filteredLogs.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                -{Math.min(currentPage * pageSize, filteredLogs.length)}
              </span>{" "}
              ng{" "}
              <span className="font-bold text-slate-700">
                {filteredLogs.length}
              </span>{" "}
              logs
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
