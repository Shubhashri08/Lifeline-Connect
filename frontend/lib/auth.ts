// Auth utilities for protected routes
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("auth_token")
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("user_email")
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("user_name")
}

export function logout() {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_email")
  localStorage.removeItem("user_name")
  window.location.href = "/"
}
