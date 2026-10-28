'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, User } from '@/lib/api';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bot,
  MessageSquare,
  Sparkles,
  Mail,
  Calendar,
  Brain,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  FileText,
  Lock,
  Smartphone,
  ExternalLink,
  Workflow,
  Users,
  TrendingUp,
  BarChart3,
  BookOpen,
  Award,
  Check,
  X as CloseIcon,
  GraduationCap,
  Building2,
  Cpu,
  Database,
  Network,
  Scale,
  DollarSign,
  Play,
  Pause
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [teamSize, setTeamSize] = useState<number>(50);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    api.getMe()
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .catch(() => {});
  }, []);

  // 1-second auto timer to cycle through scenarios (stops when user clicks or hovers)
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const timer = setInterval(() => {
      setActiveScenario((prev) => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered]);

  // ROI Calculator Calculations
  const hoursPerDaySaved = (teamSize * 45) / 60;
  const annualHoursSaved = Math.round(hoursPerDaySaved * 250);
  const annualDollarsSaved = Math.round(annualHoursSaved * 48); // ~$100k/yr avg knowledge worker salary

  const scenarios = [
    {
      title: "Morning Briefing",
      badge: "Google Calendar & Gmail",
      userMsg: "Hey CPAA, what does my day look like and are there any urgent emails?",
      agentMsg: "Good morning Alex! ☀️\n\n📅 You have 3 meetings today:\n• 10:00 AM - Sprint Planning (Google Meet)\n• 2:00 PM - Product Review with Sarah\n• 4:30 PM - Client Sync\n\n✉️ 1 High-priority email from David regarding 'Q3 Budget Approval' awaiting your review.\n\nWould you like me to draft a quick response to David?",
      agentAction: "Retrieved 3 events from Google Calendar & analyzed 14 unread Gmail threads via Composio.",
      latency: "1.8s",
      accuracy: "98% context match",
      time: "8:30 AM"
    },
    {
      title: "Automated Task Extraction",
      badge: "97% Accuracy Engine",
      userMsg: "Summarize David's email and add any action items to my commitments.",
      agentMsg: "David needs the finalized financial spreadsheet by 3:00 PM today before the executive committee meets.\n\n✅ Action Item Extracted (97% Confidence):\n• Task: Send finalized Q3 spreadsheet to David\n• Deadline: Today, 3:00 PM\n• Owner: Alex\n• Urgency: High\n\nI've also attached the direct link to the Google Sheet from his message.",
      agentAction: "Extracted action items using LangChain reasoning & synced task metadata.",
      latency: "2.1s",
      accuracy: "97% task extraction",
      time: "8:32 AM"
    },
    {
      title: "Calendar-Aware Scheduling",
      badge: "Conflict Detection",
      userMsg: "Schedule a 30-minute sync with Sarah tomorrow at 2pm to discuss the roadmap.",
      agentMsg: "Sarah has a conflict at 2:00 PM tomorrow. 🗓️\n\nI checked both schedules and found these open alternatives:\n1. Tomorrow at 3:00 PM - 3:30 PM\n2. Tomorrow at 4:30 PM - 5:00 PM\n\nWhich slot works best for you?",
      agentAction: "Executed conflict resolution checking 100% attendee availability via Google Calendar API.",
      latency: "1.9s",
      accuracy: "100% availability check",
      time: "11:15 AM"
    },
    {
      title: "Proactive Email Push Alert",
      badge: "57s Real-Time Radar",
      userMsg: "Confirm slot 1 (3:00 PM) with Sarah and send an email update.",
      agentMsg: "Scheduled! 🎉\n\n'Product Roadmap Sync' is set with Sarah for tomorrow at 3:00 PM - 3:30 PM.\n\nGoogle Meet link generated and calendar invite dispatched to sarah@company.com.\n\nDraft email confirmation prepared. Should I send it now?",
      agentAction: "Human-in-the-loop explicit verification before dispatching external email.",
      latency: "2.0s",
      accuracy: "Zero prompt injection",
      time: "11:18 AM"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid-pattern relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-radial-glow pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[55%] left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Top Navigation */}
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1">
        {/* Research Credential Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-muted/80 border border-border/80 text-foreground mb-6 backdrop-blur-md shadow-sm">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground">AMC Engineering College, Bengaluru • Dept. of CSE (AIML)</span>
          <span className="text-border">|</span>
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            Read Pitch Report <ChevronRight className="size-3" />
          </button>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Productivity meets simplicity. <br />
          <span className="text-gradient-primary">
            Meet your new way to work on WhatsApp.
          </span>
        </h1>

        {/* Subtitle with Real Report Value */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Knowledge workers do not lack tools—they lack a way to use them without losing focus. CPAA orchestrates Gmail, Google Calendar, Slack, and Meet through a single conversational interface on WhatsApp. No new app to install, no syntax to learn.
        </p>

        {/* Real Pilot Proof Badges in Hero */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="size-3.5" /> 97% Task Extraction Accuracy
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Zap className="size-3.5" /> 2.1s Average Response
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Clock className="size-3.5" /> 45 Mins Saved / Person / Day
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <ShieldCheck className="size-3.5" /> 99.87% Tested Uptime
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xl shadow-primary/20 transition-all font-semibold">
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                <span>Enter Command Center</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <a href={api.login()} className="flex items-center gap-2">
                <span>Get Started with Auth0</span>
                <ArrowRight className="size-4" />
              </a>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setReportModalOpen(true)}
            className="h-12 px-6 text-base rounded-xl border-border/80 hover:bg-muted/50 backdrop-blur-md"
          >
            <BookOpen className="size-4 mr-2 text-indigo-400" />
            <span>Read 15-Person Pilot Study</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base rounded-xl border-border/80 hover:bg-muted/50 backdrop-blur-md"
          >
            <a
              href="https://github.com/Spark-of-Sun/CPAA"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <span>GitHub</span>
              <ExternalLink className="size-4 opacity-70" />
            </a>
          </Button>
        </div>
      </section>

      {/* The Problem: Work Is Scattered (Real Research Section) */}
      <section id="problem" className="py-20 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3 py-1 border-red-500/30 text-red-400 bg-red-500/10">
              The Fragmentation Crisis
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Work Is Scattered Across Too Many Places
            </h2>
            <p className="mt-3 text-muted-foreground">
              Professionals juggle 4 to 6 communication platforms daily. Every switch between applications leaves attention residue that degrades productivity and wellbeing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Stat Card 1 */}
            <div className="glass-card rounded-2xl p-7 border-border flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-5">
                  <Clock className="size-6" />
                </div>
                <div className="text-3xl font-extrabold text-foreground mb-1">28%</div>
                <h3 className="text-base font-semibold text-foreground mb-2">Lost Individual Productivity</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every switch leaves attention residue. For one worker, fragmentation costs more than 250 hours a year—roughly six full weeks of lost working time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono">
                Source: Multitasking & Context-Switching Research
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="glass-card rounded-2xl p-7 border-border flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                  <AlertCircleIcon className="size-6" />
                </div>
                <div className="text-3xl font-extrabold text-foreground mb-1">42%</div>
                <h3 className="text-base font-semibold text-foreground mb-2">Lost Commitments & Deadlines</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Deadlines in Slack never reach the calendar. Requests in emails never become tasks. 42% of missed commitments happen because information is trapped across silos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono">
                Source: Departmental Benchmark Study
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="glass-card rounded-2xl p-7 border-border flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
                  <Brain className="size-6" />
                </div>
                <div className="text-3xl font-extrabold text-foreground mb-1">4 to 6</div>
                <h3 className="text-base font-semibold text-foreground mb-2">Daily Platform Juggles</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Constant switching and the worry of what slipped through generates severe tool fatigue. Employees feel the stress even when the real flaw is the scattered system.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-mono">
                Result: Chronic Tool Fatigue & Burnout
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live WhatsApp Simulation */}
      <section id="demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            <Sparkles className="size-3 mr-1.5" />
            Tested in Real Pilots
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            One Conversation. Every Workplace Platform.
          </h2>
          <p className="mt-3 text-muted-foreground">
            The user speaks naturally, and CPAA does the clicking across Gmail, Calendar, Slack, and Google Meet.
          </p>

          {/* Scenario switcher buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {scenarios.map((s, idx) => (
              <button
                key={s.title}
                onClick={() => {
                  setActiveScenario(idx);
                  setIsAutoPlaying(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeScenario === idx
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.title}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              title={isAutoPlaying ? "Pause auto-transition" : "Play auto-transition"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isAutoPlaying
                  ? 'border-border/70 bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="size-3 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="size-3 text-emerald-400 fill-emerald-400" />
                  <span>Auto-play (1s)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual Panel Simulation */}
        <div
          className="grid lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsAutoPlaying(false)}
        >
          {/* Left: Realistic WhatsApp Frame */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border/80 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col h-[520px]">
              {/* WhatsApp Header */}
              <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                      <Bot className="size-5" />
                    </div>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-zinc-100">CPAA Agent</h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">Meta Cloud API</span>
                    </div>
                    <p className="text-xs text-zinc-400">Online • 99.87% Verified Uptime</p>
                  </div>
                </div>

                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs">
                  {scenarios[activeScenario].badge}
                </Badge>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950/80 bg-grid-pattern">
                <div className="flex justify-center">
                  <span className="text-[11px] bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full border border-zinc-800">
                    Encrypted Session • TLS 1.3
                  </span>
                </div>

                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-emerald-700 text-emerald-50 rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md">
                    <p className="text-sm leading-relaxed">{scenarios[activeScenario].userMsg}</p>
                    <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-emerald-200/80">
                      <span>{scenarios[activeScenario].time}</span>
                      <CheckCircle2 className="size-3 text-emerald-300" />
                    </div>
                  </div>
                </div>

                {/* Agent Bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-md space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5" />
                        <span>CPAA Hybrid Reasoning Engine</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {scenarios[activeScenario].latency}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-200">
                      {scenarios[activeScenario].agentMsg}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="size-3" /> {scenarios[activeScenario].accuracy}
                      </span>
                      <span>Just now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="bg-zinc-900 border-t border-zinc-800 p-3 flex items-center gap-2">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Message CPAA on WhatsApp...</span>
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">2.1s avg response</span>
                </div>
                <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <MessageSquare className="size-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Technical Execution Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-semibold text-sm text-foreground">Orchestration Trace</h3>
                </div>
                <Badge variant="outline" className="text-xs">Composio + Bedrock</Badge>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-muted-foreground">Action Executed:</p>
                  <p className="text-indigo-400 font-semibold mt-1">
                    {scenarios[activeScenario].agentAction}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Measured Latency:</span>
                    <span className="text-emerald-400 font-semibold">{scenarios[activeScenario].latency} (Target: 2.5s)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tool Cache Status:</span>
                    <span className="text-foreground font-semibold">Hit (89% Hit Rate, -300ms)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Memory Context:</span>
                    <span className="text-purple-400 font-semibold">10-Msg Sliding Window + Vector</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Security Verification:</span>
                    <span className="text-emerald-400 font-semibold">Sanitized, Zero Prompt Injection</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Tested with 15 pilot users
                </div>
                <Button asChild size="sm" className="bg-primary text-primary-foreground">
                  <a href={api.login()}>
                    Try Live Agent <ArrowRight className="size-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Core Capability Note */}
            <div className="rounded-2xl border border-border/60 bg-card/40 p-5 flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Human-in-the-Loop Safeguard</p>
                <p className="text-muted-foreground mt-0.5">
                  CPAA asks for explicit confirmation before high-stakes actions like sending emails or booking external meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traction & Proof: Objectives vs Results */}
      <section id="proof" className="py-20 bg-muted/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3 py-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Verified Scientific Proof
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tested Performance & Measured Objectives
            </h2>
            <p className="mt-3 text-muted-foreground">
              We evaluated CPAA against six quantitative benchmarks set at project inception, followed by an intensive two-week pilot.
            </p>
          </div>

          {/* Objectives Benchmark Table */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-border/70 bg-card/50 overflow-hidden shadow-xl mb-12">
            <div className="p-4 bg-muted/40 border-b border-border font-semibold text-sm flex justify-between items-center">
              <span>Objective vs Result Matrix</span>
              <span className="text-xs text-emerald-400 font-mono">100% Targets Met or Exceeded</span>
            </div>
            <div className="divide-y divide-border/60 text-sm">
              <div className="grid grid-cols-12 p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
                <div className="col-span-5">Metric / Objective</div>
                <div className="col-span-3">Target</div>
                <div className="col-span-4">Measured Result</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-5 font-medium flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Task Extraction Accuracy
                </div>
                <div className="col-span-3 text-muted-foreground">95%</div>
                <div className="col-span-4 font-bold text-emerald-400 font-mono">97% Achieved</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-5 font-medium flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Average Response Time
                </div>
                <div className="col-span-3 text-muted-foreground">&lt; 2.5 seconds</div>
                <div className="col-span-4 font-bold text-emerald-400 font-mono">2.1s Average (1.4s at scale)</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-5 font-medium flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Email Push Alert Latency
                </div>
                <div className="col-span-3 text-muted-foreground">&lt; 60 seconds</div>
                <div className="col-span-4 font-bold text-emerald-400 font-mono">57s Average</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-5 font-medium flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  System Availability / Uptime
                </div>
                <div className="col-span-3 text-muted-foreground">99.5%</div>
                <div className="col-span-4 font-bold text-emerald-400 font-mono">99.87% Tested</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-5 font-medium flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Multi-Turn Context Preservation
                </div>
                <div className="col-span-3 text-muted-foreground">90%</div>
                <div className="col-span-4 font-bold text-emerald-400 font-mono">98% (49 of 50 test chats)</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center">
                <div className="col-span-5 font-medium flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Security & Token Isolation
                </div>
                <div className="col-span-3 text-muted-foreground">Zero Leaks</div>
                <div className="col-span-4 font-bold text-emerald-400 font-mono">50/50 Penetration Attacks Blocked</div>
              </div>
            </div>
          </div>

          {/* 15-Person Pilot Result Highlight */}
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-card/50 to-purple-950/40 p-8 sm:p-10 max-w-4xl mx-auto shadow-2xl">
            <div className="grid sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              <div className="pt-4 sm:pt-0">
                <div className="text-4xl font-extrabold text-white font-mono">45 min</div>
                <p className="text-xs text-muted-foreground mt-1">Saved per person per day</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">15-person 2-week pilot</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:pl-6">
                <div className="text-4xl font-extrabold text-white font-mono">12/day</div>
                <p className="text-xs text-muted-foreground mt-1">Average user sessions</p>
                <p className="text-[11px] text-indigo-400 mt-0.5">Habitual daily adoption</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:pl-6">
                <div className="text-4xl font-extrabold text-white font-mono">100%</div>
                <p className="text-xs text-muted-foreground mt-1">Reported zero app-switching</p>
                <p className="text-[11px] text-purple-400 mt-0.5">14/15 noted stress reduction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6-Layer Modular Architecture */}
      <section id="architecture" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Engineered to Scale
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built as Six Cooperating Layers
          </h2>
          <p className="mt-3 text-muted-foreground">
            Each layer can be developed, secured, and scaled horizontally without bottlenecking the system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Layer 1 */}
          <div className="glass-card rounded-2xl p-6 border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <Badge variant="secondary" className="text-[10px]">Interface</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">User Interface Layer</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">WhatsApp / Meta Cloud Business API</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Sends and receives natural language text and voice notes. Leverages WhatsApp's 2B+ global install base so users never need to adopt another app.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-emerald-400">
              ✓ Sub-second webhook routing
            </div>
          </div>

          {/* Layer 2 */}
          <div className="glass-card rounded-2xl p-6 border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <Badge variant="secondary" className="text-[10px]">Gateway</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">API Gateway Layer</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Nginx, Rate Limiter, TLS 1.3</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Encrypted entry point. Enforces 100 req/min/user rate limits, sanitizes incoming payloads against prompt injection, and manages session tokens.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-indigo-400">
              ✓ 100 req/min rate limit per user
            </div>
          </div>

          {/* Layer 3 */}
          <div className="glass-card rounded-2xl p-6 border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <Badge variant="secondary" className="text-[10px]">Orchestration</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">Application Layer</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">FastAPI (Python) + Agent Manager</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Coordinates an isolated agent instance per user. Implements sliding window memory, task priority algorithms, and human-in-the-loop safeguards.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-blue-400">
              ✓ 150 RPS peak throughput
            </div>
          </div>

          {/* Layer 4 */}
          <div className="glass-card rounded-2xl p-6 border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <Badge variant="secondary" className="text-[10px]">Integrations</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">Integration Layer</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Composio Unified Interface</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Single unified abstraction layer to Gmail, Google Calendar, Slack, and Google Meet. Automatically handles OAuth2 lifecycle and token refresh.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-purple-400">
              ✓ 89% tool cache hit rate (-300ms)
            </div>
          </div>

          {/* Layer 5 */}
          <div className="glass-card rounded-2xl p-6 border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-xs">
                  05
                </div>
                <Badge variant="secondary" className="text-[10px]">Reasoning</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">Intelligence Layer</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">AWS Bedrock, Kimi-K2, Claude/LLMs</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Natural language understanding, action extraction, intent classification, and entity resolution with prompt caching to minimize latency and inference cost.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-pink-400">
              ✓ 97% task extraction accuracy
            </div>
          </div>

          {/* Layer 6 */}
          <div className="glass-card rounded-2xl p-6 border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  06
                </div>
                <Badge variant="secondary" className="text-[10px]">Storage</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">Data & Memory Layer</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">PostgreSQL + Redis Cache</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Durable relational storage for audit logs and user preferences. High-performance Redis for rate limiting, active session states, and short-term sliding context.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-amber-400">
              ✓ AES-256 AWS KMS encrypted
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="roi" className="py-20 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
              The Value of Focus
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Calculate Your Organization's Recovered Capacity
            </h2>
            <p className="mt-3 text-muted-foreground">
              Based on the measured pilot finding of 45 minutes saved per person per day across 250 working days.
            </p>
          </div>

          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 sm:p-12 border border-border">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-foreground">
                    Number of Team Members: <span className="font-mono text-primary text-base font-bold">{teamSize}</span>
                  </label>
                  <span className="text-xs text-muted-foreground">Slide to adjust team size</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                  <span>5 members</span>
                  <span>100 members</span>
                  <span>250 members</span>
                  <span>500 members</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border/60 text-center">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Annual Hours Saved</p>
                  <p className="text-3xl sm:text-4xl font-black text-foreground font-mono mt-2">
                    {annualHoursSaved.toLocaleString()} hrs
                  </p>
                  <p className="text-[11px] text-indigo-400 mt-1">
                    ~{(annualHoursSaved / 2000).toFixed(1)} person-years
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estimated Value Saved</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-2">
                    ${annualDollarsSaved.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    At $100k avg annual salary
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Commitments Preserved</p>
                  <p className="text-3xl sm:text-4xl font-black text-purple-400 font-mono mt-2">
                    {Math.round(teamSize * 42)} / mo
                  </p>
                  <p className="text-[11px] text-purple-300 mt-1">
                    42% reduction in missed tasks
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Button asChild size="lg" className="bg-primary text-primary-foreground font-semibold px-8 rounded-xl shadow-lg">
                  <a href={api.login()}>
                    Start Pilot for Your Team <ArrowRight className="size-4 ml-1.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Matrix (Directly from Pitch Report) */}
      <section id="comparison" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Market Differentiation
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How CPAA Compares with Existing Solutions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Most products either add one more app to an already crowded day or lock you into a single vendor ecosystem. CPAA is a neutral orchestration layer.
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-card/40 overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="p-4 font-semibold">Capability</th>
                <th className="p-4 font-bold text-primary">CPAA</th>
                <th className="p-4 font-medium">Gmail Assistants</th>
                <th className="p-4 font-medium">Microsoft Viva</th>
                <th className="p-4 font-medium">Notion AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-4 font-medium">Platforms Unified</td>
                <td className="p-4 font-bold text-emerald-400">Gmail, Calendar, Slack, Meet</td>
                <td className="p-4 text-muted-foreground">Gmail only</td>
                <td className="p-4 text-muted-foreground">Microsoft only</td>
                <td className="p-4 text-muted-foreground">Notion only</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Task Extraction</td>
                <td className="p-4 font-bold text-emerald-400">97% accuracy (unstructured)</td>
                <td className="p-4 text-muted-foreground">Limited heuristics</td>
                <td className="p-4 text-muted-foreground">Manual tagging</td>
                <td className="p-4 text-muted-foreground">Limited to docs</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Real-Time Alerts</td>
                <td className="p-4 font-bold text-emerald-400">~57s via WhatsApp Push</td>
                <td className="p-4 text-muted-foreground">Batched inbox</td>
                <td className="p-4 text-muted-foreground">Teams email only</td>
                <td className="p-4 text-muted-foreground">Not yet</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Interface</td>
                <td className="p-4 font-bold text-emerald-400">WhatsApp Native (0 install)</td>
                <td className="p-4 text-muted-foreground">Web client / extension</td>
                <td className="p-4 text-muted-foreground">Microsoft Teams app</td>
                <td className="p-4 text-muted-foreground">Notion desktop / web</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Multi-Turn Context</td>
                <td className="p-4 font-bold text-emerald-400">Yes (10-message window)</td>
                <td className="p-4 text-muted-foreground">Single turn</td>
                <td className="p-4 text-muted-foreground">Within Teams only</td>
                <td className="p-4 text-muted-foreground">Per-page only</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Vendor Neutrality</td>
                <td className="p-4 font-bold text-emerald-400">100% Cross-Platform</td>
                <td className="p-4 text-muted-foreground">Google only</td>
                <td className="p-4 text-muted-foreground">Strict lock-in</td>
                <td className="p-4 text-muted-foreground">Walled garden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* The Team & Academic Mentorship Section */}
      <section id="team" className="py-20 bg-muted/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
              <GraduationCap className="size-3.5 mr-1.5" />
              The Inventors & Engineers
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Department of CSE (AIML), AMC Engineering College
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built by final-year Computer Science & Engineering (Artificial Intelligence and Machine Learning) students under expert academic guidance in Bengaluru, India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            {/* Team Member 1 */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="size-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                GM
              </div>
              <h4 className="font-bold text-foreground">Gulam Moinuddin</h4>
              <p className="text-xs text-primary font-medium mt-0.5">Final-Year B.E. CSE (AIML)</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Backend Engineering, Agent Orchestration & API Architecture
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="size-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                GK
              </div>
              <h4 className="font-bold text-foreground">Ganpati Kumar Sah</h4>
              <p className="text-xs text-primary font-medium mt-0.5">Final-Year B.E. CSE (AIML)</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Full-Stack Systems, Composio Integrations & Deployment
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="size-16 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
                JG
              </div>
              <h4 className="font-bold text-foreground">Jahnavi GS</h4>
              <p className="text-xs text-primary font-medium mt-0.5">Final-Year B.E. CSE (AIML)</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Language Model Prompt Design & Task Extraction Modeling
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="size-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                DJ
              </div>
              <h4 className="font-bold text-foreground">Dhanya J</h4>
              <p className="text-xs text-primary font-medium mt-0.5">Final-Year B.E. CSE (AIML)</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Security Penetration Testing, Sanitization & Evaluation
              </p>
            </div>
          </div>

          {/* Academic Guide Banner */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="size-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Award className="size-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Academic Research Advisor</p>
              <h4 className="text-lg font-bold text-foreground mt-0.5">Dr. K Vijayakumar</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Professor, Department of Computer Science & Engineering (AIML), AMC Engineering College, Bengaluru
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Ask / Join Pilot Partners */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-indigo-950 via-zinc-900 to-purple-950 border border-indigo-500/20 p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-white/20 text-zinc-200">
              Moving From Research to Market
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Turn Scattered Work into a Single Conversation?
            </h2>
            <p className="mt-4 text-zinc-300 text-base sm:text-lg leading-relaxed">
              We are seeking pilot partners, cloud infrastructure support, and advisory mentorship to scale CPAA to teams worldwide.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-white text-zinc-950 hover:bg-zinc-100 font-semibold rounded-xl shadow-xl">
                {user ? (
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <span>Open Dashboard</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <a href={api.login()} className="flex items-center gap-2">
                    <span>Join the Pilot Free</span>
                    <ArrowRight className="size-4" />
                  </a>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setReportModalOpen(true)}
                className="h-12 px-6 text-base rounded-xl border-white/20 text-white hover:bg-white/10"
              >
                <BookOpen className="size-4 mr-2" />
                <span>Read Full Pitch Document</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />

      {/* FULL PITCH REPORT DIALOG MODAL */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              CPAA: Productivity meets simplicity. Meet your new way to work on WhatsApp.
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Business Pitch Report & Research Study | Department of CSE (AIML), AMC Engineering College, Bengaluru
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4 text-sm text-foreground/90 leading-relaxed font-sans">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs">
              <p className="font-semibold text-primary mb-1">AUTHORS & RESEARCH ADVISOR</p>
              <p>Prepared by: <strong>Gulam Moinuddin, Ganpati Kumar Sah, Jahnavi GS, Dhanya J</strong></p>
              <p>Under the Guidance of: <strong>Dr. K Vijayakumar</strong>, Professor, Dept. of CSE (AIML)</p>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground mb-2">Executive Summary</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Knowledge workers do not lack tools. They lack a way to use them without losing focus. A typical professional moves between Gmail, Google Calendar, Slack, and Google Meet all day, and every switch costs attention, time, and missed commitments.
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                CPAA solves this with one conversation on WhatsApp. In rigorous testing, CPAA detected action items with <strong>97% accuracy</strong>, responded in <strong>2.1 seconds average</strong>, delivered email alerts in <strong>57 seconds</strong>, and reached <strong>99.87% uptime</strong>. A 15-person, two-week pilot reported savings of roughly <strong>45 minutes per person per day</strong>.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground mb-2">The Problem: Fragmentation Cost</h3>
              <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-5">
                <li><strong>Lost time:</strong> 28% reduction in individual productivity (~250+ hours/year, ~6 weeks full-time work).</li>
                <li><strong>Lost commitments:</strong> 42% of commitments missed or delayed because information is split across disconnected silos.</li>
                <li><strong>Lost wellbeing:</strong> Constant switching creates tool fatigue and employee burnout.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground mb-2">Six Core Capabilities</h3>
              <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal pl-5">
                <li><strong>Multi-turn conversation:</strong> Preserves context across 10-message sliding window (98% tested context retention).</li>
                <li><strong>Automated task extraction:</strong> Identifies action item, owner, urgency, and deadline with 97% accuracy.</li>
                <li><strong>Calendar-aware scheduling:</strong> Checks 100% attendee availability, resolves conflicts, handles timezones.</li>
                <li><strong>Proactive email monitoring:</strong> Push alerts on urgent emails within ~57 seconds.</li>
                <li><strong>Natural-language composition:</strong> Dictate emails and messages with explicit confirmation safeguards.</li>
                <li><strong>Meeting coordination:</strong> Agendas drawn from emails to post-meeting action summaries.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground mb-2">Security & Trust by Design</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5">
                <li>OAuth tokens encrypted with AES-256 via AWS KMS.</li>
                <li>All traffic secured with HTTPS and TLS 1.3.</li>
                <li>24-hour session expiry and 100 req/min rate limit per user.</li>
                <li>Sanitized inputs protecting against prompt, SQL, and command injection attacks.</li>
                <li>Zero cross-user data sharing (all 50 test penetration attempts blocked).</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground">AMC Engineering College, Bengaluru</span>
              <Button size="sm" onClick={() => setReportModalOpen(false)}>
                Close Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
