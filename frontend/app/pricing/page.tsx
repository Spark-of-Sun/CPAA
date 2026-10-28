'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: "Starter",
      description: "Ideal for students and individuals getting started with WhatsApp AI.",
      price: "$0",
      cadence: "free forever",
      badge: null,
      cta: "Get Started",
      href: api.login(),
      highlight: false,
      features: [
        "1 Linked WhatsApp Phone Number",
        "Gmail & Google Calendar Connectors",
        "100 Autonomous Actions / month",
        "Basic Task Extraction",
        "Standard Response Speed (~2.5s)",
        "Community Support",
      ]
    },
    {
      name: "Pro",
      description: "For founders, managers, and knowledge workers reclaiming lost focus.",
      price: annual ? "$16" : "$20",
      cadence: "per month, billed annually",
      badge: "Most Popular",
      cta: "Start 14-Day Free Trial",
      href: api.login(),
      highlight: true,
      features: [
        "Everything in Starter",
        "Unlimited WhatsApp Interactions",
        "Composio Connectors (Gmail, Calendar, Docs, Slack)",
        "57-Second Real-Time Email Radar",
        "10-Message Sliding Window Memory",
        "Long-Term Semantic Memory Vector Bank",
        "89% Tool Cache Hit Rate (-300ms latency)",
        "Priority Support (<4h response)",
      ]
    },
    {
      name: "Team",
      description: "For distributed and remote teams managing overlapping meetings.",
      price: annual ? "$32" : "$40",
      cadence: "per user / month",
      badge: "Best for Teams",
      cta: "Launch Team Pilot",
      href: "/request-access",
      highlight: false,
      features: [
        "Everything in Pro",
        "Team-Wide Multi-User Scheduling",
        "Conflict Resolution Across Team Calendars",
        "Shared Decision & Meeting Action Log",
        "Admin Management Console",
        "Centralized Billing & Seat Provisioning",
        "Custom Workflow Triggers",
      ]
    },
    {
      name: "Enterprise",
      description: "Custom compliance, dedicated encryption keys, and tailored SLAs.",
      price: "Custom",
      cadence: "tailored contract",
      badge: null,
      cta: "Contact Enterprise Sales",
      href: "/contact",
      highlight: false,
      features: [
        "Everything in Team",
        "Dedicated AWS KMS Customer-Managed Key",
        "99.9% Financial-Backed Uptime SLA",
        "1-Year Immutable Audit Logs",
        "VPC / Private Gateway Deployment",
        "Enterprise IdP (Okta, Azure AD, SAML)",
        "Dedicated Security Architect",
      ]
    }
  ];

  const faqs = [
    {
      q: "Do I need to install an app to use CPAA?",
      a: "No! CPAA operates entirely through WhatsApp using the official Meta Cloud API. There are zero apps to download, install, or update."
    },
    {
      q: "How does the 14-day free trial work?",
      a: "You get full, unrestricted access to the Pro tier for 14 days without requiring upfront commitment. You can link your tools and test email summaries immediately."
    },
    {
      q: "How does CPAA protect my email and calendar credentials?",
      a: "We use OAuth 2.0 with minimal required permissions. Your tokens are encrypted with AES-256 via AWS Key Management Service (KMS). We never see your password."
    },
    {
      q: "Can I cancel or switch plans at any time?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from the settings console."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Invest in Focus. Reclaim 45 Minutes Daily.
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Save an estimated $1,500+ in personal capacity every month. Choose the plan that fits your workflow.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-xl border border-border bg-card/60 backdrop-blur-md">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !annual ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annual ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                tier.highlight
                  ? "bg-gradient-to-b from-indigo-950/40 via-card to-card border-2 border-indigo-500/50 shadow-2xl relative"
                  : "glass-card border border-border/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-foreground">{tier.name}</h3>
                  {tier.badge && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                      {tier.badge}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground min-h-[36px] leading-relaxed">
                  {tier.description}
                </p>

                <div className="mt-5 mb-6">
                  <span className="text-4xl font-extrabold text-foreground font-mono">{tier.price}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{tier.cadence}</span>
                </div>

                <div className="border-t border-border/60 pt-5 space-y-2.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Included:</p>
                  <ul className="space-y-2">
                    {tier.features.map((feat) => (
                      <li key={feat} className="text-xs text-muted-foreground flex items-start gap-2">
                        <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/40">
                <Button
                  asChild
                  className={`w-full font-semibold rounded-xl ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  <a href={tier.href}>{tier.cta}</a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mt-24 max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-5 rounded-2xl glass-card border border-border">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <HelpCircle className="size-4 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
