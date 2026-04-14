export async function safeFetch(
  url: string,
  options?: RequestInit,
  timeoutMs = 5000
): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch {
    return null;
  }
}

export function parseGitHubRepo(input: string): {
  owner: string;
  repo: string;
} | null {
  const cleaned = input
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
  const parts = cleaned.split("/");
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;
  return { owner: parts[0], repo: parts[1] };
}

export async function safeText(response: Response | null): Promise<string> {
  if (!response?.ok) return "";
  try {
    return await response.text();
  } catch {
    return "";
  }
}

export async function safeJson(
  response: Response | null
): Promise<unknown | null> {
  if (!response?.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}
