"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    const params = new URLSearchParams({ url });
    if (repo) params.set("repo", repo);
    router.push(`/ax/scan?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-lg">
      <input
        type="url"
        required
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="h-10 rounded-md border bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        type="text"
        placeholder="owner/repo (optional)"
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        className="h-10 rounded-md border bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Scan
      </button>
    </form>
  );
}
