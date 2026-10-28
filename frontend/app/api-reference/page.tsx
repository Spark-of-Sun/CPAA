'use client';

import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiReferencePage() {
  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/linking/send-otp',
      desc: 'Dispatches a 6-digit one-time passcode to the user WhatsApp account.',
      req: '{\n  "phone_number": "919876543210"\n}',
      res: '{\n  "status": "otp_sent",\n  "expires_in": 300\n}'
    },
    {
      method: 'POST',
      path: '/linking/verify-otp',
      desc: 'Validates WhatsApp passcode and binds the phone number to the user tenant.',
      req: '{\n  "phone_number": "919876543210",\n  "code": "123456"\n}',
      res: '{\n  "linked": true,\n  "phone_number": "+919876543210",\n  "linked_at": "2026-10-26T12:00:00Z"\n}'
    },
    {
      method: 'GET',
      path: '/tools/connected',
      desc: 'Returns all active Composio workspace toolkits (Gmail, Calendar, Slack).',
      req: '{}',
      res: '{\n  "tools": [\n    { "toolkit": "gmail", "status": "connected" },\n    { "toolkit": "googlecalendar", "status": "connected" }\n  ]\n}'
    },
    {
      method: 'POST',
      path: '/tools/triggers/gmail',
      desc: 'Sets up Google Cloud Pub/Sub real-time webhook listener for incoming emails.',
      req: '{}',
      res: '{\n  "status": "success",\n  "configured": true,\n  "latency_sla": "<60s"\n}'
    },
    {
      method: 'POST',
      path: '/users/me/memories',
      desc: 'Stores a new persistent semantic rule or preference into the agent vector store.',
      req: '{\n  "content": "I prefer 30-minute meetings in the morning."\n}',
      res: '{\n  "id": "mem_9941a",\n  "status": "indexed",\n  "vector_dimensions": 1536\n}'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            REST API v1
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            CPAA API Reference
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Programmatically trigger agent workflows, inspect connection statuses, and manage user memory stores.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Base URL:</span>
            <code className="text-xs font-mono bg-muted px-2.5 py-1 rounded border border-border">
              https://api.cpaa.ai/v1
            </code>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-8 max-w-5xl">
          {endpoints.map((ep) => (
            <div key={ep.path} className="rounded-2xl border border-border bg-card/40 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                    ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">{ep.path}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">Rate Limit: 100 req/min</span>
                  <button
                    onClick={() => copyCode(ep.req)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Copy request payload"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{ep.desc}</p>

              <div className="grid md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Request Payload</p>
                  <pre className="text-zinc-300 overflow-x-auto">{ep.req}</pre>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Response JSON (200 OK)</p>
                  <pre className="text-zinc-300 overflow-x-auto">{ep.res}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
