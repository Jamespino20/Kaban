import { DashboardOverviewSkeleton } from "@/components/ui/dashboard-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-slate-100 rounded-lg animate-pulse mb-8" />
      <DashboardOverviewSkeleton />
    </div>
  );
}
