import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TOOLS } from "@/lib/boost-prompts";
import {
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

const SPORTS = [
  "Football", "Baseball", "Softball", "Basketball",
  "Wrestling", "Soccer", "Hockey", "Cheer",
  "Lacrosse", "Track", "Swimming", "Tennis",
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Booster Club President — Eagles Football",
    text: "BOOST helped us plan our entire fall fundraiser in under 30 minutes. We raised $8,200 — our best year ever!",
    stars: 5,
  },
  {
    name: "Coach Davis",
    role: "Youth Baseball Head Coach",
    text: "The sponsor packet creator is incredible. We landed 4 new sponsors for our tournament using templates from BOOST.",
    stars: 5,
  },
  {
    name: "Jamie T.",
    role: "Parent Volunteer — 10U Soccer",
    text: "I'm not a writer, but BOOST makes me look like one. Our social media engagement went through the roof this season!",
    stars: 5,
  },
];

const STATS = [
  { label: "Teams Using BOOST", value: "2,400+" },
  { label: "Avg Funds Raised", value: "$4,800" },
  { label: "Content Generated", value: "180K+" },
  { label: "Sports Supported", value: "12+" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-br from-boost-dark via-boost-blue to-blue-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 text-boost-gold" fill="currentColor" />
                AI-Powered Youth Sports Assistant
              </div>
              <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
                Raise More.{" "}
                <span className="text-boost-gold">Communicate</span>{" "}
                Better. Win Together.
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed">
                BOOST is the AI assistant built for booster clubs, coaches, and parent
                organizations. Generate fundraiser plans, sponsor packets, social media
                content, and team communications — instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                    Start Free — No Card Needed
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-boost-blue">
                    See What BOOST Does
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-8 text-sm text-blue-200">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Free to start
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  No credit card
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Instant results
                </div>
              </div>
            </div>

            {/* Hero card preview */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-slate-900">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-boost-blue rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-boost-gold" fill="currentColor" />
                  </div>
                  <div>
                    <div className="font-bold text-boost-blue">BOOST</div>
                    <div className="text-xs text-slate-500">Generating fundraiser plan...</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="font-bold text-boost-blue text-base">🏈 Eagles Football Fundraiser Plan</div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-semibold text-green-800 mb-1">Goal: $5,000</div>
                    <div className="text-green-700 text-xs">Restaurant Night + Spirit Wear Sale</div>
                  </div>
                  <div className="space-y-1.5">
                    {["Week 1: Launch social campaign", "Week 2: Restaurant night @ Chili&apos;s", "Week 3: Spirit wear orders", "Week 4: Final push + close out"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-boost-blue text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Pro tip:</strong> Send the parent email template on Monday morning for best open rates!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sports ticker */}
        <div className="bg-black/20 py-3 overflow-hidden">
          <div className="flex gap-8 animate-pulse">
            {[...SPORTS, ...SPORTS].map((sport, i) => (
              <span key={i} className="text-sm font-semibold text-white/70 whitespace-nowrap px-4">
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-boost-blue">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-boost-dark mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Five powerful AI tools designed specifically for youth sports organizations.
              No writing experience required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <Link key={tool.id} href={`/dashboard?tool=${tool.id}`}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${tool.bgColor} ${tool.borderColor} border rounded-xl flex items-center justify-center text-2xl mb-4`}>
                      {tool.icon}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{tool.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{tool.description}</p>
                    <ul className="space-y-1.5">
                      {tool.examples.slice(0, 2).map((ex, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${tool.color}`} />
                          {ex}
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${tool.color}`}>
                      Try it now <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Bonus card */}
            <Card className="h-full bg-gradient-to-br from-boost-blue to-blue-700 text-white border-0">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="font-bold text-xl mb-2">Built for Champions</h3>
                  <p className="text-blue-100 text-sm mb-6">
                    BOOST understands youth sports culture. Every output is age-appropriate,
                    community-focused, and ready to use immediately.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button variant="secondary" className="w-full">
                    Launch BOOST <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why BOOST */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-boost-dark mb-6">
                Why Teams Choose BOOST
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: <Zap className="w-5 h-5 text-boost-gold" fill="currentColor" />,
                    title: "Instant, Professional Output",
                    desc: "Generate complete fundraiser plans, sponsor packets, and social posts in seconds — not hours.",
                  },
                  {
                    icon: <Shield className="w-5 h-5 text-green-600" />,
                    title: "Safe for Youth Sports",
                    desc: "All content is age-appropriate, community-focused, and follows safe fundraising guidelines.",
                  },
                  {
                    icon: <Users className="w-5 h-5 text-blue-600" />,
                    title: "Made for Non-Writers",
                    desc: "You don't need to be a marketer. Just describe what you need and BOOST handles the rest.",
                  },
                  {
                    icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
                    title: "Proven Results",
                    desc: "Teams using BOOST report higher fundraising totals, better parent engagement, and less stress.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-slate-500 text-sm mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {TESTIMONIALS.map((t) => (
                <Card key={t.name}>
                  <CardContent className="p-5">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm mb-3 italic">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-boost-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">
            Ready to Level Up Your Program?
          </h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Start free today. No credit card required. Upgrade when you&apos;re ready for
            unlimited generations and advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="xl" variant="secondary">
                Start Free — Try BOOST Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-boost-blue">
                See Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-black text-lg text-white">
              <div className="w-7 h-7 bg-boost-blue rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-boost-gold" fill="currentColor" />
              </div>
              BOOST
            </div>
            <p className="text-sm text-center">
              Booster Outreach & Organization Support Tool · AI-powered by Claude
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} BOOST. Not affiliated with any specific school or sports organization.
            Content is AI-generated and should be reviewed before use.
          </div>
        </div>
      </footer>
    </div>
  );
}
