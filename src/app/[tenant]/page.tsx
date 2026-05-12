import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, ArrowRight, BadgeCheck, CheckCircle2, Shield, Calculator, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getActiveTenantsForNav } from "@/actions/tenant-management";

const FEATURE_CARDS = [
  {
    title: "Digital Receipts and clear transaction records",
    description: "Every repayment, release, and verification has a clear history. You don't have to rely on screenshots or hearsay.",
  },
  {
    title: "Trust Score with full transparency",
    description: "Member evaluation is dynamic. Repayment behavior, community standing, and lending readiness are visible in a clear, explainable way.",
  },
  {
    title: "Guarantors, Mentorship, and community support",
    description: "This is not just a wallet app. It's cooperative lending with Guarantors, Mentorship, and more human guidance as your business grows.",
  },
];

export default async function TenantIndexPage({
  params,
  searchParams,
}: {
  params: { tenant: string };
  searchParams: { preview?: string };
}) {
  const { tenant } = params;
  const isPreview = searchParams.preview === "true";
  const session = await auth();

  if (session?.user?.id && !isPreview) {
    if (session.user.role === "member") {
      redirect(`/${tenant}/agapay-pintig`);
    } else {
      redirect(`/${tenant}/agapay-tanaw`);
    }
  }

  const tenantData = await prisma.tenant.findUnique({
    where: { slug: tenant },
  });

  if (!tenantData || !tenantData.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Tenant Not Found</h1>
          <p className="text-slate-500 mb-8">
            The cooperative tenant you are looking for does not exist or is currently inactive.
          </p>
          <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition">
            Go to Main Homepage
          </Link>
        </div>
      </div>
    );
  }

  const activeTenants = await getActiveTenantsForNav();
  const brandColor = tenantData.brand_color || tenantData.accent_color || "#059669";
  const accentColor = tenantData.accent_color || brandColor;

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar 
        tenants={activeTenants} 
        forceSolid 
        brandColor={brandColor} 
        tenantLogo={tenantData.logo_url}
      />

      <main className="relative z-20 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full min-h-[90vh] flex flex-col items-start justify-center px-6 max-w-7xl pt-40">
          <div className="max-w-5xl animate-in fade-in slide-in-from-left-12 duration-1000">
            <span
              className="inline-flex items-center gap-2 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 rounded-full border backdrop-blur-sm"
              style={{
                color: brandColor,
                backgroundColor: `${brandColor}15`,
                borderColor: `${brandColor}30`,
              }}
            >
              <BadgeCheck className="w-4 h-4" />
              {tenantData.name} — Official Portal
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-950">
              {tenantData.name}
              <span className="block" style={{ color: brandColor }}>
                Iyong Agapay, Ating Tagumpay
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-12 leading-relaxed max-w-3xl text-slate-700">
              Welcome to your cooperative&apos;s official portal. Manage applications, releases, repayments, and more — all in one transparent system.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${tenant}/auth/login`}
                className="font-bold h-12 px-8 rounded-full shadow-lg transition-all flex items-center justify-between gap-3 text-lg text-white"
                style={{ backgroundColor: brandColor }}
              >
                Member Login <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/${tenant}/auth/register`}
                className="px-10 py-3 bg-slate-200/85 backdrop-blur-md text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-all flex items-center gap-3 border border-slate-300/30"
              >
                <Calculator className="w-5 h-5" />
                Apply for Membership
              </Link>
            </div>
          </div>
        </section>

        <div className="w-full bg-slate-50 flex flex-col items-center">
          {/* Features Section */}
          <section className="w-full py-24 px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 italic tracking-tight">
                Why choose {tenantData.name}?
              </h2>
              <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                Built for cooperative lending with Guarantors, Trust Scores, and transparent operations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="p-8 rounded-[2.5rem] bg-white border border-slate-200/60 hover:shadow-lg transition-all duration-700 flex flex-col items-start text-left"
                >
                  <div
                    className="p-4 rounded-2xl mb-6 transition-all duration-700"
                    style={{
                      backgroundColor: `${brandColor}10`,
                      color: brandColor,
                    }}
                  >
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mb-3 italic tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="w-full py-20 px-6 max-w-7xl">
            <div className="rounded-[3rem] p-10 md:p-14 shadow-xl text-white"
              style={{ backgroundColor: brandColor }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-10">
                <div>
                  <h2 className="text-3xl font-black italic mb-6">
                    About {tenantData.name}
                  </h2>
                  <p className="text-white/85 leading-relaxed text-lg">
                    {tenantData.name} is a cooperative powered by Agapay, providing transparent lending services, member support, and community-driven financial solutions.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    "Transparent digital records for every transaction",
                    "Trust-backed lending with Guarantors and Mentorship",
                    "Dedicated member support and community focus",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 px-4 py-3"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: `${brandColor}90` }} />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA with Login/Register */}
          <section className="w-full py-24 px-6 max-w-5xl">
            <div
              className="relative w-full rounded-[4rem] p-16 md:p-28 text-center text-white overflow-hidden group shadow-2xl"
              style={{ backgroundColor: brandColor }}
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-4xl md:text-6xl font-black italic mb-8 leading-none tracking-tight">
                  Join {tenantData.name} today
                </h2>
                <p className="text-xl md:text-2xl font-medium text-white/85 mb-14 max-w-3xl opacity-90 leading-relaxed">
                  Sign in to your account or apply for membership to start your cooperative journey.
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  <Link
                    href={`/${tenant}/auth/login`}
                    className="bg-white font-black h-14 px-10 rounded-full shadow-xl transition-all flex items-center justify-between gap-3 text-xl"
                    style={{ color: brandColor }}
                  >
                    Member Login
                  </Link>
                  <Link
                    href={`/${tenant}/auth/register`}
                    className="h-14 px-10 rounded-full border-2 border-white/40 font-bold text-white hover:bg-white/10 transition-all flex items-center gap-3"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Footer brandColor={brandColor} tenantName={tenantData.name} />
        </div>
      </main>
    </div>
  );
}
