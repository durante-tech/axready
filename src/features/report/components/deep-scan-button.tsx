"use client";

import { useState } from "react";
import { toast } from "sonner";
import { generateDosPrompt } from "../lib/generate-dos-prompt";
import type { Report } from "../types";

export function DeepScanButton({ report }: { report: Report }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const prompt = generateDosPrompt(report);
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied — paste into Claude Code");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#201f1f] px-4 py-2.5 text-sm font-medium text-[#c1c6d7] transition-all hover:border-blue-400/30 hover:text-[#e5e2e1]"
      style={{ fontFamily: "Space Grotesk, sans-serif" }}
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Deep Scan with DOS
        </>
      )}
    </button>
  );
}
