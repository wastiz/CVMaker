"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { coverLetterApi } from "@/api/coverLetterApi";

export function CoverLetterPreviewModal({
  id,
  open,
  onClose,
}: {
  id: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id === null) return;
    setLoading(true);
    setHtml("");
    coverLetterApi
      .getPreview(id)
      .then(({ data }) => setHtml(data))
      .catch(() => toast.error("Failed to load preview"))
      .finally(() => setLoading(false));
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>
        <div className="relative h-[75vh] overflow-hidden rounded-lg border border-border bg-muted/20">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          <iframe
            srcDoc={html}
            className="h-full w-full border-none bg-white"
            title="Cover Letter Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
