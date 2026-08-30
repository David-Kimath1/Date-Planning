import { API_URL } from '../config'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('dave-lj-auth')
  const parsed = token ? JSON.parse(token) : null
  const authToken = parsed?.state?.token

  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Request failed')
  }

  return response.json()
}
