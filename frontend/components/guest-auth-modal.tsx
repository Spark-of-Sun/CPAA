"use client"

import React from "react"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Plug,
  Brain,
  CheckCircle2,
} from "lucide-react"

interface GuestAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  action?: string
}

export function GuestAuthModal({
  open,
  onOpenChange,
  title = "Authentication Required",
  description,
  action,
}: GuestAuthModalProps) {
  const loginUrl = api.login()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Lock className="size-5 text-indigo-400" />
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs px-2.5 py-0.5">
              Guest Mode
            </Badge>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description || (
              <>
                You are currently exploring CPAA in <span className="font-semibold text-foreground">Guest Mode</span>.
                {action ? ` To ${action}, ` : " To perform sensitive operations and connect live accounts, "}
                please sign in or create a free account.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights */}
        <div className="my-2 space-y-2.5 rounded-xl border border-border/50 bg-muted/20 p-3.5 text-xs">
          <div className="flex items-center gap-2.5 text-foreground/90 font-medium">
            <MessageSquare className="size-4 text-emerald-400 shrink-0" />
            <span>Link WhatsApp to chat with your autonomous agent</span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground/90 font-medium">
            <Plug className="size-4 text-indigo-400 shrink-0" />
            <span>Authorize live tools (Gmail, Calendar, Slack)</span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground/90 font-medium">
            <Brain className="size-4 text-purple-400 shrink-0" />
            <span>Save semantic memories & custom execution rules</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted-foreground text-[11px] pt-1 border-t border-border/40">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span>Enterprise-grade isolation & AES-256 KMS security</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            asChild
            className="w-full sm:flex-1 h-10 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-indigo-500/20"
          >
            <a href={loginUrl} className="flex items-center justify-center gap-2">
              <Sparkles className="size-4" />
              <span>Log In / Sign Up</span>
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-10 border-border/70 hover:bg-muted/40 text-xs font-medium"
          >
            Keep Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
