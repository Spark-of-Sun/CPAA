import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileCheck } from 'lucide-react';

export default function DpaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Legal & Compliance
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Data Processing Addendum (DPA)</h1>
          <p className="text-xs text-muted-foreground mt-2">Standard Contractual Clauses & GDPR Compliance Framework</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Scope & Relationship of the Parties</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This Data Processing Addendum ("DPA") governs the processing of personal data in connection with the CPAA services. The Customer acts as the <strong>Data Controller</strong>, and CPAA acts as the <strong>Data Processor</strong> in accordance with GDPR Article 28 and applicable privacy frameworks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. Purpose of Processing</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              CPAA processes personal data solely to provide, maintain, and execute user-initiated conversational requests (including reading email action items, checking calendar availability, scheduling Google Meet sessions, and storing user preferences in isolated vector indices).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Technical & Organizational Measures (TOMs)</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
              <li><strong>Encryption:</strong> AES-256 encryption at rest with AWS KMS envelope encryption; TLS 1.3 in transit.</li>
              <li><strong>Isolation:</strong> Strict tenant boundaries prohibiting cross-account data leakage (validated by 50 adversarial tests).</li>
              <li><strong>Access Control:</strong> Role-based access with multi-factor authentication for all internal operations.</li>
              <li><strong>Incident Response:</strong> Commitment to notify affected controllers within 48 hours of any verified security incident.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">4. Sub-processors</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              CPAA engages third-party sub-processors only to deliver infrastructure, SMS/OTP gateways, and foundational model hosting under strict data processing agreements matching this DPA.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
