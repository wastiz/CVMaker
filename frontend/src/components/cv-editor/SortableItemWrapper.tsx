"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: number;
  children: React.ReactNode;
}

export function SortableItemWrapper({ id, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-start gap-1.5", isDragging && "opacity-50 z-10")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-2.5 shrink-0 touch-none text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
        tabIndex={-1}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
