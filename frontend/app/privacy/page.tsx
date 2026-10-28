import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Privacy
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-2">Last Updated: October 2026 • Zero-Data Retention Architecture</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Core Commitment: Zero Model Training on User Data
            </p>
            <p className="text-muted-foreground text-[11px]">
              We never use your emails, calendar contents, notes, or WhatsApp dialogues to train public AI foundational models. Your data belongs exclusively to you.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Information We Collect & Why</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
              <li><strong>Account Identifiers:</strong> Name, verified email address, and profile picture provided by Auth0.</li>
              <li><strong>WhatsApp Phone Number:</strong> Used solely to authenticate and deliver 2-way agent responses.</li>
              <li><strong>Encrypted OAuth Tokens:</strong> Stored using AES-256 envelope encryption via AWS KMS to execute authorized tool actions.</li>
              <li><strong>Agent Semantic Memory:</strong> Explicit preferences (e.g. "I prefer 30-min meetings") saved by you into your isolated vector store.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Transient Processing Pipeline</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              When CPAA reads incoming Gmail threads or scans your schedule for conflicts, the data is processed in transient, volatile memory. Once action items or summaries are delivered to WhatsApp, raw email bodies are purged from execution cache.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. User Isolation & Penetration Guarantees</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Every user's context is partitioned with strict tenancy boundaries. In standardized penetration testing, 100% of adversarial cross-user memory retrieval attempts were blocked.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Your Data Rights</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You retain the right to clear your agent memory vectors, unlink your WhatsApp number, revoke third-party OAuth access, or delete your entire account at any time through the agent dashboard.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
