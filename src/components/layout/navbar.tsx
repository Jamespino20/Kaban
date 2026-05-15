"use client";

import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PublicTenantSelector } from "@/components/layout/public-tenant-selector";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  forceSolid?: boolean;
  tenants?: any[];
  brandColor?: string | null;
  tenantLogo?: string | null;
  tenantId?: number | null;
  tenantFallbackName?: string | null;
}

export function Navbar({
  forceSolid = false,
  tenants = [],
  brandColor,
  tenantLogo,
  tenantId,
  tenantFallbackName,
}: NavbarProps) {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (forceSolid) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceSolid]);

  const isTenantNav = Boolean(tenantLogo || brandColor);
  const navItems = isTenantNav
    ? [
        { label: "Home", href: "#home" },
        { label: "Services", href: "#features" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ]
    : [
        { label: "Why Agapay", href: "/#why-agapay" },
        { label: "Features", href: "/#features" },
        { label: "Calculator", href: "/#calculator" },
        { label: "Network", href: "/#network" },
        { label: "Pricing", href: "/pricing" },
        { label: "Testimonials", href: "/#testimonials" },
        { label: "FAQs", href: "/#faqs" },
        { label: "Contact", href: "/contact" },
      ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-6 ${
        isScrolled || isMenuOpen
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[100rem] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href={isTenantNav ? "#home" : "/"}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-32 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            {tenantLogo ? (
              <img
                src={tenantLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : tenantFallbackName ? (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg"
                style={{ backgroundColor: brandColor || "#059669" }}
              >
                {tenantFallbackName
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            ) : (
              <img
                src="/images/agapay_titled.png"
                alt="Agapay"
                className={`w-32 h-32 object-contain transition-all duration-500 ${
                  isScrolled ? "" : "brightness-0 invert"
                }`}
              />
            )}
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3 xl:gap-5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-bold transition-colors flex flex-col items-center group ${
                isScrolled
                  ? `${isScrolled ? "text-slate-700" : "text-white/90"}`
                  : isScrolled
                    ? "text-slate-700 hover:text-emerald-600"
                    : "text-white/90 hover:text-white"
              }`}
              style={brandColor && isScrolled ? { color: brandColor } : {}}
            >
              <span className="group-hover:translate-y-[-2px] transition-transform">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Auth & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            {!session && !isTenantNav && (
              <PublicTenantSelector
                tenants={tenants}
                isScrolled={isScrolled}
                triggerClassName={`flex items-center gap-2 px-6 h-12 rounded-full transition-all duration-300 font-bold text-sm shadow-lg ${
                  isScrolled
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/10"
                    : "bg-white text-emerald-900 hover:bg-emerald-50 shadow-white/10"
                }`}
                style={
                  brandColor && isScrolled
                    ? { backgroundColor: brandColor }
                    : {}
                }
              />
            )}
            <AuthOrDashboard
              isMounted={isMounted}
              session={session}
              status={status}
              brandColor={brandColor}
              isTenantNav={isTenantNav}
              tenantId={tenantId}
            />
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 transition-colors ${
              isScrolled || isMenuOpen ? "text-slate-900" : "text-white"
            }`}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-6">
            {!isTenantNav && (
              <PublicTenantSelector
                tenants={tenants}
                isScrolled={isScrolled}
                isMobile
              />
            )}
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-start p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <span className="text-lg font-black text-slate-900 italic">
                  {item.label}
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 w-full">
              <AuthOrDashboard
                isMounted={isMounted}
                isMobile
                closeMenu={() => setIsMenuOpen(false)}
                session={session}
                status={status}
                brandColor={brandColor}
                isTenantNav={isTenantNav}
                tenantId={tenantId}
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function AuthOrDashboard({
  isMobile,
  closeMenu,
  isMounted,
  session,
  status,
  brandColor,
  isTenantNav,
  tenantId,
}: {
  isMobile?: boolean;
  closeMenu?: () => void;
  isMounted: boolean;
  session: any;
  status: string;
  brandColor?: string | null;
  isTenantNav?: boolean;
  tenantId?: number | null;
}) {
  if (!isMounted) return null;
  if (status === "loading") return null;

  if (session) {
    const dashboardHref =
      session?.user?.role === "member" ? "/agapay-pintig" : "/agapay-tanaw";
    return (
      <Link
        href={dashboardHref}
        onClick={closeMenu}
        className={
          isMobile
            ? "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-2xl flex items-center justify-center gap-2"
            : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
        }
        style={brandColor ? { backgroundColor: brandColor } : {}}
      >
        <LayoutDashboard className="w-4 h-4" />{" "}
        {isMobile ? "Go to Dashboard" : "Dashboard"}
      </Link>
    );
  }

  if (isTenantNav) {
    return (
      <div
        className={`flex items-center gap-3 ${isMobile ? "flex-col w-full" : ""}`}
      >
        <AuthModal
          initialTab="login"
          tenantId={tenantId?.toString()}
          Trigger={
            <Button
              className={
                isMobile
                  ? "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-2xl flex items-center justify-center gap-2"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2"
              }
            >
              Sign In
            </Button>
          }
        />
        <AuthModal
          initialTab="register"
          tenantId={tenantId?.toString()}
          Trigger={
            <Button
              variant="outline"
              className={
                isMobile
                  ? "w-full border-2 border-slate-200 text-slate-900 font-bold h-12 px-8 rounded-2xl flex items-center justify-center gap-2"
                  : "bg-white border-2 border-slate-200 text-slate-900 font-bold h-12 px-8 rounded-full hover:bg-slate-50 transition-all flex items-center gap-2"
              }
              style={
                brandColor ? { borderColor: brandColor, color: brandColor } : {}
              }
            >
              Register
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/onboarding"
        className={
          isMobile
            ? "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-2xl flex items-center justify-center gap-2"
            : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2"
        }
      >
        Apply for Agapay
      </Link>
    </div>
  );
}
