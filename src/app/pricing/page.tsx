"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Zap, Crown, Star, ArrowRight, Users } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for trying BOOST",
    badge: null,
    icon: <Zap className="w-5 h-5 text-slate-600" />,
    color: "border-slate-200",
    buttonVariant: "outline" as const,
    buttonText: "Start Free",
    href: "/dashboard",
    features: [
      "5 AI generations per month",
      "All 5 BOOST tools",
      "Copy & download output",
      "Basic sport types",
      "Community support",
    ],
    notIncluded: [
      "Unlimited generations",
      "Priority AI processing",
      "Saved history",
      "Team collaboration",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    period: "month",
    description: "For active booster clubs and coaches",
    badge: "Most Popular",
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    color: "border-boost-blue ring-2 ring-boost-blue",
    buttonVariant: "primary" as const,
    buttonText: "Start Pro — $9.99/mo",
    href: null,
    features: [
      "Unlimited AI generations",
      "All 5 BOOST tools",
      "Priority AI processing",
      "Copy, download & save output",
      "All sport types",
      "Full tone & style controls",
      "Email support",
      "New features first",
    ],
    notIncluded: [
      "Team collaboration",
      "Multi-user access",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 24.99,
    period: "month",
    description: "For athletic departments & multi-team orgs",
    badge: "Best Value",
    icon: <Users className="w-5 h-5 text-purple-600" />,
    color: "border-purple-300",
    buttonVariant: "outline" as const,
    buttonText: "Start Team — $24.99/mo",
    href: null,
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Shared content library",
      "Team collaboration tools",
      "Admin dashboard",
      "Priority support",
      "Custom team branding",
      "Bulk export",
    ],
    notIncluded: [],
  },
];

const FAQ = [
  {
    q: "Can I try BOOST for free?",
    a: "Yes! The Starter plan gives you 5 AI generations at no cost, no credit card required. You can access all 5 BOOST tools.",
  },
  {
    q: "What counts as a generation?",
    a: "Each time you click 'Generate with BOOST' and receive a result, that counts as one generation. You can copy, download, or regenerate as many times as you like from existing results.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time. You'll retain Pro or Team access until the end of your current billing period.",
  },
  {
    q: "Is the content safe for youth sports?",
    a: "Absolutely. BOOST is built specifically for youth and school sports. All output is age-appropriate, community-focused, and avoids gambling, inappropriate language, or illegal fundraising methods.",
  },
  {
    q: "Do I need to review the AI output?",
    a: "We recommend reviewing all content before using it publicly. BOOST produces high-quality drafts, but you should customize them with your team's specific details.",
  },
  {
    q: "Does BOOST work for all sports?",
    a: "Yes! BOOST supports football, baseball, softball, basketball, wrestling, soccer, hockey, cheer, lacrosse, track, swimming, and more.",
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleCheckout = async (planId: string) => {
    if (planId === "free") return;
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error("Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm font-medium text-boost-blue mb-4">
              <Star className="w-4 h-4 text-boost-gold" fill="currentColor" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-boost-dark mb-4">
              Pick the Plan That Fits Your Team
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Start free. Upgrade when you&apos;re ready. No long-term contracts,
              no hidden fees.
            </p>
          </div>

          {/* Email field for checkout */}
          <div className="max-w-sm mx-auto mb-10">
            <label className="text-sm font-medium text-slate-600 block mb-2 text-center">
              Your email (for paid plans)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@teamname.com"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-boost-blue text-center"
            />
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.color} ${plan.id === "pro" ? "shadow-xl" : ""}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                    plan.id === "pro"
                      ? "bg-boost-blue text-white"
                      : "bg-purple-600 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      {plan.icon}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{plan.name}</div>
                      <div className="text-xs text-slate-500">{plan.description}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-slate-900">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-slate-500 text-sm mb-1">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {plan.href ? (
                    <Link href={plan.href}>
                      <Button variant={plan.buttonVariant} className="w-full mb-5">
                        {plan.buttonText} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant={plan.buttonVariant}
                      className="w-full mb-5"
                      loading={loadingPlan === plan.id}
                      onClick={() => handleCheckout(plan.id)}
                    >
                      {loadingPlan === plan.id ? "Redirecting..." : plan.buttonText}
                    </Button>
                  )}

                  <div className="space-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-slate-700">{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm opacity-40">
                        <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-slate-400 rounded" />
                        </div>
                        <span className="text-slate-500">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-boost-dark text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <Card key={item.q}>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-slate-900 mb-2">{item.q}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <p className="text-slate-500 mb-4">Still have questions?</p>
            <Link href="/dashboard">
              <Button size="lg">
                Try BOOST Free — No Card Needed
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <div className="flex items-center justify-center gap-2 font-black text-lg text-white mb-2">
            <div className="w-6 h-6 bg-boost-blue rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-boost-gold" fill="currentColor" />
            </div>
            BOOST
          </div>
          <p className="text-xs">Payments securely processed by Stripe</p>
        </div>
      </footer>
    </div>
  );
}
