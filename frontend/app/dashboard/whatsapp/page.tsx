"use client"

import { useEffect, useState } from "react"
import { api, LinkingStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WhatsAppPage() {
  const [status, setStatus] = useState<LinkingStatus | null>(null)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"idle" | "otp">("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    const res = await api.getLinkingStatus()
    if (res.ok) setStatus(await res.json())
  }

  const sendOTP = async () => {
    setLoading(true)
    setError("")
    const res = await api.sendOTP(phone)
    setLoading(false)
    if (res.ok) {
      setStep("otp")
    } else {
      const data = await res.json()
      setError(data.detail || "Failed to send OTP")
    }
  }

  const verifyOTP = async () => {
    setLoading(true)
    setError("")
    const res = await api.verifyOTP(phone, otp)
    setLoading(false)
    if (res.ok) {
      setStep("idle")
      setPhone("")
      setOtp("")
      loadStatus()
    } else {
      const data = await res.json()
      setError(data.detail || "Invalid OTP")
    }
  }

  const unlink = async () => {
    setLoading(true)
    await api.unlinkWhatsApp()
    setLoading(false)
    loadStatus()
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground">Link your WhatsApp number to chat with your AI agent</p>
      </div>

      <Separator className="my-6" />

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {status?.linked ? (
        <div className="space-y-6">
          <div>
            <Label className="text-muted-foreground">Phone number</Label>
            <p className="text-lg font-medium mt-1">{status.phone_number}</p>
            {status.linked_at && (
              <p className="text-sm text-muted-foreground mt-1">
                Linked on {new Date(status.linked_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={unlink} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unlink
          </Button>
        </div>
      ) : step === "idle" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <p className="text-sm text-muted-foreground">
              Enter your phone number with country code (e.g., 919876543210)
            </p>
            <Input
              id="phone"
              placeholder="919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button onClick={sendOTP} disabled={loading || !phone}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send verification code
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Verification code</Label>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your WhatsApp
            </p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex gap-2">
            <Button onClick={verifyOTP} disabled={loading || otp.length !== 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
            <Button variant="ghost" onClick={() => { setStep("idle"); setOtp(""); setError("") }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
