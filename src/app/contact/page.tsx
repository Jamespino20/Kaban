import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ContactContent } from "./contact-content";
import { getActiveBranchesForNav } from "@/actions/tenant-management";
import {
  BadgeCheck,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Building2,
} from "lucide-react";

const CONTACT_METHODS = [
  {
    title: "Email Support",
    detail: "agapay.saas@gmail.com",
    href: "mailto:agapay.saas@gmail.com",
    actionLabel: "Email Us",
    icon: Mail,
  },
  {
    title: "Feedback Inbox",
    detail: "For concerns, cancellations, and suggestions",
    href: "#contact-form",
    actionLabel: "Share Feedback",
    icon: MessageCircle,
  },
  {
    title: "Prototype Hotline",
    detail: "+63 (02) 8888-2427",
    href: "tel:+630288882427",
    actionLabel: "Call Now",
    icon: Phone,
  },
  {
    title: "Head Office",
    detail: "Malolos City, Philippines",
    href: "https://maps.google.com/?q=Malolos%20City%20Philippines",
    actionLabel: "Open Map",
    icon: MapPin,
  },
];

export default async function ContactPage() {
  const branches = await getActiveBranchesForNav();

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center font-sans overflow-x-hidden text-slate-950">
      <Navbar forceSolid branches={branches} />

      <main className="w-full pt-32 flex flex-col items-center">
        <section className="w-full py-24 px-6 max-w-7xl text-center">
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4" />
              Get in Touch with Agapay
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight italic mb-8 leading-[0.95] text-slate-900 text-balance">
              Let&apos;s Talk About{" "}
              <span className="text-emerald-600">a Better Agapay.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              For questions, concerns, cancellations, testimonials, or
              suggestions — there is a clear path to reach the right team.
            </p>
          </div>
        </section>

        <section className="w-full py-20 px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CONTACT_METHODS.map((method) => (
            <a
              key={method.title}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={
                method.href.startsWith("http")
                  ? "noreferrer noopener"
                  : undefined
              }
              className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group flex flex-col items-center text-center"
            >
              <div className="p-5 bg-white rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                <method.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black italic text-slate-900 mb-2">
                {method.title}
              </h3>
              <p className="text-slate-500 font-medium mb-8 text-sm">
                {method.detail}
              </p>
              <span className="text-emerald-600 font-black italic text-sm tracking-tight uppercase">
                {method.actionLabel}
              </span>
            </a>
          ))}
        </section>

        <ContactContent />

        <Footer />
      </main>
    </div>
  );
}
