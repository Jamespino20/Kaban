"use client";

import Link from "next/link";

export function Footer({ 
  brandColor,
  tenantName 
}: { 
  brandColor?: string | null;
  tenantName?: string | null;
}) {
  return (
    <footer className="w-full py-24 bg-slate-100 border-t border-slate-200/60 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
        <div className="flex flex-col gap-6 max-w-sm">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={brandColor ? { backgroundColor: brandColor } : { backgroundColor: "#059669" }}
            >
              <img
                src="/images/agapay_solo.png"
                alt="Agapay"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tighter italic text-slate-900">
              {tenantName || "Agapay"}
            </span>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">
            A cooperative lending platform for Filipino entrepreneurs, tenant
            teams, and lending communities who want clearer, more human, and
            more explainable financial workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-sm">
          <FooterGroup
            title="Platform"
            brandColor={brandColor}
            links={[
              { label: "Features", href: "/platform" },
              { label: "Pricing", href: "/pricing" },
              { label: "Loan Calculator", href: "/#calculator" },
            ]}
          />
          <FooterGroup
            title="Company"
            brandColor={brandColor}
            links={[
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
            ]}
          />
          <FooterGroup
            title="Legal"
            brandColor={brandColor}
            links={[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ]}
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
        <span>© 2026 Agapay Microfinance SaaS. All rights reserved.</span>
        <span>Made in the Philippines</span>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
  brandColor,
}: {
  title: string;
  links: { label: string; href: string }[];
  brandColor?: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h5 className="font-black italic text-slate-950 text-lg uppercase tracking-tight">
        {title}
      </h5>
      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-slate-500 font-bold hover:text-emerald-600 transition-colors cursor-pointer"
              style={brandColor ? { "--hover-color": brandColor } as any : {}}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
