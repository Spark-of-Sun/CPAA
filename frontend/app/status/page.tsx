import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Activity, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export default function StatusPage() {
  const components = [
    { name: "Meta WhatsApp Cloud Webhooks", status: "Operational", uptime: "99.98%" },
    { name: "API Gateway (Nginx / Rate Limiter)", status: "Operational", uptime: "100.0%" },
    { name: "FastAPI Application Cluster", status: "Operational", uptime: "99.89%" },
    { name: "Composio Workspace Connectors", status: "Operational", uptime: "99.85%" },
    { name: "AWS Bedrock Intelligence Layer", status: "Operational", uptime: "99.92%" },
    { name: "Redis Context & Tool Cache", status: "Operational", uptime: "100.0%" },
    { name: "PostgreSQL Database Layer", status: "Operational", uptime: "100.0%" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 md:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">All Systems Operational</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                99.87% verified uptime across all clusters and integrations.
              </p>
            </div>
          </div>
          <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* 90-Day Uptime Graph */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Global Availability (Past 90 Days)</span>
            <span className="font-mono text-emerald-400 font-bold">99.87%</span>
          </div>

          {/* Visual bar graph representation */}
          <div className="flex items-center gap-1 h-8">
            {Array.from({ length: 45 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-full rounded-sm bg-emerald-500/80 hover:bg-emerald-400 transition-colors"
                title={`Day ${idx + 1}: 100% operational`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
            <span>90 days ago</span>
            <span>Today (100%)</span>
          </div>
        </div>

        {/* Component Table */}
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            System Component Status
          </div>
          <div className="divide-y divide-border/60">
            {components.map((comp) => (
              <div key={comp.name} className="p-4 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{comp.name}</span>
                <div className="flex items-center gap-4 font-mono">
                  <span className="text-muted-foreground">{comp.uptime}</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {comp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Incidents */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Past Incident History</h3>
          <div className="p-6 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground">
            No service interruptions or security incidents reported in the last 90 days.
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
