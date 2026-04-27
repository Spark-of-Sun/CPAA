"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, User } from "@/lib/api"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe().then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        router.push("/")
      }
      setLoading(false)
    }).catch(() => {
      router.push("/")
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <main className="flex-1 overflow-auto px-8 py-10 md:px-16 lg:px-24">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
