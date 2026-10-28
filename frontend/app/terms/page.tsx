import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground mt-2">Last Updated: October 2026</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using the Configurable Personal AI Agent (&quot;CPAA&quot;), including our WhatsApp conversational interface, web dashboard, and API endpoints, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Service Description</h2>
            <p className="text-muted-foreground">
              CPAA provides an autonomous conversational productivity layer designed to connect to your third-party productivity accounts (such as Gmail, Google Calendar, Google Docs, and Slack) via Composio tool integrations and Meta WhatsApp Cloud APIs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. User Authentication & WhatsApp Security</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining control of the WhatsApp phone number linked to your CPAA account. Any actions triggered via your verified WhatsApp number are treated as authorized by you. We mandate explicit user confirmation before executing external high-stakes actions, including sending emails or scheduling meetings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Third-Party Integrations & OAuth Tokens</h2>
            <p className="text-muted-foreground">
              When connecting workspace accounts, you grant CPAA authorization to read and act within the scopes requested. Tokens are encrypted using AES-256 via AWS Key Management Service (KMS). You may revoke these permissions at any time via the integrations dashboard.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">5. Intellectual Property & Attribution</h2>
            <p className="text-muted-foreground">
              CPAA and its proprietary multi-agent orchestration architecture are developed by researchers at the Department of CSE (AIML), AMC Engineering College, Bengaluru. All rights reserved.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
