"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, Briefcase, Mail, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/tracker", label: "Tracker", icon: Briefcase },
  { href: "/cover-letters", label: "Cover Letters", icon: Mail },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const refresh = useAuthStore((s) => s.refresh);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setChecking(false);
      return;
    }
    // After a page refresh the access token is gone; try to re-acquire it via cookie
    refresh().then((ok) => {
      if (!ok) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-border bg-muted/30">
        <div className="px-5 py-5">
          <span className="text-base font-semibold tracking-tight">CV Maker</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-border px-3 py-4">
          {user && (
            <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
          )}
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
