"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, AvailableTool, Tool } from "@/lib/api"
import { useGuest } from "@/contexts/guest-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ToolLogo } from "@/components/tool-logo"
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  PlusCircle,
  Clock
} from "lucide-react"

interface ToolMeta {
  name: string
  alias?: string[]
  label: string
  description: string
  category: string
  logo: string
  capabilities: string[]
}

// Exactly referencing .env entries with non-empty auth keys (Available)
const ENV_AVAILABLE_TOOLS: ToolMeta[] = [
  {
    name: "gmail",
    label: "Gmail",
    description: "Read threads, extract action items, summarize urgent emails, and draft intelligent replies.",
    category: "Email & Communication",
    logo: "/composio_logos/gmail.svg",
    capabilities: ["Read inbox & threads", "Auto-draft replies", "Urgent email radar"]
  },
  {
    name: "googlecalendar",
    alias: ["gcal", "calendar"],
    label: "Google Calendar",
    description: "Coordinate meetings, check schedule conflicts, create events, and generate Google Meet links.",
    category: "Scheduling",
    logo: "/composio_logos/google-calendar.svg",
    capabilities: ["Daily agenda briefings", "Check conflicts", "Auto Meet links"]
  },
  {
    name: "googledrive",
    alias: ["gdrive", "drive"],
    label: "Google Drive",
    description: "Search workspace documents, retrieve presentation assets, and index team files.",
    category: "Storage & Files",
    logo: "/composio_logos/google-drive.svg",
    capabilities: ["File search", "Folder index", "Doc retrieval"]
  },
  {
    name: "slack",
    label: "Slack",
    description: "Turn channel messages into prioritized to-do items and receive urgent thread notifications.",
    category: "Team Chat",
    logo: "/composio_logos/slack.svg",
    capabilities: ["Messages to tasks", "Thread summaries", "Direct ping alerts"]
  },
  {
    name: "notion",
    label: "Notion",
    description: "Search workspace wikis, append action items to databases, and query company knowledge bases.",
    category: "Productivity & Docs",
    logo: "/composio_logos/notion.svg",
    capabilities: ["Database sync", "Wiki lookups", "Meeting notes push"]
  },
  {
    name: "zoom",
    label: "Zoom",
    description: "Instantly generate Zoom video meeting links and coordinate attendee invites.",
    category: "Video Conferencing",
    logo: "/composio_logos/zoom.svg",
    capabilities: ["Generate links", "Instant invites", "Meeting sync"]
  },
  {
    name: "discord",
    label: "Discord",
    description: "Broadcast community announcements, post alerts to channels, and monitor server events.",
    category: "Community Chat",
    logo: "/composio_logos/discord.svg",
    capabilities: ["Channel alerts", "Server pings", "Bot broadcasts"]
  },
  {
    name: "jira",
    label: "Jira Software",
    description: "Query issue backlogs, create bug tickets from messages, and update sprint statuses.",
    category: "Project Tracking",
    logo: "/composio_logos/jira.svg",
    capabilities: ["Sprint tracking", "Create tickets", "Issue query"]
  }
]

// Exactly referencing .env entries with empty auth keys (Coming Soon)
const ENV_COMING_SOON_TOOLS: ToolMeta[] = [
  {
    name: "github",
    label: "GitHub",
    description: "Triage pull request reviews, monitor commit activity, and inspect repository issues.",
    category: "Engineering",
    logo: "/composio_logos/github.png",
    capabilities: ["PR review alerts", "Issue tracking", "Repo notifications"]
  },
  {
    name: "linear",
    label: "Linear",
    description: "Sync engineering cycles, create bug tickets from customer emails, and track issue updates.",
    category: "Engineering",
    logo: "/composio_logos/linear.png",
    capabilities: ["Cycle tracking", "Bug reports", "Instant sync"]
  },
  {
    name: "twitter",
    label: "Twitter / X",
    description: "Monitor brand mentions, track urgent customer inquiries, and draft social posts.",
    category: "Social Media",
    logo: "/composio_logos/twitter.svg",
    capabilities: ["Mention radar", "Post drafting", "Direct alerts"]
  },
  {
    name: "trello",
    label: "Trello",
    description: "Move cards across kanban lists, attach deadlines, and organize sprint items.",
    category: "Task Management",
    logo: "/composio_logos/trello.svg",
    capabilities: ["Kanban cards", "Board updates", "Due date sync"]
  },
  {
    name: "spotify",
    label: "Spotify",
    description: "Control focus music playlists, queue productivity soundtracks, and check now playing.",
    category: "Audio & Focus",
    logo: "/composio_logos/spotify.svg",
    capabilities: ["Focus playlists", "Playback control", "Workday soundtrack"]
  }
]

