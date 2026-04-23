import { authHeader } from "./auth";

export async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiJSON(path, options = {}) {
  try {
    const response = await fetch(path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { error: data?.error || `request failed: ${response.status}` };
    }

    return await response.json();
  } catch {
    return { error: "network error" };
  }
}
