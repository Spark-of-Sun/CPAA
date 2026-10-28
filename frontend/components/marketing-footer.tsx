import Link from 'next/link';
import { Bot, ExternalLink } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Bot className="size-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">CPAA</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Configurable Personal AI Agent. Orchestrating your Gmail, Calendar, Slack, and Google Meet directly inside WhatsApp.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>99.87% Tested Uptime</span>
              </div>
            </div>
            <div className="pt-2">
              <a
                href="https://github.com/Spark-of-Sun/CPAA"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="size-3 opacity-70" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground tracking-wider uppercase">Platform</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Agent Dashboard
                </Link>
              </li>
              <li>
                <Link href="/request-access" className="text-muted-foreground hover:text-foreground transition-colors">
                  Request Access
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/console" className="text-muted-foreground hover:text-foreground transition-colors">
                  Developer Console
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Status</span>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground tracking-wider uppercase">Project</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">
                  News & Updates
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground tracking-wider uppercase">Legal</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-muted-foreground hover:text-foreground transition-colors">
                  Acceptable Use
                </Link>
              </li>
              <li className="pt-2 border-t border-border/40">
                <a
                  href="https://github.com/Spark-of-Sun/CPAA"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium"
                >
                  <span>GitHub</span>
                  <ExternalLink className="size-3 opacity-70" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CPAA.</p>
          <div className="flex items-center gap-4">
            <span>OAuth 2.0 Token Isolation</span>
            <span>•</span>
            <span>AES-256 AWS KMS</span>
            <span>•</span>
            <span>Meta WhatsApp Cloud API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
