"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { api, Memory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Search,
  Trash2,
  Loader2,
  Brain,
  Sparkles,
  Plus,
  Copy,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Zap
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MemoryPage() {
  const [allMemories, setAllMemories] = useState<Memory[]>([])
  const [search, setSearch] = useState("")
  const [newMemory, setNewMemory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false)
  const [semanticExtraResults, setSemanticExtraResults] = useState<Memory[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const starterTemplates = [
    "I prefer 30-minute meetings over 1-hour meetings whenever possible.",
    "Always format email summaries with bullet points and action items at the top.",
    "My primary working hours are 9:30 AM to 6:30 PM. Flag meetings outside this window.",
    "Do not schedule meetings on Friday afternoons reserved for deep work.",
  ]

  const loadMemories = async () => {
    try {
      const res = await api.getMemories()
      if (res.ok) {
        const data = await res.json()
        setAllMemories(data.memories || [])
      }
    } catch {
      // fallback
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    loadMemories()
  }, [])

  // Instant 0ms live keyword matching as the user types
  const displayedMemories = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return allMemories

    const localMatches = allMemories.filter((m) => {
      const text = (m.memory || m.text || "").toLowerCase()
      return text.includes(query)
    })

    // Merge any additional matches discovered by semantic search
    if (semanticExtraResults.length > 0) {
      const localIds = new Set(localMatches.map((m) => m.id))
      const extra = semanticExtraResults.filter((m) => !localIds.has(m.id))
      return [...localMatches, ...extra]
    }

    return localMatches
  }, [allMemories, search, semanticExtraResults])

  // Deep Semantic Search (on demand or on Enter)
  const handleSemanticSearch = async () => {
    const query = search.trim()
    if (!query) {
      setSemanticExtraResults([])
      return
    }

    setIsSearchingSemantic(true)
    try {
      const res = await api.searchMemories(query)
      if (res.ok) {
        const data = await res.json()
        const remoteResults: Memory[] = data.memories || []
        setSemanticExtraResults(remoteResults)
        toast.info(`Semantic search found ${remoteResults.length} relevant vector matches`)
      }
    } catch {
      toast.error("Semantic search failed to connect")
    } finally {
      setIsSearchingSemantic(false)
    }
  }

  // Instant Optimistic Add (0ms UI latency)
  const handleAddMemory = async (contentToAdd?: string) => {
    const text = (contentToAdd || newMemory).trim()
    if (!text) return

    const tempId = `temp-${Date.now()}`
    const optimisticMemory: Memory = {
      id: tempId,
      memory: text,
      text: text,
      created_at: new Date().toISOString()
    }

    // 1. Immediately reflect in UI
    setAllMemories((prev) => [optimisticMemory, ...prev])
    setNewMemory("")
    toast.success("Memory saved!", {
      description: "Indexed for instant recall during WhatsApp tasks."
    })

    // 2. Persist in background
    setIsSubmitting(true)
    try {
      const res = await api.addMemory(text)
      if (res.ok) {
        const data = await res.json()
        const realId = data?.result?.results?.[0]?.id || data?.result?.id
        if (realId) {
          setAllMemories((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: realId } : m))
          )
        }
      } else {
        // Rollback on failure
        setAllMemories((prev) => prev.filter((m) => m.id !== tempId))
        toast.error("Failed to persist memory to server")
      }
    } catch {
      setAllMemories((prev) => prev.filter((m) => m.id !== tempId))
      toast.error("Network error while saving memory")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Instant Optimistic Delete (0ms UI latency)
  const handleDeleteMemory = async (id: string) => {
    const itemToDelete = allMemories.find((m) => m.id === id)
    setAllMemories((prev) => prev.filter((m) => m.id !== id))
    toast.success("Memory removed")

    try {
      const res = await api.deleteMemory(id)
      if (!res.ok && itemToDelete) {
        setAllMemories((prev) => [itemToDelete, ...prev])
        toast.error("Failed to delete memory on server")
      }
    } catch {
      if (itemToDelete) {
        setAllMemories((prev) => [itemToDelete, ...prev])
      }
      toast.error("Network error deleting memory")
    }
  }

  // Clear all memories
  const handleClearAll = async () => {
    const backup = [...allMemories]
    setAllMemories([])
    toast.success("All memories cleared")

    try {
      const res = await api.clearMemories()
      if (!res.ok) {
        setAllMemories(backup)
        toast.error("Failed to clear memories on server")
      }
    } catch {
      setAllMemories(backup)
      toast.error("Error clearing memories on server")
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Top Heading */}
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
            <h1 className="text-3xl font-extrabold tracking-tight">Agent Long-Term Memory</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Semantic knowledge repository. CPAA references this memory bank during every WhatsApp and email workflow.
            </p>
          </div>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 px-3 py-1 text-xs self-start sm:self-auto">
            <Brain className="size-3.5 mr-1.5" />
            {allMemories.length} Stored Vectors
          </Badge>
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Add Memory Card */}
      <div className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Teach Your Agent New Context</h3>
              <p className="text-xs text-muted-foreground">Add working habits, communication preferences, or guidelines.</p>
            </div>
          </div>
          {isSubmitting && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-md">
              <Loader2 className="size-3 animate-spin text-purple-400" />
              Syncing vector...
            </span>
          )}
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="e.g. Always keep email replies concise and polite. My manager is Sarah Chen. I take lunch from 1 PM to 2 PM."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAddMemory()
              }
            }}
            rows={3}
            className="resize-none text-sm"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Instant optimistic memory caching with vector embedding</span>
            </div>

            <Button
              onClick={() => handleAddMemory()}
              disabled={!newMemory.trim()}
              className="bg-primary text-primary-foreground font-semibold px-5 shadow-sm active:scale-95 duration-75 cursor-pointer"
            >
              <Plus className="size-4 mr-1.5" />
              Store Memory
            </Button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-border/40 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Popular Rule Templates (Click to Add):
          </p>
          <div className="flex flex-wrap gap-2">
            {starterTemplates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddMemory(template)}
                title="Click to instantly save this rule"
                className="text-left px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/80 text-xs text-muted-foreground hover:text-foreground transition-all duration-75 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="size-3 text-primary shrink-0" />
                <span className="truncate max-w-xs">{template}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Search & List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-foreground">Stored Memories</h3>
            <span className="text-xs text-muted-foreground font-mono">
              ({displayedMemories.length} of {allMemories.length})
            </span>
            {search.trim() && (
              <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-400">
                Live Filtered
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {allMemories.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-3.5 mr-1" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all stored memories?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove all learned context and preferences. This action cannot be reversed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete All Memories
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Search Bar with Instant 0ms Filter + Semantic Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search memories instantly (types immediately or press Enter for AI search)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSemanticExtraResults([])
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSemanticSearch()}
              className="pl-9 pr-9 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setSemanticExtraResults([])
                }}
                title="Clear search"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleSemanticSearch}
            disabled={isSearchingSemantic || !search.trim()}
            title="Perform deep vector similarity search"
            className="gap-1.5 active:scale-95 duration-75 cursor-pointer"
          >
            {isSearchingSemantic ? (
              <Loader2 className="size-4 animate-spin text-purple-400" />
            ) : (
              <Sparkles className="size-4 text-purple-400" />
            )}
            <span className="hidden sm:inline">AI Semantic Search</span>
          </Button>
        </div>

        {/* Memory Items */}
        {displayedMemories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/20 p-12 text-center space-y-4">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
              <Brain className="size-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-base">
                {search.trim() ? "No Memories Matching Your Search" : "No Memories Stored Yet"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {search.trim()
                  ? "Try searching for a different keyword or click 'AI Semantic Search' for vector similarity."
                  : "Your agent learns preferences automatically from your WhatsApp conversations, or you can add custom rules using the form above."}
              </p>
              {search.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("")
                    setSemanticExtraResults([])
                  }}
                  className="mt-3 text-xs"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {displayedMemories.map((m) => {
              const textContent = m.memory || m.text || ""
              const isOptimistic = m.id.startsWith("temp-")
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border border-border/60 bg-card/40 p-4 hover:border-border transition-all duration-75 flex items-start justify-between gap-4 group ${
                    isOptimistic ? "border-purple-500/40 bg-purple-500/5" : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {textContent}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {m.created_at
                          ? new Date(m.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "Saved Rule"}
                      </span>
                      <span>•</span>
                      {isOptimistic ? (
                        <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1">
                          <Zap className="size-3" /> Instant Local Index
                        </span>
                      ) : (
                        <span className="text-purple-400 font-mono text-[10px]">Vector Indexed</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground active:scale-90"
                      onClick={() => copyText(textContent)}
                      title="Copy text"
                    >
                      <Copy className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90"
                      onClick={() => handleDeleteMemory(m.id)}
                      title="Delete memory"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
