"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, LinkingStatus } from "@/lib/api"
import { MessageSquare, Plug, Brain, Mail, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const [linking, setLinking] = useState<LinkingStatus | null>(null)
  const [toolCount, setToolCount] = useState(0)
  const [memoryCount, setMemoryCount] = useState(0)
  const [triggerStatus, setTriggerStatus] = useState(false)

  useEffect(() => {
    api.getLinkingStatus().then(r => r.ok && r.json()).then(d => d && setLinking(d))
    api.getConnectedTools().then(r => r.ok && r.json()).then(d => d && setToolCount(d.tools?.length || 0))
    api.getMemories().then(r => r.ok && r.json()).then(d => d && setMemoryCount(d.count || 0))
    api.getTriggerStatus().then(r => r.ok && r.json()).then(d => d && setTriggerStatus(d.configured))
  }, [])

  const sections = [
    {
      title: "Get Started",
      items: [
        {
          icon: MessageSquare,
          title: "WhatsApp",
          description: linking?.linked 
            ? `Connected to ${linking.phone_number}` 
            : "Link your WhatsApp to chat with your agent",
          href: "/dashboard/whatsapp",
        },
        {
          icon: Plug,
          title: "Integrations",
          description: toolCount > 0 
            ? `${toolCount} tool${toolCount > 1 ? 's' : ''} connected` 
            : "Connect Gmail, Calendar, and more",
          href: "/dashboard/integrations",
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: Brain,
          title: "Memory",
          description: memoryCount > 0 
            ? `${memoryCount} memories stored` 
            : "View what your agent remembers",
          href: "/dashboard/memory",
        },
        {
          icon: Mail,
          title: "Email Notifications",
          description: triggerStatus 
            ? "Gmail trigger active" 
            : "Get notified about new emails",
          href: "/dashboard/integrations",
        },
      ],
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">{section.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
