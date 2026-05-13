"use client";

import { Download, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTransition } from "react";
import { exportRestrictedModuleData } from "@/actions/export-actions";

export function RestrictedAccess({ moduleName }: { moduleName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    startTransition(async () => {
      try {
        const { success, csvContent } = await exportRestrictedModuleData(moduleName);
        if (success && csvContent) {
          // Add BOM for Excel support
          const bom = "\uFEFF";
          const blob = new Blob([bom + csvContent.replace(/\\n/g, "\n")], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${moduleName.toLowerCase().replace(" ", "_")}_export.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`${moduleName} data exported successfully.`);
        }
      } catch (e) {
        toast.error(`Error exporting data: ${(e as Error).message}`);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 border border-slate-200 rounded-3xl min-h-[400px]">
      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <LockKeyhole className="w-8 h-8 text-slate-500" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Restricted Access</h2>
      <p className="text-slate-600 max-w-md mb-8">
        Your current subscription plan does not include access to the <strong>{moduleName}</strong> module. 
        You can still download your historical data using the button below. Contact Superadmin to upgrade your plan.
      </p>
      <Button
        onClick={handleDownload}
        disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
      >
        <Download className="w-5 h-5" />
        {isPending ? "Generating Export..." : `Download ${moduleName} Data`}
      </Button>
    </div>
  );
}
