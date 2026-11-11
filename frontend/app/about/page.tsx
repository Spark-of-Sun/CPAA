import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { Cpu, Code2, Layers, ShieldCheck, Terminal, Brain, Users } from 'lucide-react';

export default function AboutPage() {
  const team = [
    {
      name: "Ganpati Kumar Sah",
      initials: "GK",
      gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
      borderHover: "hover:border-purple-500/50 hover:shadow-purple-500/10",
      glowBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
      icon: Terminal,
      shortRole: "Backend Lead",
      badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      role: "Backend Architecture & Agent Loop",
      desc: "Architected the asynchronous FastAPI execution loop, multi-agent dispatch pipeline, and PostgreSQL state persistence.",
      skills: ["FastAPI", "Agent Loop", "Tool Dispatch", "PostgreSQL"]
    },
    {
      name: "Gulam Moinuddin",
      initials: "GM",
      gradient: "from-indigo-500 via-blue-500 to-cyan-400",
      borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
      glowBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
      icon: Layers,
      shortRole: "Full-Stack Lead",
      badgeClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      role: "Full-Stack Systems & Composio",
      desc: "Engineered the Next.js command dashboard, Composio OAuth tool bridges (Gmail, Calendar, Slack), and Meta Cloud API webhooks.",
      skills: ["Next.js 16", "Composio", "WhatsApp API", "AWS EC2"]
    },
    {
      name: "Jahnavi GS",
      initials: "JG",
      gradient: "from-emerald-500 via-teal-500 to-cyan-400",
      borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      glowBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      icon: Brain,
      shortRole: "LLM Reasoning",
      badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      role: "Prompt Design & Task Extraction",
      desc: "Designed few-shot prompt architectures, structured JSON action item extractors, and sliding-window conversational memory logic.",
      skills: ["AWS Bedrock", "Nova Pro", "Prompts", "JSON Schema"]
    },
    {
      name: "Dhanya J",
      initials: "DJ",
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
      glowBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
      icon: ShieldCheck,
      shortRole: "Security & QA",
      badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      role: "Security Engineering & Testing",
      desc: "Implemented AWS KMS envelope encryption for OAuth tokens, strict prompt/SQL injection filters, and cross-tenant isolation tests.",
      skills: ["AWS KMS", "AES-256", "Pen-Testing", "Sanitization"]
    }
  ];

  const pillars = [
    {
      icon: Cpu,
      title: "Hybrid LLM Architecture",
      desc: "Powered by AWS Bedrock (Amazon Nova Pro) and Google Gemini with multi-turn sliding window memory."
    },
    {
      icon: Layers,
      title: "Composio Integration Layer",
      desc: "Zero-latency tool calling directly into Gmail, Google Calendar, Google Docs, and Slack workspace accounts."
    },
    {
      icon: Code2,
      title: "WhatsApp Native Interface",
      desc: "Built on Meta Cloud API so users can dictate tasks, receive radar alerts, and schedule meetings with zero app installs."
    },
    {
      icon: ShieldCheck,
      title: "Security & Zero Retention",
      desc: "AES-256 token encryption via AWS KMS, strict input sanitization, and session-scoped isolated contexts."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary bg-primary/5">
            Our Mission & Story
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Making Every Workplace Tool Feel Like One
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            CPAA was developed as an intelligent personal AI assistant to solve the silent productivity killer of modern work: attention residue and app switching.
          </p>
        </div>

        {/* The Problem & Philosophy */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">The Engineering Philosophy Behind CPAA</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Specialization has made each modern workplace tool exceptional. Gmail is great at email, Google Calendar is great at scheduling, and Slack is great at real-time collaboration. But together, they force professionals to become human routers—manually copying action items, checking meeting times, and chasing unread threads across multiple windows.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Studies show that fragmentation reduces individual productivity by <strong>28%</strong>, while <strong>42% of commitments</strong> are missed or delayed simply because data is locked in silos. Rather than introducing another app, CPAA lives where over 2 billion people already communicate: <strong>WhatsApp</strong>.
          </p>
        </div>

        {/* The Engineering Team */}
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary bg-primary/5">
              <Users className="size-3.5 mr-1.5" />
              Core Engineers
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">The Engineering Team</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Built and maintained by an independent group of software engineers</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((dev) => (
              <div
                key={dev.name}
                className={`group relative rounded-3xl border border-border/70 bg-gradient-to-b from-card/90 via-card/50 to-card/20 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${dev.borderHover} hover:shadow-2xl flex flex-col justify-between overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 -mr-12 -mt-12 size-28 rounded-full ${dev.glowBg} blur-2xl transition-all pointer-events-none`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`size-14 rounded-2xl bg-gradient-to-tr ${dev.gradient} text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-black/20 ring-2 ring-border/80 group-hover:scale-105 transition-all duration-300`}>
                      {dev.initials}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${dev.badgeClass}`}>
                      <dev.icon className="size-3" />
                      <span>{dev.shortRole}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                      {dev.name}
                    </h4>
                    <p className="text-xs font-semibold text-primary/90 mt-0.5">
                      {dev.role}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
                      {dev.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-border/50 flex flex-wrap gap-1.5">
                  {dev.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted/60 text-muted-foreground border border-border/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Architectural Pillars */}
          <div className="pt-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground">Core Architecture Pillars</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="glass-card rounded-2xl p-6 border border-border space-y-2.5">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <pillar.icon className="size-5" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">{pillar.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
