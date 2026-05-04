const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE}${path}`)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
  },

  post: async (path, body) => {
    const res = await fetch(`${BASE}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw data
    return data
  },
}
