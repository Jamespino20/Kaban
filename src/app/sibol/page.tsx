import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Settings2,
  Users2,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { LoanProductsTab } from "@/components/admin/loan-products-tab";
import { TenantManagementTab } from "@/components/admin/tenant-management-tab";
import { getTenants } from "@/actions/tenant-management";

export default async function SibolPage() {
  const tenants = await getTenants();

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight italic">
              Sibol Growth Engine
            </h1>
            <p className="text-slate-500 font-sans">
              Central Command for Kaban Financial Operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-1.5 border border-slate-200/60 rounded-2xl shadow-sm overflow-x-auto">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger
                value="overview"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                <span>Loan Products</span>
              </TabsTrigger>
              <TabsTrigger
                value="branches"
                className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Branch Ops</span>
              </TabsTrigger>
              <TabsTrigger
                value="approvals"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Approvals</span>
              </TabsTrigger>

              <TabsTrigger
                value="members"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <Users2 className="w-4 h-4" />
                <span>Members</span>
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:block px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Kaban Administrative Tier
              </span>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                "Total Liquidity",
                "Active Loans",
                "Pending Verification",
                "Portfolio Yield",
              ].map((stat) => (
                <div
                  key={stat}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    {stat}
                  </h3>
                  <p className="text-2xl font-display font-bold text-slate-900">
                    ₱0.00
                  </p>
                </div>
              ))}
            </div>
            {/* Placeholder for real charts later */}
            <div className="h-[400px] w-full bg-slate-900/5 border border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 font-medium">
              Primary Analytics Engine - Ready for Deployment
            </div>
          </TabsContent>

          <TabsContent value="products" className="outline-none">
            <LoanProductsTab />
          </TabsContent>

          <TabsContent value="branches" className="outline-none">
            <TenantManagementTab initialTenants={tenants} />
          </TabsContent>

          <TabsContent value="approvals" className="outline-none">
            <div className="bg-white p-20 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                Walang pending approvals sa kasalukuyan.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="members" className="outline-none">
            <div className="bg-white p-20 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Users2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                Member Directory engine loading...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
