"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, Memory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Search, Trash2, Loader2, MoreHorizontal } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [search, setSearch] = useState("")
  const [newMemory, setNewMemory] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    const res = await api.getMemories()
    if (res.ok) {
      const data = await res.json()
      setMemories(data.memories || [])
    }
  }

  const searchMemories = async () => {
    if (!search.trim()) {
      loadMemories()
      return
    }
    setLoading(true)
    const res = await api.searchMemories(search)
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setMemories(data.memories || [])
    }
  }

  const addMemory = async () => {
    if (!newMemory.trim()) return
    setLoading(true)
    setError("")
    const res = await api.addMemory(newMemory)
    setLoading(false)
    if (res.ok) {
      setNewMemory("")
      loadMemories()
    } else {
      setError("Failed to add memory")
    }
  }

  const deleteMemory = async (id: string) => {
    await api.deleteMemory(id)
    loadMemories()
  }

  const clearAll = async () => {
    setLoading(true)
    await api.clearMemories()
    setLoading(false)
    setMemories([])
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
        <p className="text-muted-foreground">View and manage what your AI agent remembers</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Separator className="my-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Add memory</Label>
          <Textarea
            placeholder="e.g., My favorite color is blue, I prefer morning meetings..."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            rows={2}
          />
          <Button onClick={addMemory} disabled={loading || !newMemory.trim()} size="sm">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Stored memories ({memories.length})</Label>
            {memories.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Clear all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all memories?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all stored memories. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAll}>Delete all</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMemories()}
            />
            <Button variant="outline" size="icon" onClick={searchMemories}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No memories yet. Your agent learns from conversations.
            </p>
          ) : (
            <div className="rounded-lg border divide-y">
              {memories.map((memory) => (
                <div key={memory.id} className="flex items-start justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{memory.memory || memory.text}</p>
                    {memory.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteMemory(memory.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
