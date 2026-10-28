"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  Home,
  MessageSquare,
  Plug,
  Brain,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"

import { api, User, LinkingStatus } from "@/lib/api"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { 
    title: "Overview", 
    url: "/dashboard", 
    icon: Home,
    badge: null 
  },
  { 
    title: "WhatsApp", 
    url: "/dashboard/whatsapp", 
    icon: MessageSquare,
    badge: "Chat" 
  },
  { 
    title: "Integrations", 
    url: "/dashboard/integrations", 
    icon: Plug,
    badge: "Tools" 
  },
  { 
    title: "Agent Memory", 
    url: "/dashboard/memory", 
    icon: Brain,
    badge: "Vector" 
  },
]

export function AppSidebar({
  user,
  linking,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: User | null
  linking?: LinkingStatus | null
}) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar/95 backdrop-blur-md" {...props}>
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border/60 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/50 transition-colors">
              <Link href="/dashboard">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/20">
                  <Bot className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold tracking-tight text-foreground">CPAA</span>
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">Autonomous Copilot</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 px-3 mb-1">
            Agent Center
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-10 px-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <item.icon className="size-4" />
                          <span className="text-sm">{item.title}</span>
                        </div>
                        {item.title === "WhatsApp" && linking?.linked && (
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" title="WhatsApp Connected" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Proactive Agent Card Widget in Sidebar */}
        <div className="mt-auto px-2 pt-4">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Sparkles className="size-3.5 text-indigo-400" />
                Live Agent
              </span>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {linking?.linked 
                ? `Connected to ${linking.phone_number}`
                : "Link WhatsApp to enable voice and chat workflows."}
            </p>
            {linking?.linked ? (
              <a
                href={`https://wa.me/${linking.phone_number?.replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline pt-1"
              >
                Open WhatsApp <ExternalLink className="size-2.5" />
              </a>
            ) : (
              <Link
                href="/dashboard/whatsapp"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline pt-1"
              >
                Link WhatsApp Number <ChevronRight className="size-2.5" />
              </Link>
            )}
          </div>
        </div>
      </SidebarContent>

      {/* User Footer Profile */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors rounded-xl px-3"
                >
                  <Avatar className="size-8 rounded-lg border border-border/60">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                    <span className="truncate font-semibold text-foreground text-xs">{user?.name || "User"}</span>
                    <span className="truncate text-[11px] text-muted-foreground">{user?.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1 shadow-xl"
              >
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold leading-none">{user?.name}</p>
                    <p className="text-[11px] leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem asChild className="rounded-lg text-xs cursor-pointer">
                  <Link href="/dashboard/whatsapp" className="flex items-center">
                    <MessageSquare className="mr-2 size-3.5 text-emerald-500" />
                    WhatsApp Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg text-xs cursor-pointer">
                  <Link href="/dashboard/integrations" className="flex items-center">
                    <Plug className="mr-2 size-3.5 text-indigo-400" />
                    Manage Integrations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem asChild className="rounded-lg text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <a href={api.logout()} className="flex items-center">
                    <LogOut className="mr-2 size-3.5" />
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
