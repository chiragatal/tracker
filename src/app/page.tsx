import Link from "next/link";
import { Layers, Search, Share2, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Custom Trackers",
    description:
      "Create trackers with custom fields for anything -- books, movies, recipes, workouts, and more.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Instantly find any entry across all your trackers with powerful full-text search.",
  },
  {
    icon: Share2,
    title: "Share & Export",
    description:
      "Export your data as JSON or share your trackers with others. Your data, your way.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create a tracker",
    description: "Define custom fields like ratings, tags, dates, and more.",
  },
  {
    number: "2",
    title: "Log your entries",
    description: "Add entries as you go -- quick, simple, and satisfying.",
  },
  {
    number: "3",
    title: "Search and revisit",
    description: "Find anything instantly and look back on what you've tracked.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute top-3/4 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Tracker" className="h-8 w-8" />
            <span className="text-xl font-bold text-gradient">Tracker</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-20 sm:pt-28 pb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground mb-8">
            Track anything -- coffee, books, recipes, and more
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Track the things
            <br />
            <span className="text-gradient">you love</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            A simple, beautiful way to log and organize your personal
            experiences. Books, movies, recipes, workouts -- all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-colors inline-flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent/10 transition-colors inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to <span className="text-gradient">track it all</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Powerful yet simple tools to organize your personal collections and experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-8 card-glow gradient-border"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/10 mb-5">
                  <feature.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 pb-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How it <span className="text-gradient">works</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Get started in minutes. No complicated setup required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-violet-500 text-white font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-border bg-card p-10 sm:p-14 card-glow gradient-border">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Start tracking <span className="text-gradient">for free</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join and start organizing your personal experiences today. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-colors"
            >
              Sign Up Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tracker. Built with care.</p>
          <p className="mt-2">
            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              Privacy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
