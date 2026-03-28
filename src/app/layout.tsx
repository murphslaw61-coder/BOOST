import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOOST — Booster Outreach & Organization Support Tool",
  description:
    "AI-powered assistant for youth sports teams, booster clubs, coaches, and parent organizations. Build fundraisers, sponsor packets, social media content, and more.",
  keywords: [
    "youth sports",
    "booster club",
    "fundraiser",
    "sports AI",
    "team communication",
    "sponsor packets",
  ],
  openGraph: {
    title: "BOOST — Youth Sports AI Assistant",
    description: "Raise funds, communicate clearly, and build community excitement with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
