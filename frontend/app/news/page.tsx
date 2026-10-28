import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Sparkles, Newspaper } from 'lucide-react';

export default function NewsPage() {
  const articles = [
    {
      title: "CPAA Publishes 15-Person Pilot Results: 45 Minutes Saved Daily",
      date: "October 24, 2026",
      category: "Research Pilot",
      summary: "Two weeks of continuous user tracking showed a 100% elimination of multi-app switching, 97% task extraction accuracy, and an average of 12 habitual user sessions per day.",
      slug: "pilot-results"
    },
    {
      title: "Introducing CPAA Titan: Next-Gen Autonomous Reasoning on WhatsApp",
      date: "October 20, 2026",
      category: "Product Release",
      summary: "Our new multi-agent architecture introduces 10-message sliding window memory, 89% tool cache hit rates, and conflict-aware scheduling across Google Calendar.",
      slug: "cpaa-titan"
    },
    {
      title: "Achieving 97% Action Extraction Accuracy with Composio & AWS Bedrock",
      date: "October 12, 2026",
      category: "Engineering Deep Dive",
      summary: "How our hybrid memory engine extracts deadlines, owners, and urgency from messy, unstructured email threads while maintaining sub-second execution speeds.",
      slug: "extraction-accuracy"
    },
    {
      title: "AMC Engineering College Presents CPAA at National AI Research Summit",
      date: "September 28, 2026",
      category: "Academic",
      summary: "Final-year CSE (AIML) team presents the theoretical and practical framework for lightweight conversational overlays to over 500 attendees in Bengaluru.",
      slug: "ai-summit"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern relative">
      <MarketingNavbar />

      <main className="flex-1 py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-3 px-3 py-1 border-primary/30 text-primary">
            News & Research Updates
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Latest From CPAA
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Announcements, research findings, and technical deep dives from our engineering lab.
          </p>
        </div>

        <div className="grid gap-6">
          {articles.map((article) => (
            <div key={article.slug} className="glass-card rounded-2xl p-6 sm:p-8 border border-border space-y-3 group">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                  {article.category}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {article.date}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {article.summary}
              </p>

              <div className="pt-2">
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:underline">
                  Read Announcement <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
