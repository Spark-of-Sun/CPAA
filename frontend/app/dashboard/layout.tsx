"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { api, User, LinkingStatus } from "@/lib/api"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { GuestProvider, GUEST_USER } from "@/contexts/guest-context"
import {
  Loader2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Eye,
  Lock,
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [linking, setLinking] = useState<LinkingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getMe().catch(() => null),
      api.getLinkingStatus().catch(() => null),
    ])
      .then(async ([meRes, linkRes]) => {
        if (meRes && meRes.ok) {
          const data = await meRes.json()
          setUser(data)
        } else {
          // Unauthenticated -> Fallback to Guest Mode (Fresh Account State)
          setUser(GUEST_USER)
        }

        if (linkRes && linkRes.ok) {
          const linkData = await linkRes.json()
          setLinking(linkData)
        } else {
          setLinking({ linked: false })
        }
      })
      .catch(() => {
        // Fallback to Guest Mode on error
        setUser(GUEST_USER)
        setLinking({ linked: false })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const getPageTitle = () => {
    if (pathname.includes("/whatsapp")) return "WhatsApp"
    if (pathname.includes("/integrations")) return "Integrations & Tools"
    if (pathname.includes("/memory")) return "Agent Memory Hub"
    return "Overview"
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="relative flex items-center justify-center">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="size-6 text-primary animate-pulse" />
          </div>
          <Loader2 className="absolute size-14 animate-spin text-primary/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing CPAA Session...</p>
      </div>
    )
  }

  const isGuest = !user || user.isGuest === true

  return (
    <GuestProvider initialUser={user}>
      <SidebarProvider>
        <AppSidebar user={user} linking={linking} />
        <SidebarInset className="bg-background flex flex-col min-h-screen">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-xl transition-all">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
              <Separator orientation="vertical" className="h-4 bg-border/60" />

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium hidden sm:inline">CPAA</span>
                <span className="text-muted-foreground/40 hidden sm:inline">/</span>
                <span className="font-semibold text-foreground tracking-tight">{getPageTitle()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Status Pill */}
              {isGuest ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400">
                  <Eye className="size-3" />
                  <span>Guest Mode</span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                  </span>
                  <span>Agent Online</span>
                </div>
              )}

              {linking?.linked && (
                <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                  <a
                    href={`https://wa.me/${linking.phone_number?.replace(/\+/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Open WhatsApp Chat"
                  >
                    <MessageSquare className="size-3.5" />
                    <span className="hidden md:inline">WhatsApp Chat</span>
                    <ExternalLink className="size-3 opacity-70" />
                  </a>
                </Button>
              )}

              {isGuest ? (
                <Button asChild size="sm" className="h-8 gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20">
                  <a href={api.login()}>
                    <Sparkles className="size-3.5" />
                    <span>Log In</span>
                  </a>
                </Button>
              ) : (
                <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/">
                    <HelpCircle className="size-4 mr-1.5" />
                    <span className="hidden sm:inline">Product Tour</span>
                  </Link>
                </Button>
              )}
            </div>
          </header>

          {/* Guest Mode Alert Banner */}
          {isGuest && (
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground text-center sm:text-left">
                <span className="size-1.5 rounded-full bg-amber-400 shrink-0 hidden sm:inline-block" />
                <span>
                  <strong className="text-foreground">Guest Mode:</strong> You can explore pages freely. Any sensitive action (linking WhatsApp, connecting tools, updating memory) requires signing in.
                </span>
              </div>
              <a
                href={api.login()}
                className="text-primary hover:text-primary/90 font-semibold text-[11px] flex items-center gap-1 shrink-0 hover:underline"
              >
                <Lock className="size-3" />
                <span>Log In with Auth0</span>
              </a>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto px-4 py-8 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </GuestProvider>
  )
}
