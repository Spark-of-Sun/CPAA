import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export default function CareersPage() {
  const roles = [
    {
      title: "Founding Full-Stack AI Engineer",
      dept: "Engineering",
      location: "Bengaluru, India / Hybrid / Remote",
      type: "Full-Time",
      desc: "Architect scalable agent workflows using Next.js 16, FastAPI, and Composio tool abstractions."
    },
    {
      title: "Agent Reasoning & LLM Prompt Architect",
      dept: "AI Research",
      location: "Remote / Hybrid",
      type: "Full-Time",
      desc: "Optimize multi-turn sliding window memory, task extraction accuracy, and conflict resolution heuristics."
    },
    {
      title: "Cloud Infrastructure & Security Engineer",
      dept: "DevOps & Trust",
      location: "Remote",
      type: "Full-Time",
      desc: "Maintain 99.87% SLA, automate AWS KMS key rotations, and harden API gateway rate limits."
    },
    {
      title: "Developer Relations & Solutions Architect",
      dept: "Product",
      location: "Hybrid / Remote",
      type: "Full-Time",
      desc: "Onboard enterprise pilot teams, build developer docs, and create open-source Composio connectors."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            We Are Hiring
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Build the Next Era of Personal Productivity
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Join engineers, researchers, and builders dedicated to reclaiming billions of wasted knowledge-worker hours worldwide.
          </p>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Open Opportunities</h2>

          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={role.title} className="glass-card rounded-2xl p-6 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{role.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{role.dept}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {role.desc}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {role.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {role.type}
                    </span>
                  </div>
                </div>

                <Button asChild size="sm" className="bg-primary text-primary-foreground shrink-0">
                  <Link href="/contact">
                    Apply Now <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
