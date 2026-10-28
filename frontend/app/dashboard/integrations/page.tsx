"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, AvailableTool, Tool } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  Plug,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  MessageSquare,
  Search,
  X,
  Sparkles,
  ExternalLink
} from "lucide-react"

interface ToolMeta {
  name: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
  accentBg: string
  capabilities: string[]
}

const KNOWN_TOOLS: Record<string, ToolMeta> = {
  gmail: {
    name: "gmail",
    label: "Gmail",
    description: "Read threads, extract action items, summarize urgent emails, and draft intelligent replies.",
    icon: <Mail className="size-5 text-red-500" />,
    color: "border-red-500/30 text-red-400",
    accentBg: "bg-red-500/10",
    capabilities: ["Read inbox & threads", "Auto-draft replies", "Urgent email radar"]
  },
  googlecalendar: {
    name: "googlecalendar",
    label: "Google Calendar",
    description: "Coordinate meetings, check schedule conflicts, create events, and generate Google Meet links.",
    icon: <Calendar className="size-5 text-blue-500" />,
    color: "border-blue-500/30 text-blue-400",
    accentBg: "bg-blue-500/10",
    capabilities: ["Daily agenda briefings", "Check conflicts", "Auto Meet links"]
  },
  googledocs: {
    name: "googledocs",
    label: "Google Docs",
    description: "Read workspace documentation, synthesize meeting notes, and extract project tasks.",
    icon: <FileText className="size-5 text-amber-500" />,
    color: "border-amber-500/30 text-amber-400",
    accentBg: "bg-amber-500/10",
    capabilities: ["Read documents", "Action item points", "Synthesize notes"]
  },
  slack: {
    name: "slack",
    label: "Slack",
    description: "Turn channel messages into prioritized to-do items and get urgent thread notifications.",
    icon: <MessageSquare className="size-5 text-purple-400" />,
    color: "border-purple-500/30 text-purple-400",
    accentBg: "bg-purple-500/10",
    capabilities: ["Messages to tasks", "Thread summaries", "Direct ping alerts"]
  },
  googlemeet: {
    name: "googlemeet",
    label: "Google Meet",
    description: "Generate video invites with instant conflict detection and summarize meeting notes.",
    icon: <Calendar className="size-5 text-emerald-400" />,
    color: "border-emerald-500/30 text-emerald-400",
    accentBg: "bg-emerald-500/10",
    capabilities: ["Auto Meet link", "Agenda drafting", "Attendee sync"]
  }
}

interface UpcomingTool {
  id: string
  name: string
  label: string
  description: string
  icon: React.ReactNode
  accentBg: string
  badge: string
  capabilities: string[]
}

const UPCOMING_TOOLS: UpcomingTool[] = [
  {
    id: "slack",
    name: "slack",
    label: "Slack",
    description: "Turn Slack mentions and threads into prioritized action items directly on WhatsApp.",
    icon: <MessageSquare className="size-5 text-purple-400" />,
    accentBg: "bg-purple-500/10",
    badge: "v1.3 Planned",
    capabilities: ["Channel to task", "Thread synthesis"]
  },
  {
    id: "notion",
    name: "notion",
    label: "Notion",
    description: "Sync database tasks and append meeting notes to company wikis and project boards.",
    icon: <FileText className="size-5 text-zinc-300" />,
    accentBg: "bg-zinc-800",
    badge: "v1.3 Planned",
    capabilities: ["Database sync", "Meeting notes push"]
  },
  {
    id: "telegram",
    name: "telegram",
    label: "Telegram",
    description: "Alternate chat gateway alongside WhatsApp for multi-platform reach and team bots.",
    icon: <Zap className="size-5 text-sky-400" />,
    accentBg: "bg-sky-500/10",
    badge: "v1.4 Planned",
    capabilities: ["Dual chat gateway", "Channel alerts"]
  },
  {
    id: "github",
    name: "github",
    label: "GitHub",
    description: "Receive high-priority PR review requests and manage repository issues via chat.",
    icon: <Plug className="size-5 text-emerald-400" />,
    accentBg: "bg-emerald-500/10",
    badge: "v1.4 Planned",
    capabilities: ["PR review alerts", "Issue tracking"]
  }
]

