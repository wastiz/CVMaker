"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SectionCard({ title, onAdd, children, defaultOpen = true }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform duration-200", !open && "-rotate-90")}
          />
          {title}
        </button>
        {onAdd && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onAdd}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
