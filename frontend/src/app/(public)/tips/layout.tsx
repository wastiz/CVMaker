import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GuidesNav } from "@/components/guides/GuidesNav";

export default function TipsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="text-base font-semibold tracking-tight">
            CV Maker
          </Link>
          <div className="flex items-center gap-2">
            <GuidesNav />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">{children}</main>
    </div>
  );
}
