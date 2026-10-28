import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Acceptable Use Policy</h1>
          <p className="text-xs text-muted-foreground mt-2">Last Updated: October 2026</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Permitted Personal & Team Use</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              CPAA is intended for personal productivity, schedule coordination, meeting management, and internal team action-item tracking across authorized accounts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Prohibited Activities</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs">
              <li><strong>Spam & Unsolicited Outreach:</strong> Using CPAA or WhatsApp webhooks to transmit unsolicited marketing, mass phishing, or bulk emails.</li>
              <li><strong>Adversarial Injection:</strong> Crafting deliberate prompt-injection or payload jailbreaks intended to bypass tenant isolation boundaries.</li>
              <li><strong>Service Abuse:</strong> Circumventing rate limits (100 req/min/user) through automated bot farms or distributed proxies.</li>
              <li><strong>Harmful Content:</strong> Generating or processing content that promotes hate speech, malware, or illegal surveillance.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Enforcement & Termination</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We reserve the right to immediately suspend or terminate WhatsApp links and revoke API access for any account found in violation of this Acceptable Use Policy.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
