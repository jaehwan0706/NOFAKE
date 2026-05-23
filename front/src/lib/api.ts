const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

/**
 * Centralized API request helper.
 * robustly prepends the base URL and handles slash concatenation.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  
  // ngrok 브라우저 경고 페이지 우회
  headers.set("ngrok-skip-browser-warning", "69420");
  
  let body = options.body;

  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  // Ensure robust URL construction
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${cleanBase}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
    body: body as BodyInit | null | undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data ? String(data.error) : "API request failed.";
    throw new Error(message);
  }

  return data as T;
}
