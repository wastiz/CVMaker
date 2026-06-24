import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight">CV Maker</h1>
        <p className="text-lg text-muted-foreground">
          Build a clean CV that gets you hired
        </p>
        <div className="flex gap-3">
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
