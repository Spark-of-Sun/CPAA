import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export default function SubProcessorsPage() {
  const subProcessors = [
    {
      name: "Amazon Web Services (AWS)",
      role: "Cloud Compute, Bedrock Reasoning, AWS KMS Key Encryption",
      location: "United States / India Region",
      dpa: "Compliant (AWS Enterprise DPA)"
    },
    {
      name: "Meta Platforms (WhatsApp Cloud API)",
      role: "Conversational 2-Way Message Delivery & Webhook Stream",
      location: "Global / United States",
      dpa: "Compliant (Meta Business Terms)"
    },
    {
      name: "Composio Inc.",
      role: "Unified Workspace Connectors (Gmail, Calendar, Slack, Meet)",
      location: "United States",
      dpa: "Compliant (Composio Enterprise DPA)"
    },
    {
      name: "Auth0 by Okta",
      role: "Enterprise Authentication & Identity Management",
      location: "United States / European Union",
      dpa: "Compliant (Okta DPA)"
    },
    {
      name: "Redis Ltd. / Upstash",
      role: "In-Memory Rate Limiting & 10-Message Sliding Window Cache",
      location: "United States",
      dpa: "Compliant (Standard Clauses)"
    },
    {
      name: "Neon Inc. (PostgreSQL)",
      role: "Serverless Managed PostgreSQL for Tenant Metadata & Audit Logs",
      location: "United States / European Union",
      dpa: "Compliant (Standard Clauses)"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Security & Trust
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Authorized Sub-processors</h1>
          <p className="text-xs text-muted-foreground mt-2">
            Last Updated: October 2026 • Official list of third-party infrastructure and service vendors
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-border overflow-hidden shadow-xl">
          <div className="p-4 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            List of Active Infrastructure Sub-processors
          </div>
          <div className="divide-y divide-border/60 text-xs">
            {subProcessors.map((sp) => (
              <div key={sp.name} className="p-5 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-sm text-foreground">{sp.name}</span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full self-start sm:self-auto">
                    {sp.dpa}
                  </span>
                </div>
                <p className="text-muted-foreground">{sp.role}</p>
                <p className="text-[11px] text-muted-foreground/75 font-mono pt-1">Location: {sp.location}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/40 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" /> Sub-processor Notification Policy
          </span>
          <p>
            CPAA maintains rigorous diligence over all sub-processors. We evaluate each provider&apos;s data security safeguards, SOC 2 alignment, and encryption standards before onboarding.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
