'use client';

import { useState } from 'react';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Terminal, Play, Key, RefreshCw, Copy } from 'lucide-react';

export default function ConsolePage() {
  const [apiKey, setApiKey] = useState('cpaa_live_9921_7f8a92bc44');
  const [promptInput, setPromptInput] = useState('Schedule a 30m sync with sarah@example.com tomorrow at 3pm');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const regenerateKey = () => {
    const newKey = `cpaa_live_${Math.floor(1000 + Math.random() * 9000)}_${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(newKey);
    toast.success('New API Key generated!');
  };

  const runSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulationResult(JSON.stringify({
        status: "success",
        intent: "calendar_scheduling",
        confidence: 0.98,
        action_item: {
          task: "Sync with sarah@example.com",
          start_time: "Tomorrow 3:00 PM",
          duration: "30 minutes",
          conflicts_found: 0,
          meet_link_generated: true
        },
        latency_ms: 184,
        cache_hit: true
      }, null, 2));
      toast.success('Agent simulation completed in 184ms!');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Developer Sandbox
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            CPAA Developer Console
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Test prompt reasoning, inspect webhook latency, and manage tenant credentials.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: API Key & Limits */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="size-4 text-primary" /> API Key
                </span>
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400">
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-muted p-2.5 rounded-lg flex-1 border border-border truncate">
                  {apiKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    toast.success('API Key copied!');
                  }}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-muted-foreground">Tenant: sandbox-tenant-01</span>
                <button
                  onClick={regenerateKey}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="size-3" /> Regenerate
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Rate Limit Consumption</span>
                <span className="font-mono text-emerald-400">14 / 100 req/min</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[14%]" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cap enforced per tenant via API Gateway rate limiter.
              </p>
            </div>
          </div>

          {/* Right: Interactive Simulator */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Terminal className="size-4 text-indigo-400" /> Prompt & Webhook Tester
                </span>
                <span className="text-xs text-muted-foreground font-mono">Channel: WhatsApp</span>
              </div>

              <div className="space-y-2">
                <Input
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Enter simulated WhatsApp message..."
                  className="text-sm font-sans"
                />
                <Button
                  onClick={runSimulation}
                  disabled={simulating || !promptInput}
                  className="w-full bg-primary text-primary-foreground font-semibold"
                >
                  <Play className="size-3.5 mr-1.5" />
                  Execute Agent Reasoning
                </Button>
              </div>

              {simulationResult && (
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-mono">Agent Output (JSON):</span>
                    <span className="text-emerald-400 text-[11px] font-mono">Execution time: 184ms</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {simulationResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
