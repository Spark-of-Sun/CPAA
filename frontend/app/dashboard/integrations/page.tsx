"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api, AvailableTool, Tool } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Mail, Calendar, FileText, Plug, ExternalLink } from "lucide-react"

const toolIcons: Record<string, React.ReactNode> = {
  gmail: <Mail className="h-5 w-5" />,
  googlecalendar: <Calendar className="h-5 w-5" />,
  googledocs: <FileText className="h-5 w-5" />,
}

export default function IntegrationsPage() {
  const [available, setAvailable] = useState<AvailableTool[]>([])
  const [connected, setConnected] = useState<Tool[]>([])
  const [triggerStatus, setTriggerStatus] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [availRes, connRes, trigRes] = await Promise.all([
      api.getAvailableTools(),
      api.getConnectedTools(),
      api.getTriggerStatus(),
    ])
    if (availRes.ok) setAvailable((await availRes.json()).toolkits || [])
    if (connRes.ok) setConnected((await connRes.json()).tools || [])
    if (trigRes.ok) setTriggerStatus((await trigRes.json()).configured)
  }

  const isConnected = (toolkit: string) => connected.some((t) => t.toolkit === toolkit)

  const toggleConnection = async (toolkit: string) => {
    setLoading(toolkit)
    setError("")
    
    if (isConnected(toolkit)) {
      await api.disconnectTool(toolkit)
    } else {
      const res = await api.connectTool(toolkit)
      if (res.ok) {
        const data = await res.json()
        if (data.redirect_url) {
          window.open(data.redirect_url, "_blank", "width=600,height=700")
        }
      } else {
        const data = await res.json()
        setError(data.detail || "Failed to connect")
      }
    }
    
    setLoading(null)
    setTimeout(loadData, 2000)
  }

  const setupTrigger = async () => {
    setLoading("trigger")
    const res = await api.setupGmailTrigger()
    setLoading(null)
    if (res.ok) setTriggerStatus(true)
    else setError("Failed to setup trigger")
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect services to extend your agent's capabilities</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Separator className="my-6" />

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Notifications</h2>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Gmail notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about new emails via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={triggerStatus}
              onCheckedChange={setupTrigger}
              disabled={loading === "trigger" || triggerStatus}
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Connected accounts</h2>
          <div className="space-y-2">
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Loading...</p>
            ) : (
              available.map((tool) => (
                <div key={tool.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                      {toolIcons[tool.name.toLowerCase()] || <Plug className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{tool.label || tool.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected(tool.name) ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={isConnected(tool.name) ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleConnection(tool.name)}
                    disabled={loading === tool.name}
                  >
                    {loading === tool.name && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isConnected(tool.name) ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
