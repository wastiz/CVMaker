import Link from "next/link";
import { Check, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function GuideHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: React.ReactNode;
}) {
  return (
    <header className="space-y-3 border-b border-border pb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-base leading-relaxed text-muted-foreground">{lead}</p>
    </header>
  );
}

export function GuideToc({ items }: { items: { id: string; title: string }[] }) {
  return (
    <nav className="rounded-xl bg-muted/40 p-5 ring-1 ring-foreground/10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
      <ol className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
              <span className="mr-2 tabular-nums">{i + 1}.</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function GuideSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tight sm:text-2xl">
        <span className="text-base font-medium tabular-nums text-muted-foreground">
          {String(number).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-base font-semibold">{children}</h3>;
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed ring-1 ring-foreground/10">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
      <div>{children}</div>
    </aside>
  );
}

/** Side-by-side "weak vs strong" example. Stacks on narrow screens. */
export function Compare({ weak, strong }: { weak: React.ReactNode; strong: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ExampleBox tone="weak">{weak}</ExampleBox>
      <ExampleBox tone="strong">{strong}</ExampleBox>
    </div>
  );
}

function ExampleBox({ tone, children }: { tone: "weak" | "strong"; children: React.ReactNode }) {
  const weak = tone === "weak";
  const Icon = weak ? X : Check;
  return (
    <div
      className={cn(
        "rounded-xl p-4 text-sm leading-relaxed ring-1",
        weak
          ? "bg-red-500/5 ring-red-500/20"
          : "bg-emerald-500/5 ring-emerald-500/25"
      )}
    >
      <p
        className={cn(
          "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider",
          weak ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
        )}
      >
        <Icon className="size-3.5" />
        {weak ? "Weak" : "Strong"}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-foreground/20 pl-4 text-sm italic leading-relaxed text-muted-foreground">
      {children}
    </blockquote>
  );
}

export function GuideTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-foreground/30" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function GuideCta({ href, title, text, label }: { href: string; title: string; text: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl bg-muted/40 p-6 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
      <Link
        href={href}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        {label}
      </Link>
    </div>
  );
}
