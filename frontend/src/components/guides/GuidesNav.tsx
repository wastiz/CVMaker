"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/tips/resume", label: "Resume guide" },
  { href: "/tips/cover-letter", label: "Cover letter guide" },
] as const;

export function GuidesNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
