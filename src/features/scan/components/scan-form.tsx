"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState("");

  function normalizeUrl(input: string): string | null {
    let value = input.trim();
    if (!value) return null;
    if (!/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }
    try {
      new URL(value);
      return value;
    } catch {
      return null;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    const params = new URLSearchParams({ url: normalized });
    if (repo.trim()) params.set("repo", repo.trim());
    router.push(`/ax/scan?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl space-y-2 rounded-2xl border border-white/[0.08] bg-[#1c1b1b] p-2"
    >
      <div className="group relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b90a0] transition-colors group-focus-within:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
          />
        </svg>
        <input
          type="text"
          required
          placeholder="Website URL (e.g., netlify.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-xl border-none bg-[#201f1f] py-4 pl-12 pr-4 text-[#e5e2e1] placeholder:text-[#8b90a0]/50 focus:ring-1 focus:ring-blue-400"
          style={{ fontFamily: "Inter, sans-serif" }}
        />
      </div>
      <div className="group relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b90a0] transition-colors group-focus-within:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <input
          type="text"
          placeholder="GitHub repo (e.g., owner/repo)"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="w-full rounded-xl border-none bg-[#201f1f] py-4 pl-12 pr-4 text-[#e5e2e1] placeholder:text-[#8b90a0]/50 focus:ring-1 focus:ring-blue-400"
          style={{ fontFamily: "Inter, sans-serif" }}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4b8eff] py-4 text-lg font-extrabold text-[#001a41] shadow-lg transition-all hover:shadow-blue-500/20 active:scale-[0.98]"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        Run Intelligence Audit
      </button>
    </form>
  );
}
