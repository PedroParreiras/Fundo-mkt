// API client for the Fundo MKT app. Reuses the HRM session token from
// localStorage (same behonest.com.br origin). On 401/403 it bounces to the
// HRM login, matching the other /system/ tools.

const TOKEN_KEY = 'auth_token'

function bounceToLogin(): void {
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.replace(`/system/login?next=${next}`)
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  if (res.status === 401 || res.status === 403) {
    bounceToLogin()
    throw new Error(`${res.status} ${res.statusText}`)
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`)
  }
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}
