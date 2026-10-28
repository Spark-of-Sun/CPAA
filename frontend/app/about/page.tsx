import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

export default function AboutPage() {
  const team = [
    {
      name: "Gulam Moinuddin",
      role: "Backend Architecture & Agent Orchestration",
      dept: "Final-Year B.E. CSE (AIML), AMC Engineering College"
    },
    {
      name: "Ganpati Kumar Sah",
      role: "Full-Stack Systems & Composio Integration",
      dept: "Final-Year B.E. CSE (AIML), AMC Engineering College"
    },
    {
      name: "Jahnavi GS",
      role: "Language Model Prompt Design & Task Extraction",
      dept: "Final-Year B.E. CSE (AIML), AMC Engineering College"
    },
    {
      name: "Dhanya J",
      role: "Security Penetration & Input Sanitization",
      dept: "Final-Year B.E. CSE (AIML), AMC Engineering College"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">
            Our Mission & Story
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Making Every Workplace Tool Feel Like One
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            CPAA was born from research conducted at AMC Engineering College, Bengaluru. We set out to solve the silent productivity killer of modern work: attention residue and app switching.
          </p>
        </div>

        {/* The Problem & Thesis */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">The Academic Thesis Behind CPAA</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Specialization has made each modern tool exceptional. Gmail is great at email, Google Calendar is great at time management, and Slack is great at real-time discussions. But together, they force professionals to become human routers, manually copying action items, checking meeting times, and chasing unread threads.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our research revealed that fragmentation reduces individual productivity by <strong>28%</strong>, while <strong>42% of commitments</strong> are missed or delayed simply because data is locked in silos. Rather than introducing another app, CPAA lives where over 2 billion people already communicate: <strong>WhatsApp</strong>.
          </p>
        </div>

        {/* Founding Research Team */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The Founding Research Team</h2>
            <p className="text-xs text-muted-foreground mt-1">Department of CSE (AIML), AMC Engineering College, Bengaluru</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((m) => (
              <div key={m.name} className="glass-card rounded-2xl p-6 border border-border space-y-2">
                <h4 className="text-lg font-bold text-foreground">{m.name}</h4>
                <p className="text-xs font-semibold text-primary">{m.role}</p>
                <p className="text-xs text-muted-foreground">{m.dept}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Award className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Academic Research Advisor</p>
              <h4 className="text-base font-bold text-foreground mt-0.5">Dr. K Vijayakumar</h4>
              <p className="text-xs text-muted-foreground">
                Professor, Department of Computer Science & Engineering (AIML), AMC Engineering College, Bengaluru
              </p>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
