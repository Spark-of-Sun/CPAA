import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Terminal,
  Code2,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Cpu
} from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Docs Sidebar Nav */}
          <aside className="lg:col-span-3 space-y-6">
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Getting Started</p>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#quickstart" className="text-primary font-semibold">1. Quickstart Guide</a></li>
                <li><a href="#whatsapp-linking" className="text-muted-foreground hover:text-foreground">2. WhatsApp Onboarding</a></li>
                <li><a href="#architecture" className="text-muted-foreground hover:text-foreground">3. 6-Layer Architecture</a></li>
                <li><a href="#security" className="text-muted-foreground hover:text-foreground">4. Token Encryption</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Core Guides</p>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#composio" className="text-muted-foreground hover:text-foreground">Composio Connectors</a></li>
                <li><a href="#webhooks" className="text-muted-foreground hover:text-foreground">Gmail Pub/Sub Radar</a></li>
                <li><a href="#memory-engine" className="text-muted-foreground hover:text-foreground">Hybrid Memory Engine</a></li>
                <li><a href="#rate-limits" className="text-muted-foreground hover:text-foreground">Rate Limiting & SLA</a></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Terminal className="size-3.5 text-primary" /> API Reference
              </span>
              <p className="text-[11px] text-muted-foreground">Looking for REST endpoints and schemas?</p>
              <Link href="/api-reference" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                Explore Endpoints <ChevronRight className="size-3" />
              </Link>
            </div>
          </aside>

          {/* Docs Content */}
          <div className="lg:col-span-9 space-y-12">
            <div>
              <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
                CPAA Developer Documentation
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Architectural Guide & Developer Quickstart
              </h1>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                Welcome to the official developer guide for the Configurable Personal AI Agent (CPAA). Learn how CPAA orchestrates multi-platform productivity tools through WhatsApp.
              </p>
            </div>

            {/* Quickstart Section */}
            <section id="quickstart" className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tight">1. Quickstart Guide</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Getting started with CPAA requires zero app installation. Follow these four steps to initialize your agent:
              </p>

              <div className="grid gap-4 pt-2">
                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                    <span>Sign in with Auth0</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">
                    Authenticate via Auth0 to establish an encrypted user session with an isolated tenant boundary.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                    <span>Link WhatsApp with OTP</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">
                    Provide your phone number in the dashboard. Enter the 6-digit verification passcode delivered to your WhatsApp.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
                    <span>Authorize Composio Workspace Tools</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">
                    Grant 1-click OAuth access to Gmail, Google Calendar, and Docs. Tokens are encrypted using AES-256 via AWS KMS.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="size-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
                    <span>Start Chatting on WhatsApp</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">
                    Text: <code>"What are my meetings today?"</code> or <code>"Summarize urgent emails"</code>. Average response time is 2.1 seconds.
                  </p>
                </div>
              </div>
            </section>

            {/* Architecture Overview */}
            <section id="architecture" className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tight">2. The 6-Layer Architecture</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CPAA is structured into six independent layers to ensure high availability (99.87%), rapid iteration, and strict user isolation:
              </p>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2 overflow-x-auto">
                <p className="text-emerald-400"># 6-Layer System Architecture</p>
                <p>[User on WhatsApp] ──&gt; (Meta Cloud API Webhook)</p>
                <p>                     │</p>
                <p>                     ▼</p>
                <p>[Layer 1: Gateway]    ──&gt; Nginx (TLS 1.3, Rate Limit: 100 req/min/user)</p>
                <p>                     │</p>
                <p>                     ▼</p>
                <p>[Layer 2: App Engine] ──&gt; FastAPI (Agent Manager, Sliding Context Window)</p>
                <p>                     │</p>
                <p>                     ▼</p>
                <p>[Layer 3: Composio]   ──&gt; Tool Connectors (Gmail, Calendar, Slack, Meet)</p>
                <p>                     │</p>
                <p>                     ▼</p>
                <p>[Layer 4: Intelligence]──&gt; AWS Bedrock / Kimi-K2 Reasoning Engine</p>
                <p>                     │</p>
                <p>                     ▼</p>
                <p>[Layer 5: Memory]     ──&gt; Redis (Sliding window) + PostgreSQL (Durable records)</p>
                <p>[Layer 6: Security]   ──&gt; AES-256 AWS KMS (Zero-Retention Prompt Cache)</p>
              </div>
            </section>

            {/* Code Sample */}
            <section id="composio" className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tight">3. Sample Prompt Execution in Python</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Backend orchestrators can interact with the agent manager via FastAPI client bindings:
              </p>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                <pre>{`import httpx

async def query_cpaa_agent(user_id: str, prompt: str):
    headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    payload = {
        "user_id": user_id,
        "message": prompt,
        "channel": "whatsapp"
    }
    
    # Resolves calendar conflicts and drafts emails with 97% task accuracy
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.cpaa.ai/v1/agent/chat",
            json=payload,
            headers=headers,
            timeout=10.0
        )
        return response.json()`}</pre>
              </div>
            </section>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
