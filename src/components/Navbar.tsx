"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-boost-blue">
            <div className="w-8 h-8 bg-boost-blue rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-boost-gold" fill="currentColor" />
            </div>
            BOOST
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-boost-blue transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-boost-blue transition-colors">
              Pricing
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Try BOOST Free</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link
              href="/#features"
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-boost-blue"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-boost-blue"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full">Try BOOST Free</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
