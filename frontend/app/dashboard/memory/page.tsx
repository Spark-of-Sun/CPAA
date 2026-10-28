"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, Memory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  RefreshCw,
  X
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
  const [memories, setMemories] = useState<Memory[]>([])
  const [search, setSearch] = useState("")
  const [newMemory, setNewMemory] = useState("")
  const [loading, setLoading] = useState(false)
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
        setMemories(data.memories || [])
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

  const handleSearch = async () => {
    if (!search.trim()) {
      loadMemories()
      return
    }
    setLoading(true)
    try {
      const res = await api.searchMemories(search)
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
        toast.info(`Found ${data.memories?.length || 0} matching memories`)
      }
    } catch {
      toast.error("Failed to perform semantic search")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMemory = async (contentToAdd?: string) => {
    const text = contentToAdd || newMemory
    if (!text.trim()) return

    setLoading(true)
    try {
      const res = await api.addMemory(text)
      if (res.ok) {
        toast.success("Memory saved to persistent knowledge base!", {
          description: "CPAA will now recall this during future tasks."
        })
        setNewMemory("")
        loadMemories()
      } else {
        toast.error("Failed to add memory")
      }
    } catch {
      toast.error("Error saving memory")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await api.deleteMemory(id)
      if (res.ok) {
        toast.success("Memory removed")
        loadMemories()
      } else {
        toast.error("Failed to delete memory")
      }
    } catch {
      toast.error("Error deleting memory")
    }
  }

  const handleClearAll = async () => {
    setLoading(true)
    try {
      const res = await api.clearMemories()
      if (res.ok) {
        toast.success("All memories cleared")
        setMemories([])
      } else {
        toast.error("Failed to clear memories")
      }
    } catch {
      toast.error("Error clearing memories")
    } finally {
      setLoading(false)
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
            {memories.length} Stored Vectors
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
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="e.g. Always keep email replies concise and polite. My manager is Sarah Chen. I take lunch from 1 PM to 2 PM."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Embedded using vector similarity search for instant context retrieval</span>
            </div>

            <Button
              onClick={() => handleAddMemory()}
              disabled={loading || !newMemory.trim()}
              className="bg-primary text-primary-foreground font-semibold px-5 shadow-sm"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
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
                onClick={() => setNewMemory(template)}
                className="text-left px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/80 text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5"
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
            <span className="text-xs text-muted-foreground">({memories.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {memories.length > 0 && (
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

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search memories by semantic topic or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 pr-9 text-sm"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("")
                  loadMemories()
                }}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={handleSearch} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>

        {/* Memory Items */}
        {memories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/20 p-12 text-center space-y-4">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
              <Brain className="size-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-base">No Memories Stored Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Your agent learns preferences automatically from your WhatsApp conversations, or you can add custom rules using the form above.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {memories.map((m) => {
              const textContent = m.memory || m.text || ""
              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-border/60 bg-card/40 p-4 hover:border-border transition-all flex items-start justify-between gap-4 group"
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
                      <span className="text-purple-400 font-mono text-[10px]">Vector Indexed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => copyText(textContent)}
                      title="Copy text"
                    >
                      <Copy className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
