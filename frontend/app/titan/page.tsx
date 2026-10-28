import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Brain,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  Workflow
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TitanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 backdrop-blur-md">
            <Sparkles className="size-3.5" />
            <span>Next-Gen Autonomous Intelligence Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            CPAA <span className="text-gradient-primary">Titan</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The flagship multi-agent orchestration architecture powering CPAA. Sub-second tool execution, sliding-window contextual memory, and 97% task extraction accuracy.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground font-semibold px-8 rounded-xl shadow-xl">
              <Link href="/request-access">
                Request Titan Access <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/docs">View Architecture Docs</Link>
            </Button>
          </div>
        </section>

        {/* Benchmarks Grid */}
        <section className="py-12 bg-muted/20 border-y border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 rounded-2xl glass-card">
                <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">97%</p>
                <p className="text-xs font-semibold text-foreground mt-2">Extraction Accuracy</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Unstructured action items</p>
              </div>

              <div className="p-6 rounded-2xl glass-card">
                <p className="text-3xl sm:text-4xl font-black text-indigo-400 font-mono">2.1s</p>
                <p className="text-xs font-semibold text-foreground mt-2">Average Response</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">1.4s at 100 concurrent users</p>
              </div>

              <div className="p-6 rounded-2xl glass-card">
                <p className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">150 RPS</p>
                <p className="text-xs font-semibold text-foreground mt-2">Peak Throughput</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">FastAPI & Redis queue</p>
              </div>

              <div className="p-6 rounded-2xl glass-card">
                <p className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">89%</p>
                <p className="text-xs font-semibold text-foreground mt-2">Tool Cache Hit Rate</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">-300ms latency savings</p>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Dive Pillars */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Why Titan Outperforms Generic LLMs
            </h2>
            <p className="mt-3 text-muted-foreground">
              General-purpose models hallucinate on schedules and lack real-world execution state. Titan binds language understanding directly to authenticated tool chains.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-7 space-y-4">
              <div className="size-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Brain className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">10-Message Sliding Window</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Retains context across iterative multi-turn dialogues without polluting the context window or spiking inference costs. Resolves complex entity references naturally.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7 space-y-4">
              <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Workflow className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Conflict-Free Coordination</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Checks 100% attendee availability across timezones. When overlaps occur, Titan suggests optimal alternative slots rather than failing blindly.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7 space-y-4">
              <div className="size-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Lock className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Transient Zero-Retention</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Processes calendar payloads and email bodies in transient memory. No user tokens or private correspondences are retained in prompt caches.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
