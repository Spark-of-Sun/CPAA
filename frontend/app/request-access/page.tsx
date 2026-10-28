'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function RequestAccessPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '1-10',
    useCase: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Pilot access request submitted!', {
        description: 'Our team will review your application within 24 hours.'
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Private Pilot Access
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Request Access to CPAA
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Join forward-thinking companies, founders, and research partners using CPAA to eliminate tool fragmentation.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border shadow-2xl relative">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Application Received</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for applying to the CPAA pilot. We are onboarding new organizations weekly to maintain strict 99.87% SLA and personalized support.
              </p>
              <div className="pt-4">
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">Your Full Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold">Work Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xs font-semibold">Company or University *</Label>
                  <Input
                    id="company"
                    required
                    placeholder="Acme Corp / AMC Engineering College"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-xs font-semibold">Team Size</Label>
                  <select
                    id="teamSize"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="1-10">1 - 10 people</option>
                    <option value="11-50">11 - 50 people</option>
                    <option value="51-200">51 - 200 people</option>
                    <option value="200+">200+ enterprise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase" className="text-xs font-semibold">Primary Workflow Challenge</Label>
                <Textarea
                  id="useCase"
                  rows={3}
                  placeholder="e.g. Our managers spend 15 hours a week scheduling client calls and checking email action items across Slack and Gmail."
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-semibold h-11 rounded-xl shadow-lg shadow-primary/20"
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Submit Pilot Application <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Zero data sharing • Protected by AES-256 AWS KMS</span>
              </div>
            </form>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
