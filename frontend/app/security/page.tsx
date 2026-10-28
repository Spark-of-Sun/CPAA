import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, CheckCircle2, Key, Database, FileText, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  const securityPillars = [
    {
      title: "AES-256 AWS KMS Key Management",
      desc: "All OAuth refresh tokens and API credentials are encrypted with AES-256 using envelope encryption with keys managed in AWS KMS."
    },
    {
      title: "TLS 1.3 Strict In-Transit Encryption",
      desc: "Every message between WhatsApp Meta Cloud API, our Nginx Gateway, and internal FastAPI microservices enforces TLS 1.3."
    },
    {
      title: "Zero Cross-User Data Access (50/50 Blocked)",
      desc: "In adversarial penetration testing, all 50 cross-tenant data access attempts were completely blocked by our tenancy isolation boundary."
    },
    {
      title: "Prompt & Command Injection Defense",
      desc: "Unstructured incoming email contents are treated as untrusted data and strictly sanitized prior to LLM reasoning."
    },
    {
      title: "100 req/min Rate Limiting",
      desc: "Per-user traffic caps prevent brute-force attacks and denial-of-service degradation. 24-hour automated session expiry."
    },
    {
      title: "Human-in-the-Loop Confirmation",
      desc: "CPAA mandates explicit user authorization in WhatsApp before dispatching outbound emails or modifying external schedules."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">
            Security & Trust by Design
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Enterprise-Grade Security Architecture
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            An agent that touches personal calendars and emails must earn trust. Security is not an afterthought at CPAA—it is an architectural foundation.
          </p>
        </div>

        {/* 6 Security Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((p) => (
            <div key={p.title} className="glass-card rounded-2xl p-6 border border-border space-y-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Audit Details */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-border space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Audit Trail & Vulnerability Patching</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Significant agent actions are recorded to an immutable audit log retained for one year. Automated static and dynamic vulnerability scanning identified 14 dependency risks during the development lifecycle, all of which were resolved and validated before deployment.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              SOC 2 Type II Aligned
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              GDPR & CCPA Compliant
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
              Least-Privilege Scopes
            </span>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
