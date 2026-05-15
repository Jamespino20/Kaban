import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Shield, Calculator, Quote, ChevronDown, Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { getActiveTenantsForNav } from "@/actions/tenant-management";

export const dynamic = "force-dynamic";

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

type TenantTestimonial = {
  id: number;
  name: string;
  role_label: string;
  content: string;
  photo_url: string | null;
};

type TenantFaq = {
  id: number;
  question: string;
  answer: string;
};

// Standardized to path-based routing for reliability on .vercel.app

function getTenantPublicHref(tenant: string, path = "") {
  // Standardized to path-based routing for reliability on .vercel.app
  return `/${tenant}${path}`;
}

export default async function TenantIndexPage(props: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
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
    include: {
      homepage_testimonials: {
        where: { is_active: true, workflow_status: "published" },
        orderBy: { sort_order: "asc" },
        take: 5,
      },
      homepage_faqs: {
        where: { is_active: true, workflow_status: "published" },
        orderBy: { sort_order: "asc" },
        take: 8,
      },
    },
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
  const metadata = (tenantData.metadata || {}) as Record<string, any>;
  const heroMediaUrl = metadata?.hero_media_url || metadata?.background_url || null;
  const heroMediaType = metadata?.hero_media_type || "image";
  const tagline = metadata?.tagline || metadata?.heroHeadline || null;
  const heroSubtitle =
    metadata?.heroSubheadline ||
    "Welcome to your cooperative's official portal. Manage applications, releases, repayments, and more — all in one transparent system.";
  const mission =
    metadata?.mission ||
    `${tenantData.name} provides accessible, transparent, and community-backed financial services for its members.`;
  const vision =
    metadata?.vision ||
    "A cooperative community where members can grow their livelihood with clear records, fair access, and shared accountability.";
  const sectionVisibility = (metadata?.section_visibility || {}) as Record<
    string,
    boolean
  >;
  const showFaqs = sectionVisibility.faqs ?? true;
  const showTestimonials = sectionVisibility.testimonials ?? true;
  const testimonials: TenantTestimonial[] = tenantData.homepage_testimonials || [];
  const faqs: TenantFaq[] = tenantData.homepage_faqs || [];

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar
        tenants={activeTenants}
        forceSolid
        brandColor={brandColor}
        tenantLogo={tenantData.logo_url}
        tenantId={tenantData.tenant_id}
        tenantFallbackName={tenantData.name}
      />

      <main className="relative z-20 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section id="home" className="relative w-full min-h-[90vh] flex flex-col items-start justify-center px-6 max-w-7xl pt-40 overflow-hidden">
          {heroMediaUrl && (
            <div className="absolute inset-0 -z-10">
              {heroMediaType === "video" ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster={metadata?.hero_poster_url || undefined}
                >
                  <source src={heroMediaUrl} />
                </video>
              ) : (
                <img
                  src={heroMediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
            </div>
          )}
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
              {tagline ? (
                <span className="block" style={{ color: brandColor }}>
                  {tagline}
                </span>
              ) : (
                <span className="block text-3xl md:text-4xl font-bold not-italic mt-4 text-slate-600">
                  Cooperative Portal
                </span>
              )}
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-12 leading-relaxed max-w-3xl text-slate-700">
              Welcome to your cooperative&apos;s official portal. Manage applications, releases, repayments, and more — all in one transparent system.
            </p>
            <div className="flex flex-wrap gap-4">
              <AuthModal
                initialTab="login"
                tenantId={tenantData.tenant_id.toString()}
                tenantName={tenantData.name}
                currentTenant={tenant}
                brandColor={brandColor}
                Trigger={
                  <Button
                    className="font-bold h-12 px-8 rounded-full shadow-lg transition-all flex items-center justify-between gap-3 text-lg text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    Member Login <ArrowRight className="w-5 h-5" />
                  </Button>
                }
              />
              <AuthModal
                initialTab="register"
                tenantId={tenantData.tenant_id.toString()}
                tenantName={tenantData.name}
                currentTenant={tenant}
                brandColor={brandColor}
                Trigger={
                  <Button
                    className="px-10 h-12 bg-slate-200/85 backdrop-blur-md text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-all flex items-center gap-3 border border-slate-300/30"
                    style={{}}
                  >
                    <Calculator className="w-5 h-5" />
                    Apply for Membership
                  </Button>
                }
              />
            </div>
          </div>
        </section>

        <div className="w-full bg-slate-50 flex flex-col items-center">
          {/* Features Section */}
          <section id="features" className="w-full py-24 px-6 max-w-7xl">
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
          <section id="about" className="w-full py-20 px-6 max-w-7xl">
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
          <section id="contact" className="w-full py-24 px-6 max-w-5xl">
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
                  <AuthModal
                    initialTab="login"
                    tenantId={tenantData.tenant_id.toString()}
                    Trigger={
                      <Button
                        className="bg-white font-black h-14 px-10 rounded-full shadow-xl transition-all flex items-center justify-between gap-3 text-xl"
                        style={{ color: brandColor }}
                      >
                        Member Login
                      </Button>
                    }
                  />
                  <AuthModal
                    initialTab="register"
                    tenantId={tenantData.tenant_id.toString()}
                    Trigger={
                      <Button
                        className="h-14 px-10 rounded-full border-2 border-white/40 font-bold text-white hover:bg-white/10 transition-all flex items-center gap-3"
                      >
                        Register Now
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          {testimonials.length > 0 && (
            <section id="testimonials" className="w-full py-24 px-6 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 italic tracking-tight">
                  What Members Say
                </h2>
                <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                  Hear from fellow members of {tenantData.name}.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-8 rounded-[2.5rem] bg-white border border-slate-200/60 hover:shadow-lg transition-all duration-700 flex flex-col"
                  >
                    <Quote className="w-8 h-8 mb-4" style={{ color: `${brandColor}40` }} />
                    <p className="text-slate-600 leading-relaxed flex-1">&ldquo;{t.content}&rdquo;</p>
                    <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-100">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        {t.photo_url ? (
                          <img src={t.photo_url} alt={t.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          t.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.role_label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <section id="faqs" className="w-full py-24 px-6 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 italic tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-500 max-w-3xl mx-auto font-medium text-lg">
                  Everything you need to know about {tenantData.name}.
                </p>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq) => (
                  <details
                    key={faq.id}
                    className="group rounded-2xl border border-slate-200/60 bg-white overflow-hidden transition-all hover:shadow-md"
                  >
                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-slate-900 font-bold text-lg hover:bg-slate-50/50 transition-colors">
                      <span>{faq.question}</span>
                      <ChevronDown className="w-5 h-5 shrink-0 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 pb-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <Footer brandColor={brandColor} tenantName={tenantData.name} />
        </div>
      </main>
    </div>
  );
}
