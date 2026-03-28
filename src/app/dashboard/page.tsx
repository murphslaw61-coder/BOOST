"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TOOLS, type ToolType, type Tool } from "@/lib/boost-prompts";
import {
  Zap,
  Copy,
  Download,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Home,
  Crown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SPORTS_LIST = [
  "Football", "Baseball", "Softball", "Basketball", "Wrestling",
  "Soccer", "Hockey", "Cheer", "Lacrosse", "Track & Field",
  "Swimming", "Tennis", "Volleyball", "Cross Country", "Golf",
  "Multi-Sport Program", "Other",
];

const TONES = ["Professional", "Friendly", "Urgent", "Celebratory", "Motivational"];

const FREE_LIMIT = 5;

function ToolIcon({ tool, selected, onClick }: { tool: Tool; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
        selected
          ? `${tool.bgColor} ${tool.borderColor} border-2 font-semibold`
          : "hover:bg-slate-100 border-2 border-transparent"
      }`}
    >
      <span className="text-xl">{tool.icon}</span>
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${selected ? tool.color : "text-slate-700"} truncate`}>
          {tool.name}
        </div>
      </div>
      {selected && <ChevronRight className={`w-4 h-4 ml-auto shrink-0 ${tool.color}`} />}
    </button>
  );
}

function OutputRenderer({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="boost-output space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return <h3 key={i} className="text-base font-bold text-boost-blue mt-4 mb-1">{line.replace("### ", "")}</h3>;
        if (line.startsWith("## "))
          return <h2 key={i} className="text-lg font-bold text-boost-blue mt-5 mb-1">{line.replace("## ", "")}</h2>;
        if (line.startsWith("# "))
          return <h1 key={i} className="text-xl font-black text-boost-blue mt-5 mb-2">{line.replace("# ", "")}</h1>;
        if (line.startsWith("**") && line.endsWith("**"))
          return <p key={i} className="font-bold text-slate-900">{line.replace(/\*\*/g, "")}</p>;
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} className="flex items-start gap-2 ml-2">
              <span className="text-boost-blue mt-1.5 shrink-0">•</span>
              <span className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: line.replace(/^[-•] /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            </div>
          );
        if (line.match(/^\d+\. /))
          return (
            <div key={i} className="flex items-start gap-2 ml-2">
              <span className="text-boost-blue font-bold text-sm mt-0.5 shrink-0">{line.match(/^\d+/)![0]}.</span>
              <span className="text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            </div>
          );
        if (line === "---" || line === "***")
          return <hr key={i} className="border-slate-200 my-3" />;
        if (line.trim() === "")
          return <div key={i} className="h-2" />;
        return (
          <p key={i} className="text-slate-700 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>") }}
          />
        );
      })}
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTool = (searchParams.get("tool") as ToolType) || "fundraiser";

  const [selectedTool, setSelectedTool] = useState<ToolType>(initialTool);
  const [prompt, setPrompt] = useState("");
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const tool = TOOLS.find((t) => t.id === selectedTool)!;

  useEffect(() => {
    const saved = parseInt(localStorage.getItem("boost_usage") || "0", 10);
    setUsageCount(saved);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (usageCount >= FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tool: selectedTool, sport, teamName, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data.result);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem("boost_usage", String(newCount));

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boost-${selectedTool}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setResult("");
    setError("");
    setPrompt("");
  };

  const remainingFree = Math.max(0, FREE_LIMIT - usageCount);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-black text-lg text-boost-blue">
              <div className="w-7 h-7 bg-boost-blue rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-boost-gold" fill="currentColor" />
              </div>
              BOOST
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {remainingFree <= 2 && remainingFree > 0 && (
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
                {remainingFree} free uses left
              </span>
            )}
            <Link href="/pricing">
              <Button size="sm" variant="secondary">
                <Crown className="w-3.5 h-3.5" />
                Upgrade
              </Button>
            </Link>
            <Link href="/" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">

          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Tools
            </div>
            {TOOLS.map((t) => (
              <ToolIcon
                key={t.id}
                tool={t}
                selected={selectedTool === t.id}
                onClick={() => {
                  setSelectedTool(t.id);
                  setResult("");
                  setError("");
                  setPrompt("");
                }}
              />
            ))}

            {/* Usage meter */}
            <div className="mt-6 p-3 bg-slate-100 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-medium">Free Uses</span>
                <span className="font-bold text-slate-700">{usageCount}/{FREE_LIMIT}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-boost-blue h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (usageCount / FREE_LIMIT) * 100)}%` }}
                />
              </div>
              {usageCount >= FREE_LIMIT && (
                <Link href="/pricing">
                  <Button size="sm" variant="secondary" className="w-full mt-3 text-xs">
                    <Crown className="w-3 h-3" /> Upgrade for Unlimited
                  </Button>
                </Link>
              )}
            </div>
          </aside>

          {/* Main area */}
          <main className="space-y-5">
            {/* Tool header */}
            <div className={`${tool.bgColor} ${tool.borderColor} border rounded-xl p-4 flex items-start gap-3`}>
              <span className="text-3xl">{tool.icon}</span>
              <div>
                <h1 className={`font-bold text-lg ${tool.color}`}>{tool.name}</h1>
                <p className="text-slate-600 text-sm">{tool.description}</p>
              </div>
            </div>

            {/* Input form */}
            <Card>
              <CardContent className="p-5 space-y-4">
                {/* Context row */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Team / Org Name <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Eagles Football"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-boost-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Sport <span className="text-slate-400">(optional)</span>
                    </label>
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-boost-blue focus:border-transparent bg-white"
                    >
                      <option value="">Select sport...</option>
                      {SPORTS_LIST.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {selectedTool === "communication" && (
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-boost-blue focus:border-transparent bg-white"
                      >
                        <option value="">Select tone...</option>
                        {TONES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Main prompt */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Describe what you need <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={tool.placeholder}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-boost-blue focus:border-transparent resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                    }}
                  />
                  <p className="text-xs text-slate-400 mt-1">⌘+Enter to generate</p>
                </div>

                {/* Example prompts */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.examples.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setPrompt(ex)}
                        className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                      >
                        {ex.length > 60 ? ex.slice(0, 60) + "..." : ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={!prompt.trim() || loading || usageCount >= FREE_LIMIT}
                    size="lg"
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loading ? "Generating..." : "Generate with BOOST"}
                  </Button>
                  {usageCount >= FREE_LIMIT && (
                    <Link href="/pricing">
                      <Button variant="secondary" size="sm">
                        <Crown className="w-3.5 h-3.5" />
                        Upgrade to Continue
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upgrade banner */}
            {showUpgrade && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">Free limit reached</p>
                      <p className="text-sm text-amber-700">Upgrade to Pro for unlimited generations.</p>
                    </div>
                  </div>
                  <Link href="/pricing">
                    <Button variant="secondary" size="sm">See Plans</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Result */}
            {result && (
              <div ref={outputRef}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-slate-900">Your BOOST Content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-slate-500"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        New
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button
                        variant={copied ? "primary" : "outline"}
                        size="sm"
                        onClick={handleCopy}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? "Copied!" : "Copy All"}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 max-h-[600px] overflow-y-auto">
                    <OutputRenderer text={result} />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Generated by BOOST · {tool.name}</span>
                    <span>Review before use · Content is AI-generated</span>
                  </div>
                </CardContent>
              </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-boost-blue rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Zap className="w-7 h-7 text-boost-gold" fill="currentColor" />
          </div>
          <p className="text-slate-500 text-sm">Loading BOOST...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
