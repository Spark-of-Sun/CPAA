"use client"

import { useEffect, useState } from "react"
import { api, LinkingStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { toast } from "sonner"
import {
  Loader2,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  Copy,
  Sparkles,
  AlertTriangle,
  Search,
  ChevronDown,
  Info
} from "lucide-react"
import Link from "next/link"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

const COUNTRIES: Country[] = [
  { name: "India", code: "IN", dialCode: "91", flag: "🇮🇳" },
  { name: "United States", code: "US", dialCode: "1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "44", flag: "🇬🇧" },
  { name: "Canada", code: "CA", dialCode: "1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "61", flag: "🇦🇺" },
  { name: "Germany", code: "DE", dialCode: "49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "33", flag: "🇫🇷" },
  { name: "United Arab Emirates", code: "AE", dialCode: "971", flag: "🇦🇪" },
  { name: "Singapore", code: "SG", dialCode: "65", flag: "🇸🇬" },
  { name: "Saudi Arabia", code: "SA", dialCode: "966", flag: "🇸🇦" },
  { name: "Japan", code: "JP", dialCode: "81", flag: "🇯🇵" },
  { name: "Brazil", code: "BR", dialCode: "55", flag: "🇧🇷" },
  { name: "Mexico", code: "MX", dialCode: "52", flag: "🇲🇽" },
  { name: "Spain", code: "ES", dialCode: "34", flag: "🇪🇸" },
  { name: "Italy", code: "IT", dialCode: "39", flag: "🇮🇹" },
  { name: "Netherlands", code: "NL", dialCode: "31", flag: "🇳🇱" },
  { name: "Switzerland", code: "CH", dialCode: "41", flag: "🇨🇭" },
  { name: "Sweden", code: "SE", dialCode: "46", flag: "🇸🇪" },
  { name: "Norway", code: "NO", dialCode: "47", flag: "🇳🇴" },
  { name: "Denmark", code: "DK", dialCode: "45", flag: "🇩🇰" },
  { name: "Ireland", code: "IE", dialCode: "353", flag: "🇮🇪" },
  { name: "New Zealand", code: "NZ", dialCode: "64", flag: "🇳🇿" },
  { name: "South Africa", code: "ZA", dialCode: "27", flag: "🇿🇦" },
  { name: "Nigeria", code: "NG", dialCode: "234", flag: "🇳🇬" },
  { name: "Kenya", code: "KE", dialCode: "254", flag: "🇰🇪" },
  { name: "Egypt", code: "EG", dialCode: "20", flag: "🇪🇬" },
  { name: "Turkey", code: "TR", dialCode: "90", flag: "🇹🇷" },
  { name: "Pakistan", code: "PK", dialCode: "92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "BD", dialCode: "880", flag: "🇧🇩" },
  { name: "Indonesia", code: "ID", dialCode: "62", flag: "🇮🇩" },
  { name: "Malaysia", code: "MY", dialCode: "60", flag: "🇲🇾" },
  { name: "Philippines", code: "PH", dialCode: "63", flag: "🇵🇭" },
  { name: "Vietnam", code: "VN", dialCode: "84", flag: "🇻🇳" },
  { name: "Thailand", code: "TH", dialCode: "66", flag: "🇹🇭" },
  { name: "South Korea", code: "KR", dialCode: "82", flag: "🇰🇷" },
  { name: "China", code: "CN", dialCode: "86", flag: "🇨🇳" },
  { name: "Hong Kong", code: "HK", dialCode: "852", flag: "🇭🇰" },
  { name: "Taiwan", code: "TW", dialCode: "886", flag: "🇹🇼" },
  { name: "Israel", code: "IL", dialCode: "972", flag: "🇮🇱" },
  { name: "Qatar", code: "QA", dialCode: "974", flag: "🇶🇦" },
  { name: "Kuwait", code: "KW", dialCode: "965", flag: "🇰🇼" },
  { name: "Oman", code: "OM", dialCode: "968", flag: "🇴🇲" },
  { name: "Bahrain", code: "BH", dialCode: "973", flag: "🇧🇭" },
  { name: "Argentina", code: "AR", dialCode: "54", flag: "🇦🇷" },
  { name: "Chile", code: "CL", dialCode: "56", flag: "🇨🇱" },
  { name: "Colombia", code: "CO", dialCode: "57", flag: "🇨🇴" },
  { name: "Poland", code: "PL", dialCode: "48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dialCode: "351", flag: "🇵🇹" },
  { name: "Belgium", code: "BE", dialCode: "32", flag: "🇧🇪" },
  { name: "Austria", code: "AT", dialCode: "43", flag: "🇦🇹" },
  { name: "Finland", code: "FI", dialCode: "358", flag: "🇫🇮" },
  { name: "Greece", code: "GR", dialCode: "30", flag: "🇬🇷" },
  { name: "Czech Republic", code: "CZ", dialCode: "420", flag: "🇨🇿" },
  { name: "Sri Lanka", code: "LK", dialCode: "94", flag: "🇱🇰" },
  { name: "Nepal", code: "NP", dialCode: "977", flag: "🇳🇵" },
]

export default function WhatsAppPage() {
  const [status, setStatus] = useState<LinkingStatus | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const [localPhone, setLocalPhone] = useState("")
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [fullPhone, setFullPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    loadStatus()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const loadStatus = async () => {
    try {
      const res = await api.getLinkingStatus()
      if (res.ok) {
        setStatus(await res.json())
      }
    } catch {
      // fallback
    } finally {
      setPageLoading(false)
    }
  }

  const computeFullPhone = () => {
    const cleanDigits = localPhone.replace(/[^0-9]/g, "")
    if (!cleanDigits) return ""
    // If the entered number already starts with the dial code, don't duplicate it
    if (cleanDigits.startsWith(selectedCountry.dialCode) && cleanDigits.length > selectedCountry.dialCode.length + 6) {
      return cleanDigits
    }
    return `${selectedCountry.dialCode}${cleanDigits}`
  }

  const sendOTP = async () => {
    const cleanPhone = computeFullPhone()
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error("Please enter a valid phone number")
      return
    }

    setLoading(true)
    try {
      const res = await api.sendOTP(cleanPhone)
      if (res.ok) {
        setFullPhone(cleanPhone)
        setStep("otp")
        setResendCooldown(60)
        toast.success("Verification code sent!", {
          description: `Check your WhatsApp messages at +${cleanPhone}`
        })
      } else {
        const data = await res.json()
        toast.error(data.detail || "Failed to send verification code")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code")
      return
    }

    setLoading(true)
    try {
      const res = await api.verifyOTP(fullPhone, otp)
      if (res.ok) {
        toast.success("WhatsApp successfully linked!", {
          description: "You can now message your CPAA agent on WhatsApp."
        })
        setStep("phone")
        setLocalPhone("")
        setFullPhone("")
        setOtp("")
        loadStatus()
      } else {
        const data = await res.json()
        toast.error(data.detail || "Invalid verification code")
      }
    } catch {
      toast.error("Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const unlink = async () => {
    setLoading(true)
    try {
      const res = await api.unlinkWhatsApp()
      if (res.ok) {
        toast.success("WhatsApp number unlinked.")
        loadStatus()
      } else {
        toast.error("Failed to unlink number")
      }
    } catch {
      toast.error("Error unlinking WhatsApp")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = countrySearch.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    )
  })

  const quickCommands = [
    { title: "Morning Brief", cmd: "What is my agenda today and any urgent emails?" },
    { title: "Schedule Sync", cmd: "Schedule 30 mins with alex@example.com tomorrow afternoon" },
    { title: "Inbox Check", cmd: "Summarize top 3 unread emails with action items" },
    { title: "Add Memory", cmd: "Remember that I prefer meeting notes sent via email" },
  ]

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Top Breadcrumb & Heading */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to Overview
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">WhatsApp</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Link your WhatsApp phone number to chat, receive alerts, and automate actions.
            </p>
          </div>
          {status?.linked && (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1 text-xs">
              <span className="size-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Connected
            </Badge>
          )}
        </div>
      </div>

      <Separator className="bg-border/60" />

      {status?.linked ? (
        /* CONNECTED STATE */
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 md:p-8 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                  <MessageSquare className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">{status.phone_number}</h3>
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {status.linked_at 
                      ? `Linked on ${new Date(status.linked_at).toLocaleDateString(undefined, { dateStyle: 'long' })}`
                      : "Active 2-way conversation stream"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  asChild
                  size="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  <a
                    href={`https://wa.me/${status.phone_number?.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="size-4" />
                    <span>Open in WhatsApp</span>
                    <ExternalLink className="size-3.5 opacity-80" />
                  </a>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="default" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border">
                      Unlink
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unlink WhatsApp number?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will stop receiving notifications and won&apos;t be able to chat with your CPAA agent on WhatsApp until you link a number again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={unlink} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Unlink WhatsApp
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Quick Command Reference */}
          <div className="rounded-2xl border border-border/70 bg-card/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Try In WhatsApp Right Now
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send any of these sample messages to test your agent&apos;s capabilities.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              {quickCommands.map((q) => (
                <div
                  key={q.title}
                  onClick={() => copyToClipboard(q.cmd)}
                  className="p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/60 transition-all cursor-pointer group flex items-start justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {q.title}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">&ldquo;{q.cmd}&rdquo;</p>
                  </div>
                  <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Security Note */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted messaging via official Meta WhatsApp Business Cloud Webhook API.</span>
          </div>
        </div>
      ) : step === "phone" ? (
        /* ENTER PHONE STEP */
        <div className="space-y-6">
          {/* Stepper Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
              <span className="text-xs font-semibold text-foreground">Phone Number</span>
            </div>
            <div className="w-12 h-px bg-border/60" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="size-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-xs font-medium">Verify OTP</span>
            </div>
          </div>

          {/* Tag / Notice: Before you connect WhatsApp number please contact developer to request access */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Access Notice
                  </Badge>
                  <h4 className="text-sm font-bold text-foreground">Whitelist Verification Required</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Before you connect your WhatsApp number, please contact developer to request access. Your phone number must be added to the Meta WhatsApp Cloud API test roster to receive verification OTPs.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 shrink-0">
              <Link href="/contact">
                Request Access <ExternalLink className="size-3.5 ml-1.5 opacity-70" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  WhatsApp Phone Number
                </Label>
                {/* Access Tag */}
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Info className="size-3" />
                  Contact developer to request access first
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Select your country and enter your WhatsApp subscriber phone number.
              </p>

              {/* Searchable Country Picker + Phone Input */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                {/* Country Code Picker Popover */}
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="h-11 px-3 justify-between gap-2 border-border/80 font-mono text-sm shrink-0 sm:w-44 bg-muted/20 hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="font-semibold text-foreground">+{selectedCountry.dialCode}</span>
                        <span className="text-xs text-muted-foreground font-sans truncate">({selectedCountry.code})</span>
                      </div>
                      <ChevronDown className="size-3.5 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[320px] p-2 bg-popover/95 backdrop-blur-md border border-border shadow-2xl z-50">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Search country or code (e.g. India, 91, US)..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="pl-8 h-9 text-xs"
                          autoFocus
                        />
                      </div>
                      <ScrollArea className="h-64 pr-2">
                        <div className="space-y-1">
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code + "-" + c.dialCode}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c)
                                setCountryOpen(false)
                                setCountrySearch("")
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted transition-colors text-left ${
                                selectedCountry.code === c.code && selectedCountry.dialCode === c.dialCode
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              <span className="font-mono text-muted-foreground shrink-0 ml-2">+{c.dialCode}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground py-4">No country found</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Local Phone Input */}
                <div className="relative flex-1">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOTP()}
                    className="font-mono text-base tracking-wide h-11"
                  />
                </div>

                <Button
                  onClick={sendOTP}
                  disabled={loading || !localPhone.trim()}
                  className="bg-primary text-primary-foreground font-semibold px-6 shadow-sm h-11 shrink-0"
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Send Code
                </Button>
              </div>

              {localPhone.trim() && (
                <p className="text-[11px] text-muted-foreground pt-1">
                  Full WhatsApp international number: <span className="font-mono font-semibold text-foreground">+{computeFullPhone()}</span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" />
              Privacy & Authentication Notice
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We send a one-time verification passcode directly to your WhatsApp to ensure you are the verified owner of the account. Your phone number is strictly used for authentication and delivering your requested tasks.
            </p>
          </div>
        </div>
      ) : (
        /* ENTER OTP STEP */
        <div className="space-y-6">
          {/* Stepper Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="size-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">✓</span>
              <span className="text-xs font-semibold">Phone Number</span>
            </div>
            <div className="w-12 h-px bg-border/60" />
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-xs font-semibold text-foreground">Verify OTP</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Verification Passcode</Label>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit passcode delivered to WhatsApp at <span className="font-mono font-semibold text-foreground">+{fullPhone}</span>.
              </p>

              <div className="pt-3 pb-2 flex justify-start">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={verifyOTP}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="size-11 rounded-lg text-lg border-border" />
                    <InputOTPSlot index={1} className="size-11 rounded-lg text-lg border-border" />
                    <InputOTPSlot index={2} className="size-11 rounded-lg text-lg border-border" />
                    <InputOTPSlot index={3} className="size-11 rounded-lg text-lg border-border" />
                    <InputOTPSlot index={4} className="size-11 rounded-lg text-lg border-border" />
                    <InputOTPSlot index={5} className="size-11 rounded-lg text-lg border-border" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="bg-primary text-primary-foreground font-semibold px-6 shadow-sm"
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirm & Connect
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStep("phone")
                  setOtp("")
                }}
                disabled={loading}
              >
                Change Number
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={sendOTP}
                disabled={loading || resendCooldown > 0}
                className="text-xs text-muted-foreground hover:text-foreground ml-auto"
              >
                {resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
