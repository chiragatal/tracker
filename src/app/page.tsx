import Link from "next/link";
import { ClipboardList, Layers, Search } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Track Anything",
    description:
      "Books, movies, recipes, workouts — create custom trackers for anything you care about.",
  },
  {
    icon: Layers,
    title: "Custom Fields",
    description:
      "Define your own fields with ratings, tags, dates, and more. Your tracker, your rules.",
  },
  {
    icon: Search,
    title: "Search Everything",
    description:
      "Instantly find any entry across all your trackers with powerful full-text search.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Tracker" className="h-8 w-8" />
            <span className="text-xl font-bold text-gradient">Tracker</span>
          </div>
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
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Track the things
            <br />
            <span className="text-gradient">you love</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            A simple, beautiful way to log and organize your personal
            experiences. Books, movies, recipes, workouts — all in one place.
          </p>
          <div className="flex items-center gap-4 mt-10">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 card-glow gradient-border"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 mb-4">
                  <feature.icon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          Built with care. Track what matters.
        </footer>
      </div>
    </div>
  );
}
