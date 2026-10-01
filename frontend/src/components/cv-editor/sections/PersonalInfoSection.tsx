"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse } from "@/types/cv.types";

interface Props {
  cv: CvResponse;
}

type PersonalFields = Pick<
  CvResponse,
  "firstName" | "lastName" | "email" | "phone" | "location" |
  "github" | "linkedin" | "portfolio" | "otherLink" | "driverLicense" | "workPermit"
>;

const WORK_PERMIT_SUGGESTIONS = [
  "EU citizen",
  "EU work permit",
  "Estonian residence permit",
  "EU Blue Card",
  "Valid work permit",
  "Requires visa sponsorship",
];

export function PersonalInfoSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [form, setForm] = useState<PersonalFields>({
    firstName: cv.firstName ?? "",
    lastName: cv.lastName ?? "",
    email: cv.email ?? "",
    phone: cv.phone ?? "",
    location: cv.location ?? "",
    github: cv.github ?? "",
    linkedin: cv.linkedin ?? "",
    portfolio: cv.portfolio ?? "",
    otherLink: cv.otherLink ?? "",
    driverLicense: cv.driverLicense ?? "",
    workPermit: cv.workPermit ?? "",
  });

  async function handleBlur(field: keyof PersonalFields) {
    const value = form[field];
    try {
      const { data } = await cvApi.patch(cv.id, { [field]: value || undefined });
      setCv(data);
    } catch {
      toast.error("Failed to save");
    }
  }

  function field(label: string, key: keyof PersonalFields, placeholder?: string, suggestions?: string[]) {
    const listId = suggestions ? `${key}-suggestions` : undefined;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={key} className="text-xs text-muted-foreground font-medium">
          {label}
        </Label>
        <Input
          id={key}
          value={form[key] ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          onBlur={() => handleBlur(key)}
          placeholder={placeholder}
          list={listId}
        />
        {suggestions && (
          <datalist id={listId}>
            {suggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {field("First Name", "firstName", "John")}
        {field("Last Name", "lastName", "Doe")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("Email", "email", "john@example.com")}
        {field("Phone", "phone", "+372 5xxx xxxx")}
      </div>
      {field("Location", "location", "Tallinn, Estonia")}
      <div className="grid grid-cols-2 gap-3">
        {field("GitHub", "github", "github.com/username")}
        {field("LinkedIn", "linkedin", "linkedin.com/in/username")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("Portfolio", "portfolio", "portfolio.dev")}
        {field("Other Link", "otherLink", "example.com")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("Work Permit", "workPermit", "EU work permit", WORK_PERMIT_SUGGESTIONS)}
        {field("Driver License", "driverLicense", "B")}
      </div>
    </div>
  );
}