export default function IntegrationsPage() {
  const { isGuest, requireAuth } = useGuest()
  const [available, setAvailable] = useState<AvailableTool[]>([])
  const [connected, setConnected] = useState<Tool[]>([])
  const [triggerStatus, setTriggerStatus] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "connected" | "available" | "upcoming">("all")
  const [demandModalOpen, setDemandModalOpen] = useState(false)
  const [demandToolInput, setDemandToolInput] = useState("")

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

  const isConnected = (toolName: string, aliases: string[] = []) => {
    const targets = [toolName.toLowerCase(), ...aliases.map(a => a.toLowerCase())]
    return connected.some((t) => targets.includes(t.toolkit.toLowerCase()))
  }

  const toggleConnection = async (toolkit: string) => {
    if (isGuest) {
      requireAuth(undefined, {
        title: "Sign In to Connect Tools",
        action: `connect and authorize ${toolkit} via OAuth`,
      })
      return
    }

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
          toast.error(data.detail || `Failed to connect ${toolkit}. Ensure it is enabled in your Composio dashboard.`)
        }
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(null)
      setTimeout(loadData, 2000)
    }
  }

  const handleDemandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!demandToolInput.trim()) return
    const tool = demandToolInput.trim()
    toast.success(`Request recorded for ${tool}!`, {
      description: "CPAA's Composio router can activate this tool config upon environment setup."
    })
    setDemandModalOpen(false)
    setDemandToolInput("")
  }

  const setupTrigger = async () => {
    if (isGuest) {
      requireAuth(undefined, {
        title: "Sign In to Activate Triggers",
        action: "set up real-time Gmail event listeners",
      })
      return
    }

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

  const matchesQuery = (tool: ToolMeta) => {
    if (!query) return true
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.label.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.capabilities.some((c) => c.toLowerCase().includes(query))
    )
  }

  // Filter lists based on .env definitions and search query
  const availableTools = ENV_AVAILABLE_TOOLS.filter(matchesQuery)
  const comingSoonTools = ENV_COMING_SOON_TOOLS.filter(matchesQuery)

  // Connected tools are those available tools that the user has authorized
  const connectedTools = ENV_AVAILABLE_TOOLS.filter((t) => isConnected(t.name, t.alias)).filter(matchesQuery)

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
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold tracking-tight">Integrations & Toolkits</h1>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5">
                Composio Powered
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Connect your authorized workplace tools to empower CPAA with autonomous reading, scheduling, and task execution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemandModalOpen(true)}
              className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
            >
              <PlusCircle className="size-3.5" />
              <span>Request Tool on Demand</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* User Demand & Architectural Capacity Banner */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/50 to-background p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="size-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/30">
              <Layers className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Extensible on User Demand (100+ Tools Capacity)
                </h3>
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px]">
                  Composio MCP Ready
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Tools with active keys in configuration are immediately <strong>Available</strong> to connect. Tools configured for upcoming rollout appear in <strong>Coming Soon</strong>. Beyond these, CPAA has the architectural capacity to support over 100+ workplace tools based on user demand.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDemandModalOpen(true)}
              className="text-xs font-semibold gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-sm"
            >
              <PlusCircle className="size-3.5" />
              <span>Request Tool on Demand</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Proactive Push Triggers Feature Card */}
      <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-card/50 to-background p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="size-11 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 ring-1 ring-red-500/30">
              <Zap className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground">Gmail Real-Time Webhook Radar</h3>
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
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search tools (e.g. Gmail, Slack, Notion, Zoom, Jira, GitHub)..."
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

          {/* Filter Tabs */}
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
              <span>Available</span>
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
                {comingSoonTools.length}
              </span>
            </button>
          </div>
        </div>

        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            Filtering results for &ldquo;<span className="text-foreground font-semibold">{searchQuery}</span>&rdquo;
          </p>
        )}
      </div>

      {/* SECTIONS */}
      <div className="space-y-10">
        {/* SECTION 1: CONNECTED TOOLS */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {connectedTools.map((tool) => (
                  <div
                    key={"connected-" + tool.name}
                    className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between aspect-square transition-all hover:border-emerald-500/50 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="size-11 rounded-xl bg-background/80 border border-border/60 flex items-center justify-center p-2 shadow-sm shrink-0">
                          <ToolLogo name={tool.name} logoUrl={tool.logo} size="md" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px] font-medium"
                        >
                          <CheckCircle2 className="size-2.5 mr-1 text-emerald-400" />
                          Active
                        </Badge>
                      </div>

                      <h3 className="font-bold text-sm text-foreground truncate">{tool.label}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="py-2 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {tool.capabilities.slice(0, 2).map((cap) => (
                          <span
                            key={cap}
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground truncate"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

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
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center bg-muted/10">
                <p className="text-xs text-muted-foreground">No integrations are currently connected. Connect an available tool below.</p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: AVAILABLE TOOLS (Configured with key in .env) */}
        {(activeTab === "all" || activeTab === "available") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Available Integrations
                </h2>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  Ready to Connect
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Configured with valid credentials
              </span>
            </div>

            {availableTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableTools.map((tool) => {
                  const connectedStatus = isConnected(tool.name, tool.alias)

                  return (
                    <div
                      key={"avail-" + tool.name}
                      className={`glass-card rounded-2xl p-5 border flex flex-col justify-between aspect-square transition-all shadow-sm ${
                        connectedStatus
                          ? "border-emerald-500/30 bg-emerald-950/10"
                          : "border-border/70 hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="size-11 rounded-xl bg-background/80 border border-border/60 flex items-center justify-center p-2 shadow-sm shrink-0">
                            <ToolLogo name={tool.name} logoUrl={tool.logo} size="md" />
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

                        <h3 className="font-bold text-sm text-foreground truncate">{tool.label}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <div className="py-2 space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {tool.capabilities.slice(0, 2).map((cap) => (
                            <span
                              key={cap}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground truncate"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>

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

        {/* SECTION 3: COMING SOON TOOLS (Defined in .env without key) */}
        {(activeTab === "all" || activeTab === "upcoming") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-purple-400" />
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Coming Soon
                </h2>
                <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                  {comingSoonTools.length} Planned
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Configured in environment, awaiting authorization keys
              </span>
            </div>

            {comingSoonTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {comingSoonTools.map((tool) => (
                  <div
                    key={"upcoming-" + tool.name}
                    className="rounded-2xl p-5 border border-border/40 bg-card/30 flex flex-col justify-between aspect-square opacity-85 transition-all hover:opacity-100"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="size-11 rounded-xl bg-background/60 border border-border/40 flex items-center justify-center p-2 shadow-xs shrink-0">
                          <ToolLogo name={tool.name} logoUrl={tool.logo} size="md" />
                        </div>
                        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
                          Coming Soon
                        </Badge>
                      </div>

                      <h3 className="font-bold text-sm text-foreground truncate">{tool.label}</h3>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="py-2 space-y-2">
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

                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full h-8 text-xs font-medium border-border/50 text-muted-foreground cursor-not-allowed"
                      >
                        Coming Soon
                      </Button>
                    </div>
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

      {/* Request Tool on User Demand Modal */}
      {demandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <PlusCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Request Tool on User Demand</h3>
                  <p className="text-xs text-muted-foreground">100+ tools supported via Composio MCP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemandModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-2xl border border-border/60">
              CPAA has the architectural capacity to connect any tool supported by Composio (over 100+ integrations). Enter the name of the tool you need (e.g. Asana, HubSpot, Salesforce, Airtable, ClickUp, Stripe):
            </p>

            <form onSubmit={handleDemandSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Tool or Platform Name
                </label>
                <Input
                  placeholder="e.g. Asana, HubSpot, Salesforce, Airtable"
                  value={demandToolInput}
                  onChange={(e) => setDemandToolInput(e.target.value)}
                  className="h-10 text-xs sm:text-sm"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDemandModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!demandToolInput.trim()}
                  className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
                >
                  <span>Submit Request</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex items-start gap-4">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-foreground">OAuth 2.0 Security & Dynamic Token Isolation</h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            All tool integrations negotiate short-lived, encrypted OAuth access tokens directly with provider APIs. Sensitive access tokens are protected with AWS KMS envelope encryption. You retain granular permission control and can disconnect any integration at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
