"use client";

import { useTransition, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  History,
  User,
  Database,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { getAuditLogs } from "@/actions/tenant-management";
import { format } from "date-fns";

export function AuditLogViewer({ tenantId }: { tenantId?: number }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const data = await getAuditLogs(tenantId);
      setLogs(data);
    });
  }, [tenantId]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
        <Activity className="w-8 h-8 text-slate-300 animate-spin" />
        <p className="text-slate-400 font-medium">
          Kinukuha ang kasaysayan ng audit...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" /> Kasaysayan ng Audit
          </h3>
          <p className="text-sm text-slate-500">
            Live na pagsubaybay sa lahat ng pagbabago at pag-access sa database.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed">
          <Database className="w-12 h-12 text-slate-200 mb-2" />
          <p className="text-slate-500">
            Walang audit logs na nakita para sa panahong ito.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log: any) => (
            <Card
              key={log.id}
              className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() =>
                  setExpandedLog(expandedLog === log.id ? null : log.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      log.action.startsWith("READ")
                        ? "bg-blue-50 text-blue-600"
                        : log.action === "CREATE"
                          ? "bg-emerald-50 text-emerald-600"
                          : log.action === "UPDATE"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                    }`}
                  >
                    {log.action.startsWith("READ") ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {log.action}
                      </span>
                      <span className="text-slate-400 text-xs">sa</span>
                      <span className="font-medium text-slate-600 px-2 py-0.5 bg-slate-100 rounded text-xs">
                        {log.entity_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <User className="w-3 h-3" /> {log.username || "System"}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />{" "}
                        {format(
                          new Date(log.created_at),
                          "MMM d, yyyy HH:mm:ss",
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {expandedLog === log.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {expandedLog === log.id && (
                <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50 pt-4 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-2">
                      <div className="text-slate-400 uppercase font-sans font-bold tracking-wider">
                        Dati
                      </div>
                      <pre className="p-3 bg-white border border-slate-200 rounded-lg overflow-x-auto max-h-40">
                        {log.old_values
                          ? JSON.stringify(log.old_values, null, 2)
                          : "{}"}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <div className="text-emerald-600 uppercase font-sans font-bold tracking-wider">
                        Pagkatapos / Detalye
                      </div>
                      <pre className="p-3 bg-white border border-slate-200 rounded-lg overflow-x-auto max-h-40">
                        {JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