export default function IntegrationsPage() {
  const [available, setAvailable] = useState<AvailableTool[]>([])
  const [connected, setConnected] = useState<Tool[]>([])
  const [triggerStatus, setTriggerStatus] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"connected" | "available" | "upcoming" | "all">("all")

  const loadData = async () => {
    try {
      const [availRes, connRes, trigRes] = await Promise.all([
        api.getAvailableTools().catch(() => null),
        api.getConnectedTools().catch(() => null),
        api.getTriggerStatus().catch(() => null),
      ])

      if (availRes && availRes.ok) {
        const d = await availRes.json()
        setAvailable(d.toolkits || [])
      }
      if (connRes && connRes.ok) {
        const d = await connRes.json()
        setConnected(d.tools || [])
      }
      if (trigRes && trigRes.ok) {
        const d = await trigRes.json()
        setTriggerStatus(d.configured)
      }
    } catch {
      // fallback
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const isConnected = (toolkit: string) =>
    connected.some((t) => t.toolkit.toLowerCase() === toolkit.toLowerCase())

  const toggleConnection = async (toolkit: string) => {
    setLoading(toolkit)
    const currentlyConnected = isConnected(toolkit)

    try {
      if (currentlyConnected) {
        const res = await api.disconnectTool(toolkit)
        if (res.ok) {
          toast.success(`${toolkit} disconnected successfully`)
        } else {
          toast.error(`Failed to disconnect ${toolkit}`)
        }
      } else {
        const res = await api.connectTool(toolkit)
        if (res.ok) {
          const data = await res.json()
          if (data.redirect_url) {
            window.open(data.redirect_url, "_blank", "width=600,height=700")
            toast.info(`Opening OAuth window for ${toolkit}...`, {
              description: "Complete authorization in the popup window."
            })
          } else {
            toast.success(`${toolkit} connected!`)
          }
        } else {
          const data = await res.json()
          toast.error(data.detail || `Failed to connect ${toolkit}`)
        }
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(null)
      setTimeout(loadData, 2000)
    }
  }

  const setupTrigger = async () => {
    setLoading("trigger")
    try {
      const res = await api.setupGmailTrigger()
      if (res.ok) {
        setTriggerStatus(true)
        toast.success("Gmail Real-Time Webhook Activated!", {
          description: "Incoming emails will now trigger notifications on WhatsApp."
        })
      } else {
        toast.error("Failed to configure Gmail trigger. Please ensure Gmail is connected.")
      }
    } catch {
      toast.error("Error setting up trigger")
    } finally {
      setLoading(null)
    }
  }

  const query = searchQuery.toLowerCase().trim()

  // Filter tools across all three sections
  const matchesQuery = (name: string, label: string, desc: string, capabilities: string[]) => {
    if (!query) return true
    return (
      name.toLowerCase().includes(query) ||
      label.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query) ||
      capabilities.some((c) => c.toLowerCase().includes(query))
    )
  }

  // 1. Connected tools (from connected list + available matching meta)
  const connectedTools = available.filter((t) => {
    if (!isConnected(t.name)) return false
    const meta = KNOWN_TOOLS[t.name.toLowerCase()]
    const label = meta?.label || t.label || t.name
    const desc = meta?.description || ""
    const caps = meta?.capabilities || []
    return matchesQuery(t.name, label, desc, caps)
  })

  // 2. All Available tools
  const availableTools = available.filter((t) => {
    const meta = KNOWN_TOOLS[t.name.toLowerCase()]
    const label = meta?.label || t.label || t.name
    const desc = meta?.description || ""
    const caps = meta?.capabilities || []
    return matchesQuery(t.name, label, desc, caps)
  })

  // 3. Coming Soon tools
  const upcomingTools = UPCOMING_TOOLS.filter((t) => {
    return matchesQuery(t.name, t.label, t.description, t.capabilities)
  })

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to Overview
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Integrations & Toolkits</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Connect workspace tools to empower CPAA with autonomous reading, scheduling, and drafting.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="self-start sm:self-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Proactive Push Triggers Feature Card */}
      <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-card/50 to-background p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
              <Zap className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Gmail Real-Time Webhook Radar</h3>
                <Badge
                  variant="secondary"
                  className={
                    triggerStatus
                      ? "bg-emerald-500/20 text-emerald-400 text-[10px]"
                      : "bg-muted text-muted-foreground text-[10px]"
                  }
                >
                  {triggerStatus ? "Live & Monitoring" : "Standby"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Connects Google Cloud Pub/Sub to monitor incoming emails in real-time. CPAA detects high-urgency messages, extracts action items, and sends proactive WhatsApp alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <Switch
                checked={triggerStatus}
                onCheckedChange={setupTrigger}
                disabled={loading === "trigger" || triggerStatus}
              />
              <span className="text-xs font-semibold text-foreground">
                {triggerStatus ? "Active" : "Enable"}
              </span>
            </div>
            {loading === "trigger" && <Loader2 className="size-4 animate-spin text-primary" />}
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input covering all sections: Connected, All Available, Coming Soon */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search all tools across Connected, Available & Coming Soon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-10 text-xs sm:text-sm bg-muted/20 border-border/80 focus:bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Tabs: Connected BEFORE All Available */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              All Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("connected")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "connected"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>Connected</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
                {connectedTools.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "available"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>All Available</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
                {availableTools.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "upcoming"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>Coming Soon</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
                {upcomingTools.length}
              </span>
            </button>
          </div>
        </div>

        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            Filtering results for &ldquo;<span className="text-foreground font-semibold">{searchQuery}</span>&rdquo; across all sections
          </p>
        )}
      </div>

      {/* SECTIONS CONTAINER: Connected BEFORE All Available */}
      <div className="space-y-10">
        {/* SECTION 1: CONNECTED TOOLS (PUT BEFORE ALL AVAILABLE) */}
        {(activeTab === "all" || activeTab === "connected") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Connected Integrations
                </h2>
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
                  {connectedTools.length} Active
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Authorized with your account
              </span>
            </div>

            {connectedTools.length > 0 ? (
              /* 1 row with capacity for 4 tools display (square) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {connectedTools.map((tool) => {
                  const meta = KNOWN_TOOLS[tool.name.toLowerCase()] || {
                    name: tool.name,
                    label: tool.label || tool.name,
                    description: "Workspace integration for autonomous task execution.",
                    icon: <Plug className="size-5 text-primary" />,
                    color: "border-primary/30 text-primary",
                    accentBg: "bg-primary/10",
                    capabilities: ["Autonomous execution", "Context awareness"]
                  }

                  return (
                    <div
                      key={"connected-" + tool.name}
                      className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between aspect-square transition-all hover:border-emerald-500/50 shadow-sm"
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`size-10 rounded-xl ${meta.accentBg} flex items-center justify-center shrink-0`}>
                            {meta.icon}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px] font-medium"
                          >
                            <CheckCircle2 className="size-2.5 mr-1 text-emerald-400" />
                            Active
                          </Badge>
                        </div>

                        <h3 className="font-bold text-sm text-foreground truncate">{meta.label}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {meta.description}
                        </p>
                      </div>

                      {/* Middle Chips */}
                      <div className="py-2 space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {meta.capabilities.slice(0, 2).map((cap) => (
                            <span
                              key={cap}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground truncate"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 border-border/80"
                        onClick={() => toggleConnection(tool.name)}
                        disabled={loading === tool.name}
                      >
                        {loading === tool.name && <Loader2 className="mr-1.5 size-3 animate-spin" />}
                        Disconnect
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center space-y-2 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? "No connected tools match your search." : "No tools connected yet. Connect your preferred services below."}
                </p>
                {activeTab === "connected" && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setActiveTab("available")}
                    className="text-xs text-primary"
                  >
                    Browse all available tools →
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: ALL AVAILABLE TOOLS (AFTER CONNECTED) */}
        {(activeTab === "all" || activeTab === "available") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Plug className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  All Available Integrations
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  {availableTools.length} Toolkits
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                One-click OAuth 2.0 authorization
              </span>
            </div>

            {availableTools.length > 0 ? (
              /* 1 row with capacity for 4 tools display (square) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableTools.map((tool) => {
                  const meta = KNOWN_TOOLS[tool.name.toLowerCase()] || {
                    name: tool.name,
                    label: tool.label || tool.name,
                    description: "Workspace integration for autonomous task execution.",
                    icon: <Plug className="size-5 text-primary" />,
                    color: "border-primary/30 text-primary",
                    accentBg: "bg-primary/10",
                    capabilities: ["Autonomous execution", "Context awareness"]
                  }

                  const connectedStatus = isConnected(tool.name)

                  return (
                    <div
                      key={"available-" + tool.name}
                      className="glass-card rounded-2xl p-4 sm:p-5 border border-border/70 flex flex-col justify-between aspect-square transition-all hover:border-primary/40 shadow-sm"
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={`size-10 rounded-xl ${meta.accentBg} flex items-center justify-center shrink-0`}>
                            {meta.icon}
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              connectedStatus
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {connectedStatus ? "Connected" : "Available"}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-sm text-foreground truncate">{meta.label}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {meta.description}
                        </p>
                      </div>

                      {/* Middle Chips */}
                      <div className="py-2 space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {meta.capabilities.slice(0, 2).map((cap) => (
                            <span
                              key={cap}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground truncate"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <Button
                        variant={connectedStatus ? "outline" : "default"}
                        size="sm"
                        className={`w-full h-8 text-xs font-semibold ${
                          connectedStatus
                            ? "text-muted-foreground hover:text-destructive hover:border-destructive/40 border-border/80"
                            : "bg-primary text-primary-foreground shadow-sm"
                        }`}
                        onClick={() => toggleConnection(tool.name)}
                        disabled={loading === tool.name}
                      >
                        {loading === tool.name && <Loader2 className="mr-1.5 size-3 animate-spin" />}
                        {connectedStatus ? "Disconnect" : "Connect Tool"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center bg-muted/10">
                <p className="text-xs text-muted-foreground">No available integrations match your search.</p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: COMING SOON ROADMAP */}
        {(activeTab === "all" || activeTab === "upcoming") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-purple-400" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Coming Soon
                </h2>
                <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                  {upcomingTools.length} In Development
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Roadmap integrations
              </span>
            </div>

            {upcomingTools.length > 0 ? (
              /* 1 row with capacity for 4 tools display (square) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {upcomingTools.map((tool) => (
                  <div
                    key={"upcoming-" + tool.id}
                    className="rounded-2xl p-4 sm:p-5 border border-border/40 bg-card/30 flex flex-col justify-between aspect-square opacity-85 transition-all hover:opacity-100"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`size-10 rounded-xl ${tool.accentBg} flex items-center justify-center shrink-0`}>
                          {tool.icon}
                        </div>
                        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
                          {tool.badge}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-sm text-foreground truncate">{tool.label}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="py-2 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {tool.capabilities.slice(0, 2).map((cap) => (
                          <span
                            key={cap}
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground/80 truncate"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full h-8 text-xs font-medium border-border/50 text-muted-foreground cursor-not-allowed"
                    >
                      Coming Soon
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center bg-muted/10">
                <p className="text-xs text-muted-foreground">No roadmap tools match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-5 flex items-start gap-4">
        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-foreground">OAuth 2.0 Token Isolation & Revocation</h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            When you connect an integration, we securely negotiate short-lived access tokens directly with provider APIs. Your passwords are never shared, and you can revoke permissions anytime with a single click.
          </p>
        </div>
      </div>
    </div>
  )
}
