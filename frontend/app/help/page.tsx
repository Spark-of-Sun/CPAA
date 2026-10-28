'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, Search, MessageSquare, Plug, Brain, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export default function HelpPage() {
  const [query, setQuery] = useState('');

  const guides = [
    {
      icon: MessageSquare,
      title: "Linking WhatsApp & OTP Issues",
      desc: "Troubleshooting country codes, delayed OTP messages, and reconnecting new phone numbers.",
      category: "Onboarding"
    },
    {
      icon: Plug,
      title: "Authorizing Google & Slack Tools",
      desc: "Step-by-step OAuth permissions guide for Gmail, Google Calendar, Google Docs, and Slack.",
      category: "Integrations"
    },
    {
      icon: Brain,
      title: "Managing Agent Memory & Context",
      desc: "How CPAA's 10-message sliding window works, and how to permanently teach the agent preferences.",
      category: "Memory Hub"
    },
    {
      icon: Mail,
      title: "Configuring Real-Time Gmail Radar",
      desc: "Enabling Google Cloud Pub/Sub push webhooks to receive high-urgency notifications under 60 seconds.",
      category: "Automations"
    },
    {
      icon: ShieldCheck,
      title: "Revoking Tokens & Data Privacy",
      desc: "How to revoke OAuth access, clear session cookies, and exercise your zero-retention privacy rights.",
      category: "Security"
    }
  ];

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(query.toLowerCase()) ||
    g.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">
            Help Center & Knowledge Base
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            How can we assist you?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Search our guides or browse popular troubleshooting articles below.
          </p>

          <div className="pt-2 relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search help topics (e.g. OTP, Gmail, memory, calendar)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {filteredGuides.map((guide) => (
            <div key={guide.title} className="glass-card rounded-2xl p-6 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <guide.icon className="size-5" />
                </div>
                <Badge variant="secondary" className="text-[10px]">{guide.category}</Badge>
              </div>

              <h3 className="font-bold text-base text-foreground">{guide.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guide.desc}
              </p>

              <div className="pt-1">
                <span className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                  Read Guide <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Support Banner */}
        <div className="rounded-2xl border border-border bg-card/40 p-8 text-center space-y-3">
          <h3 className="font-bold text-lg text-foreground">Still need help?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Our engineering team and research advisors are available to help answer questions.
          </p>
          <div className="pt-2">
            <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold">
              <Link href="/contact">Contact Support Team</Link>
            </Button>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
