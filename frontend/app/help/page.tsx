'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  MessageSquare,
  Plug,
  Brain,
  ShieldCheck,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
  Info,
  AlertTriangle,
  ListOrdered
} from 'lucide-react';

interface GuideStep {
  title: string;
  description: string;
  code?: string;
  tip?: string;
  warning?: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface Guide {
  id: string;
  icon: typeof MessageSquare;
  title: string;
  desc: string;
  category: string;
  readTime: string;
  steps: GuideStep[];
}

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [viewAllSteps, setViewAllSteps] = useState<boolean>(false);

  const guides: Guide[] = [
    {
      id: "whatsapp-linking",
      icon: MessageSquare,
      title: "Linking WhatsApp & OTP Issues",
      desc: "Troubleshooting country codes, delayed OTP messages, and reconnecting phone numbers.",
      category: "Onboarding",
      readTime: "3 min read",
      steps: [
        {
          title: "Step 1: Whitelist Your WhatsApp Number",
          description: "CPAA operates on the Meta WhatsApp Cloud API in pilot mode. Before your phone can receive security OTPs, your telephone number must be whitelisted on the Meta developer roster.",
          tip: "Submit your phone number via the Request Access page or message the developer directly to have your number added.",
          actionUrl: "/request-access",
          actionLabel: "Request Pilot Access"
        },
        {
          title: "Step 2: Navigate to WhatsApp Linking",
          description: "Sign in to your CPAA Dashboard and click WhatsApp in the left sidebar menu (or visit /dashboard/whatsapp).",
          actionUrl: "/dashboard/whatsapp",
          actionLabel: "Open WhatsApp Setup"
        },
        {
          title: "Step 3: Enter Phone in International Format",
          description: "Select your country flag using the searchable dropdown (e.g. +91 for India, +1 for USA) and enter your 10-digit mobile number. Do not type leading zeroes or special characters.",
          tip: "Example: For India (+91), enter 9876543210. The system formats it automatically into the international E.164 standard."
        },
        {
          title: "Step 4: Receive 6-Digit Verification Code",
          description: "Click 'Send Verification Code'. The verified CPAA business bot will dispatch a 6-digit OTP code directly to your WhatsApp inbox within 5-10 seconds.",
          code: "*CPAA Security Verification*\nYour 6-digit passcode is: 482910\nExpires in 5 minutes. Do not share this code."
        },
        {
          title: "Step 5: Confirm OTP & Test Connection",
          description: "Enter the 6-digit code into the verification input and click 'Verify & Connect WhatsApp'. Once confirmed, send a greeting message like 'Hello CPAA' on WhatsApp to begin chatting.",
          tip: "Your WhatsApp session is now cryptographically bound to your user account."
        },
        {
          title: "Step 6: Troubleshooting Missing or Delayed OTPs",
          description: "If you do not receive an OTP within 60 seconds, check the following:\n1. Verify your phone has cellular network or Wi-Fi connectivity.\n2. Check if the CPAA business account was archived or muted in WhatsApp.\n3. Wait 60 seconds and click 'Resend Code'. Maximum 3 attempts allowed per 15 minutes.\n4. If issues persist, verify that your phone number is active on WhatsApp.",
          warning: "Never enter codes from unverified contacts. All official codes originate from the verified CPAA Cloud API."
        }
      ]
    },
    {
      id: "integrations",
      icon: Plug,
      title: "Authorizing Google & Slack Tools",
      desc: "Step-by-step OAuth permissions guide for Gmail, Google Calendar, Google Docs, and Slack.",
      category: "Integrations",
      readTime: "4 min read",
      steps: [
        {
          title: "Step 1: Open the Integrations Hub",
          description: "From the CPAA Dashboard sidebar, select Integrations or navigate directly to /dashboard/integrations.",
          actionUrl: "/dashboard/integrations",
          actionLabel: "Open Integrations Hub"
        },
        {
          title: "Step 2: Connect Google Workspace (Gmail & Calendar)",
          description: "Find the Gmail and Google Calendar cards and click 'Authorize Service'. You will be redirected to the secure Google OAuth 2.0 consent screen managed by Composio.",
          tip: "CPAA requests granular scopes: gmail.modify (to read and draft email action items) and calendar.events (to schedule meetings and check schedule clashes)."
        },
        {
          title: "Step 3: Connect Slack Team Workspace",
          description: "Click 'Connect Slack' on the Slack integration card. Choose the workspace you want CPAA to access and grant bot permissions (channels:history, chat:write).",
          tip: "CPAA will be able to search discussions, extract commitments, and post updates to authorized channels."
        },
        {
          title: "Step 4: Verify Live Execution on WhatsApp",
          description: "Once authorized, open WhatsApp and send a test query to confirm that the agent can access your tools in real time.",
          code: "Hey CPAA, do I have any conflicting meetings on my Google Calendar tomorrow?"
        },
        {
          title: "Step 5: Managing Expired or Revoked Permissions",
          description: "If you change your Google or Slack password, tokens may expire. Simply return to the Integrations Hub and click 'Reconnect' to refresh the OAuth consent with a single click."
        }
      ]
    },
    {
      id: "memory-context",
      icon: Brain,
      title: "Managing Agent Memory & Context",
      desc: "How CPAA's 10-message sliding window works, and how to permanently teach the agent preferences.",
      category: "Memory Hub",
      readTime: "3 min read",
      steps: [
        {
          title: "Step 1: Short-Term vs Long-Term Memory",
          description: "CPAA uses a two-tier memory architecture:\n• Short-term: A 10-message sliding window maintaining immediate multi-turn conversational context.\n• Long-term: PostgreSQL vector embeddings that store permanent facts, rules, and user preferences across days and weeks."
        },
        {
          title: "Step 2: Teaching Preferences Naturally",
          description: "Teach CPAA rules directly within your regular WhatsApp chat. The agent recognizes preference intents and commits them to vector memory.",
          code: "Remember that I prefer 30-minute meetings and never book before 10:00 AM.\nRemember that Marcus is the VP of Marketing and prefers bullet-point summaries."
        },
        {
          title: "Step 3: Inspect Stored Memories in Dashboard",
          description: "Navigate to the Memory Hub in your dashboard (/dashboard/memory) to view all indexed facts, user rules, and timestamps.",
          actionUrl: "/dashboard/memory",
          actionLabel: "Open Memory Hub"
        },
        {
          title: "Step 4: Deleting or Updating Outdated Facts",
          description: "When your working hours or role changes, delete outdated memories with one click in the Memory Hub, or tell the agent on WhatsApp: 'Forget my previous rule about morning meetings'.",
          tip: "Memory deletions are immediate and purged from the vector index."
        },
        {
          title: "Step 5: Resetting Active Session Context",
          description: "To clear the immediate 10-message sliding window and start a clean slate without erasing persistent preferences, type /reset or /clear in WhatsApp.",
          code: "/reset"
        }
      ]
    },
    {
      id: "gmail-radar",
      icon: Mail,
      title: "Configuring Real-Time Gmail Radar",
      desc: "Enabling Google Cloud Pub/Sub push webhooks to receive high-urgency notifications under 60 seconds.",
      category: "Automations",
      readTime: "3 min read",
      steps: [
        {
          title: "Step 1: Understand Gmail Radar",
          description: "Instead of polling your inbox, Gmail Radar connects directly to Google Cloud Pub/Sub push notifications. When an email arrives, CPAA evaluates its urgency and alerts you on WhatsApp within 57 seconds."
        },
        {
          title: "Step 2: Ensure Gmail Integration is Connected",
          description: "Make sure you have authorized Gmail under /dashboard/integrations prior to enabling real-time radar push notifications.",
          actionUrl: "/dashboard/integrations",
          actionLabel: "Check Integrations"
        },
        {
          title: "Step 3: Enable the Real-Time Radar Toggle",
          description: "In the Integrations Hub, find 'Real-Time Gmail Radar' and toggle it ON. The backend registers a push subscription with Google Cloud Pub/Sub."
        },
        {
          title: "Step 4: Receiving Urgency Alerts on WhatsApp",
          description: "When an email requiring attention arrives, CPAA synthesizes it into a concise WhatsApp message with extracted action items and deadlines.",
          code: "🚨 *Priority Email Alert* (from David)\nSubject: Q3 Budget Deck Approval\n• Action: Review slide 8 OPEX forecast\n• Deadline: Today, 3:00 PM\nReply 'Draft response' or 'Ignore'"
        },
        {
          title: "Step 5: Human-in-the-Loop Confirmation Safeguard",
          description: "CPAA never dispatches external emails without your explicit approval. You will always see the email draft on WhatsApp first and must tap or type 'Confirm' before anything is sent.",
          warning: "Strict confirmation safeguards ensure zero accidental or unintended emails."
        }
      ]
    },
    {
      id: "privacy-security",
      icon: ShieldCheck,
      title: "Revoking Tokens & Data Privacy",
      desc: "How to revoke OAuth access, clear session cookies, and exercise your zero-retention privacy rights.",
      category: "Security",
      readTime: "2 min read",
      steps: [
        {
          title: "Step 1: Instant Disconnection of Integrations",
          description: "Visit /dashboard/integrations and click 'Disconnect' on any active tool. All associated OAuth tokens and refresh credentials are immediately expunged from the database.",
          actionUrl: "/dashboard/integrations",
          actionLabel: "Manage Integrations"
        },
        {
          title: "Step 2: Purging All Long-Term Vector Memories",
          description: "Navigate to the Memory Hub (/dashboard/memory) and click 'Clear All Memories'. This wipes all custom preferences and vector embeddings associated with your tenant.",
          actionUrl: "/dashboard/memory",
          actionLabel: "Open Memory Hub"
        },
        {
          title: "Step 3: Unlinking WhatsApp Account",
          description: "Under /dashboard/whatsapp, click 'Unlink Phone Number'. This deletes the phone number mapping and halts all incoming message processing immediately."
        },
        {
          title: "Step 4: Encryption & Architecture Standards",
          description: "• Tokens are encrypted at rest with AES-256 via AWS Key Management Service (KMS).\n• All traffic uses HTTPS and TLS 1.3 encryption.\n• Raw message contents are strictly session-scoped with zero cross-tenant leakage."
        },
        {
          title: "Step 5: Permanent Account Deletion",
          description: "To completely delete your account and all associated data records, email contact@ganpatikrsah.site from your registered email. All data will be permanently expunged within 24 hours.",
          actionUrl: "/contact",
          actionLabel: "Contact for Account Deletion"
        }
      ]
    }
  ];

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(query.toLowerCase()) ||
    g.desc.toLowerCase().includes(query.toLowerCase()) ||
    g.category.toLowerCase().includes(query.toLowerCase()) ||
    g.steps.some(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase()))
  );

  const handleOpenGuide = (guide: Guide) => {
    setActiveGuide(guide);
    setActiveStepIndex(0);
    setViewAllSteps(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">
            Help Center & Knowledge Base
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            How can we assist you?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Search our step-by-step guides or browse popular troubleshooting articles below.
          </p>

          <div className="pt-2 relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search help topics (e.g. OTP, Gmail, memory, calendar, privacy)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => handleOpenGuide(guide)}
              className="glass-card rounded-2xl p-6 border border-border space-y-3 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <guide.icon className="size-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {guide.readTime}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{guide.category}</Badge>
                </div>
              </div>

              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                {guide.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guide.desc}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:underline">
                  Read Step-by-Step Guide <ArrowRight className="size-3" />
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {guide.steps.length} steps
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl border border-border p-8">
            <p className="text-sm text-muted-foreground">No help articles found matching &quot;{query}&quot;</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuery('')}
              className="mt-3 text-xs"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Support Banner */}
        <div className="rounded-2xl border border-border bg-card/40 p-8 text-center space-y-3">
          <h3 className="font-bold text-lg text-foreground">Still need help?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            We are available to help answer questions, assist with whitelisting, and resolve technical issues.
          </p>
          <div className="pt-2">
            <Button asChild size="sm" className="bg-primary text-primary-foreground font-semibold">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* STEP-BY-STEP GUIDE READER MODAL */}
      <Dialog open={!!activeGuide} onOpenChange={(open) => !open && setActiveGuide(null)}>
        {activeGuide && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                  {activeGuide.category}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="size-3" />
                  {activeGuide.readTime}
                </span>
                <span>•</span>
                <span className="text-[11px]">
                  {activeGuide.steps.length} Steps
                </span>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
                <activeGuide.icon className="size-6 text-primary shrink-0" />
                <span>{activeGuide.title}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                {activeGuide.desc}
              </DialogDescription>

              {/* View Toggle */}
              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">View Mode:</span>
                  <button
                    type="button"
                    onClick={() => setViewAllSteps(false)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      !viewAllSteps
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Step-by-Step
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewAllSteps(true)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      viewAllSteps
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Steps
                  </button>
                </div>

                {!viewAllSteps && (
                  <span className="text-xs font-mono text-muted-foreground">
                    Step {activeStepIndex + 1} of {activeGuide.steps.length}
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="pt-4 space-y-6">
              {!viewAllSteps ? (
                /* SINGLE STEP STEPPER VIEW */
                <div className="space-y-5">
                  {/* Step indicators */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                    {activeGuide.steps.map((step, idx) => (
                      <button
                        key={step.title}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`h-2 flex-1 rounded-full transition-all min-w-[28px] ${
                          idx === activeStepIndex
                            ? 'bg-primary'
                            : idx < activeStepIndex
                            ? 'bg-primary/40'
                            : 'bg-muted'
                        }`}
                        title={`Jump to ${step.title}`}
                      />
                    ))}
                  </div>

                  {/* Active Step Card */}
                  <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {activeStepIndex + 1}
                      </div>
                      <h4 className="text-lg font-bold text-foreground">
                        {activeGuide.steps[activeStepIndex].title}
                      </h4>
                    </div>

                    <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {activeGuide.steps[activeStepIndex].description}
                    </p>

                    {activeGuide.steps[activeStepIndex].code && (
                      <div className="rounded-xl bg-muted/60 dark:bg-zinc-950 border border-border dark:border-zinc-800 p-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto shadow-inner">
                        <pre className="whitespace-pre-wrap">{activeGuide.steps[activeStepIndex].code}</pre>
                      </div>
                    )}

                    {activeGuide.steps[activeStepIndex].tip && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 flex items-start gap-2.5 text-xs text-foreground/90">
                        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-primary">Pro Tip: </span>
                          <span>{activeGuide.steps[activeStepIndex].tip}</span>
                        </div>
                      </div>
                    )}

                    {activeGuide.steps[activeStepIndex].warning && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start gap-2.5 text-xs text-foreground/90">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">Important: </span>
                          <span>{activeGuide.steps[activeStepIndex].warning}</span>
                        </div>
                      </div>
                    )}

                    {activeGuide.steps[activeStepIndex].actionUrl && (
                      <div className="pt-2">
                        <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs font-semibold">
                          <Link href={activeGuide.steps[activeStepIndex].actionUrl!}>
                            {activeGuide.steps[activeStepIndex].actionLabel || 'Take Action'}
                            <ExternalLink className="size-3 ml-1.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      className="text-xs"
                    >
                      <ChevronLeft className="size-3.5 mr-1" />
                      Previous Step
                    </Button>

                    <div className="text-xs text-muted-foreground">
                      Step {activeStepIndex + 1} of {activeGuide.steps.length}
                    </div>

                    {activeStepIndex < activeGuide.steps.length - 1 ? (
                      <Button
                        size="sm"
                        onClick={() => setActiveStepIndex((prev) => Math.min(activeGuide.steps.length - 1, prev + 1))}
                        className="bg-primary text-primary-foreground text-xs"
                      >
                        Next Step
                        <ChevronRight className="size-3.5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActiveGuide(null)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        <CheckCircle2 className="size-3.5 mr-1" />
                        Completed Guide
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* ALL STEPS VIEW */
                <div className="space-y-6">
                  {activeGuide.steps.map((step, idx) => (
                    <div key={step.title} className="glass-card rounded-2xl p-5 border border-border space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <h4 className="text-base font-bold text-foreground">
                          {step.title}
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed pl-9">
                        {step.description}
                      </p>

                      {step.code && (
                        <div className="ml-9 rounded-xl bg-muted/60 dark:bg-zinc-950 border border-border dark:border-zinc-800 p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto shadow-inner">
                          <pre className="whitespace-pre-wrap">{step.code}</pre>
                        </div>
                      )}

                      {step.tip && (
                        <div className="ml-9 rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-start gap-2 text-xs text-foreground/90">
                          <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-primary">Pro Tip: </span>
                            <span>{step.tip}</span>
                          </div>
                        </div>
                      )}

                      {step.warning && (
                        <div className="ml-9 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2 text-xs text-foreground/90">
                          <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-700 dark:text-amber-400">Important: </span>
                            <span>{step.warning}</span>
                          </div>
                        </div>
                      )}

                      {step.actionUrl && (
                        <div className="ml-9 pt-1">
                          <Button asChild size="sm" variant="outline" className="text-xs h-7">
                            <Link href={step.actionUrl}>
                              {step.actionLabel || 'Take Action'}
                              <ExternalLink className="size-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-2 border-t border-border">
                    <Button
                      size="sm"
                      onClick={() => setActiveGuide(null)}
                      className="bg-primary text-primary-foreground text-xs"
                    >
                      Close Guide
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      <MarketingFooter />
    </div>
  );
}
