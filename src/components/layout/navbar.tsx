"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import Link from "next/link";

interface NavbarProps {
  forceSolid?: boolean;
}

export function Navbar({ forceSolid = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
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

  const navItems = [
    { en: "Why Kaban", ph: "Bakit Kaban", href: "/#why-kaban" },
    { en: "Features", ph: "Mga Tampok", href: "/#features" },
    { en: "Testimonials", ph: "Patotoo", href: "/#testimonials" },
    { en: "FAQs", ph: "Katanungan", href: "/#faqs" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-6 ${
        isScrolled || isMenuOpen
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/images/kaban_solo.png"
              alt="Kaban"
              className="w-12 h-12 object-contain"
            />
          </div>
          <span
            className={`text-3xl font-black tracking-tighter italic transition-colors duration-500 ${
              isScrolled || isMenuOpen ? "text-slate-900" : "text-white"
            }`}
          >
            Kaban
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.en}
              href={item.href}
              className={`text-sm font-bold transition-colors flex flex-col items-center group ${
                isScrolled
                  ? "text-slate-700 hover:text-emerald-600"
                  : "text-white/90 hover:text-white"
              }`}
            >
              <span className="group-hover:translate-y-[-2px] transition-transform">
                {item.en}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${
                  isScrolled ? "opacity-50" : "opacity-80"
                }`}
              >
                {item.ph}
              </span>
            </Link>
          ))}
        </nav>

        {/* Auth & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <AuthModal />
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

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.en}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-start p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <span className="text-lg font-black text-slate-900 italic">
                  {item.en}
                </span>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  {item.ph}
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 w-full">
              <AuthModal />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
