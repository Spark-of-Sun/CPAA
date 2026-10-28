'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ChevronDown,
  BookOpen,
  Code2,
  Terminal,
  Activity,
  ShieldCheck,
  Building2,
  Newspaper,
  Briefcase,
  HelpCircle,
  Menu,
  X,
  Zap,
  Lock,
  Mail,
  ExternalLink
} from 'lucide-react';

export function MarketingNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    api.getMe()
      .then(async (res) => {
        if (res.ok) setUser(await res.json());
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="size-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">CPAA</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          {/* Product Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-foreground hover:bg-muted/40 transition-colors">
                <span>Product</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-2xl">
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/request-access" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">Request Access</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Join the private pilot program</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/dashboard" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">Agent Command Center</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Manage WhatsApp and integrations</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Developers Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-foreground hover:bg-muted/40 transition-colors">
                <span>Developers</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-2xl">
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/docs" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">Documentation</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Quickstarts, guides & architecture</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/console" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Terminal className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">Console</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Developer sandbox & API keys</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/status" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                      <span>System Status</span>
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">99.87% measured uptime</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* About / Project Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-foreground hover:bg-muted/40 transition-colors">
                <span>About</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-2xl">
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/about" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">About CPAA</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Our mission, research & story</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/news" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Newspaper className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">News & Research</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Pilot results & releases</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/security" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">Security & Trust</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">AES-256 KMS & isolation tests</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer">
                <Link href="/contact" className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-foreground">Contact Sales & Team</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Partnerships & pilot inquiries</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/help" className={`px-3 py-2 rounded-lg hover:text-foreground hover:bg-muted/40 transition-colors ${pathname === '/help' ? 'text-foreground font-semibold' : ''}`}>
            Help
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/Spark-of-Sun/CPAA"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>

          {user ? (
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md">
              <Link href="/dashboard" className="flex items-center gap-1.5">
                <span>Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                <a href={api.login()}>Sign In</a>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs shadow-md shadow-indigo-500/20">
                <a href={api.login()} className="flex items-center gap-1.5">
                  <span>Get Started</span>
                  <Sparkles className="size-3" />
                </a>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link href="/request-access" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">Request Access</Link>
            <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">Documentation</Link>
            <Link href="/console" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">Console</Link>
            <Link href="/status" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">System Status</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">About Us</Link>
            <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">News</Link>
            <Link href="/security" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">Security</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">Contact</Link>
            <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-muted/40">Help</Link>
            <a
              href="https://github.com/Spark-of-Sun/CPAA"
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-muted/40 flex items-center gap-1 font-medium text-foreground"
            >
              <span>GitHub</span>
              <ExternalLink className="size-3 opacity-70" />
            </a>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <a href={api.login()} className="text-xs font-semibold text-primary">Sign in with Auth0</a>
            <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
              <a href={api.login()}>Get Started</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
