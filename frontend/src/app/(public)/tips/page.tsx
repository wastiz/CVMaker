import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Guides — CV Maker",
  description: "Practical guides on writing a resume and a cover letter for IT jobs.",
};

const GUIDES = [
  {
    href: "/tips/resume",
    icon: FileText,
    title: "How to write a resume",
    text: "What to put in the header, how to write a summary, and how to describe experience so it shows results.",
  },
  {
    href: "/tips/cover-letter",
    icon: Mail,
    title: "How to write a cover letter",
    text: "Read the job description, match your experience to it, and turn that into a short letter people want to read.",
  },
] as const;

export default function TipsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Guides</h1>
        <p className="text-muted-foreground">
          Short, practical advice for getting your application past the first screen.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
          >
            <Icon className="size-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-semibold">{title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium">
              Read guide
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
