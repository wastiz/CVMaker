"use client";

import { useState } from "react";
import { Check, Copy, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CV_JSON_TEMPLATE, CvImportError, importCvFromJson } from "@/lib/cvExportImport";
import type { CvResponse } from "@/types/cv.types";
import { cn } from "@/lib/utils";

/**
 * Hands the user the resume JSON shape: copy or download the template, fill it
 * in, then paste it back (or upload the saved file) to create the resume.
 */
export function JsonTemplateModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (cv: CvResponse) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CV_JSON_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the text and copy manually");
    }
  }

  function handleDownload() {
    const url = URL.createObjectURL(new Blob([CV_JSON_TEMPLATE], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-template.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(text: string) {
    if (!text.trim()) {
      toast.error("Paste your filled JSON first");
      return;
    }
    setImporting(true);
    try {
      const cv = await importCvFromJson(text);
      toast.success("Resume created from JSON");
      setPasted("");
      onImported(cv);
    } catch (err) {
      toast.error(err instanceof CvImportError ? err.message : "Failed to create resume");
    } finally {
      setImporting(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await handleImport(await file.text());
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resume JSON template</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Copy this template, fill it in your editor, then paste it back below. Only{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">title</code> is required — delete
          any section you don&apos;t need.
        </p>

        <div className="relative">
          <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
            <code>{CV_JSON_TEMPLATE}</code>
          </pre>
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDownload} title="Download as .json">
              <Download className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cv-json-paste" className="text-sm font-medium">
            Paste your filled JSON
          </label>
          <Textarea
            id="cv-json-paste"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='{ "title": "My Resume", … }'
            spellCheck={false}
            className="max-h-48 min-h-24 font-mono text-xs"
          />
        </div>

        <DialogFooter className="items-center sm:justify-between">
          {/* A real <label> rather than a Button, so the click reaches the input. */}
          <label
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "cursor-pointer",
              importing && "pointer-events-none opacity-50"
            )}
          >
            <Upload className="size-3.5" />
            Upload .json file
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              disabled={importing}
              onChange={handleFile}
            />
          </label>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => handleImport(pasted)} disabled={importing || !pasted.trim()}>
              {importing ? "Creating…" : "Create Resume"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
