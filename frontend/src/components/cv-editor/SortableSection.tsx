"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  children: React.ReactNode;
}

export function SortableSection({ id, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group/section relative", isDragging && "opacity-50 z-10")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute -left-6 top-3 touch-none text-muted-foreground/0 group-hover/section:text-muted-foreground/50 hover:!text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
        tabIndex={-1}
        aria-label="Drag to reorder section"
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </div>
  );
}
