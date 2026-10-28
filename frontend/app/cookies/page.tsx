import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            Legal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
          <p className="text-xs text-muted-foreground mt-2">Last Updated: October 2026</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">1. Strictly Necessary Cookies</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              CPAA uses cookies exclusively for core platform operations: authenticating sessions via Auth0, protecting against Cross-Site Request Forgery (CSRF), and maintaining theme preferences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">2. No Third-Party Ad Trackers</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We do not utilize third-party advertising cookies, data broker pixels, or behavioral tracking beacons. Your browsing habits remain private.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Managing Cookie Preferences</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You may modify your browser settings to decline or clear cookies. Note that disabling strictly necessary cookies will prevent you from signing in to the CPAA web dashboard.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
