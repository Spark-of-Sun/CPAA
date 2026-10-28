"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { api, User, LinkingStatus } from "@/lib/api"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare, Sparkles, ExternalLink, HelpCircle } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [linking, setLinking] = useState<LinkingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getMe(),
      api.getLinkingStatus().catch(() => null)
    ])
      .then(async ([meRes, linkRes]) => {
        if (meRes.ok) {
          const data = await meRes.json()
          setUser(data)
        } else {
          router.push("/")
        }

        if (linkRes && linkRes.ok) {
          const linkData = await linkRes.json()
          setLinking(linkData)
        }
      })
      .catch(() => {
        router.push("/")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [router])

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

  return (
    <SidebarProvider>
      <AppSidebar user={user} linking={linking} />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl transition-all">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4 bg-border/60" />
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium hidden sm:inline">CPAA</span>
              <span className="text-muted-foreground/40 hidden sm:inline">/</span>
              <span className="font-semibold text-foreground tracking-tight">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              <span>Agent Online</span>
            </div>

            {linking?.linked && (
              <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                <a
                  href={`https://wa.me/${linking.phone_number?.replace(/\+/g, '')}`}
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

            <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/">
                <HelpCircle className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Product Tour</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto px-4 py-8 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
