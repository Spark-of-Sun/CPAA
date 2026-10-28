'use client';

import { useState } from 'react';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, MapPin, Clock, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Pilot Partnership',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Message dispatched successfully!', {
        description: 'Our founding team will reply within 24 hours.'
      });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Get in Touch
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Contact the CPAA Group
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Interested in launching a pilot, offering cloud infrastructure support, or exploring research collaborations? We&apos;d love to connect.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
              <h3 className="font-bold text-base text-foreground">Academic Research Lab</h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Department of CSE (AIML)<br />
                    AMC Engineering College, Bannerghatta Main Road<br />
                    Bengaluru, Karnataka 560083, India
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-primary shrink-0" />
                  <span>contact@cpaa.ai / aiml.cpaa@amcec.edu.in</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-primary shrink-0" />
                  <span>Monday – Friday: 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-border space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="size-4 text-emerald-400" /> WhatsApp Direct Support
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Active pilot participants can query our support bot directly on WhatsApp for instant assistance.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl p-8 border border-border">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                    <Send className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Message Delivered</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. We review all incoming messages promptly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-semibold">Your Name *</Label>
                      <Input
                        id="name"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-semibold">Subject</Label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Pilot Partnership">Pilot Partnership Inquiry</option>
                      <option value="Enterprise Sales">Enterprise Deployment</option>
                      <option value="Cloud Credits">Cloud Infrastructure & Credits</option>
                      <option value="Academic Collaboration">Academic & Research Collaboration</option>
                      <option value="General Support">General Support</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="Tell us about your team, organization, or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-semibold"
                  >
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
