"use client"

import React, { useState } from "react"
import { Plug } from "lucide-react"

// Curated map of common toolkit identifiers to exact files in /composio_logos/
export const TOOL_LOGO_MAP: Record<string, string> = {
  // Core Google
  gmail: "/composio_logos/gmail.svg",
  googlecalendar: "/composio_logos/google-calendar.svg",
  calendar: "/composio_logos/google-calendar.svg",
  gcal: "/composio_logos/google-calendar.svg",
  googledocs: "/composio_logos/google-docs.svg",
  docs: "/composio_logos/google-docs.svg",
  googlesheets: "/composio_logos/google-sheets.svg",
  sheets: "/composio_logos/google-sheets.svg",
  googledrive: "/composio_logos/google-drive.svg",
  drive: "/composio_logos/google-drive.svg",
  gdrive: "/composio_logos/google-drive.svg",
  googlemeet: "/composio_logos/google-meet.webp",
  meet: "/composio_logos/google-meet.webp",
  googletasks: "/composio_logos/google-tasks.png",
  tasks: "/composio_logos/google-tasks.png",

  // Communication & Chat
  slack: "/composio_logos/slack.svg",
  discord: "/composio_logos/discord.svg",
  zoom: "/composio_logos/zoom.svg",
  telegram: "/composio_logos/telegram-logo.svg",
  teams: "/composio_logos/microsoft-teams.svg",
  microsoftteams: "/composio_logos/microsoft-teams.svg",
  intercom: "/composio_logos/intercom.svg",
  twitter: "/composio_logos/twitter.svg",
  spotify: "/composio_logos/spotify.svg",

  // Developer & Engineering
  github: "/composio_logos/github.png",
  gitlab: "/composio_logos/gitlab.svg",
  jira: "/composio_logos/jira.svg",
  linear: "/composio_logos/linear.png",
  sentry: "/composio_logos/sentry.svg",

  // Project Management & Productivity
  notion: "/composio_logos/notion.svg",
  trello: "/composio_logos/trello.svg",
  asana: "/composio_logos/asana.png",
  clickup: "/composio_logos/clickup.png",
  monday: "/composio_logos/monday.png",
  todoist: "/composio_logos/todoist.svg",
  airtable: "/composio_logos/airtable.svg",

  // CRM, Sales & Operations
  hubspot: "/composio_logos/hubspot.webp",
  salesforce: "/composio_logos/salesforce.svg",
  zendesk: "/composio_logos/zendesk.svg",
  pipedrive: "/composio_logos/pipedrive.svg",
  stripe: "/composio_logos/stripe.svg",
  shopify: "/composio_logos/shopify.svg",

  // Storage & Microsoft Office
  dropbox: "/composio_logos/dropbox.svg",
  onedrive: "/composio_logos/one-drive.svg",
  outlook: "/composio_logos/Outlook SVG Icon.svg",
  excel: "/composio_logos/Excel.png",
}

interface ToolLogoProps {
  name: string
  logoUrl?: string
  alt?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackIcon?: React.ReactNode
}

const SIZE_CLASSES = {
  xs: "size-4",
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
}

export function ToolLogo({
  name,
  logoUrl,
  alt,
  size = "md",
  className = "",
  fallbackIcon,
}: ToolLogoProps) {
  const [hasError, setHasError] = useState(false)
  const normalizedKey = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const resolvedSrc = logoUrl || TOOL_LOGO_MAP[normalizedKey] || `/composio_logos/${name.toLowerCase()}.svg`

  if (hasError || !resolvedSrc) {
    if (fallbackIcon) {
      return <>{fallbackIcon}</>
    }
    return (
      <div
        className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-md bg-muted text-muted-foreground ${className}`}
      >
        <Plug className="size-3.5" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt || `${name} logo`}
      className={`${SIZE_CLASSES[size]} object-contain shrink-0 transition-transform ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}
