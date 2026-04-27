const API_URL = `http://${window.location.hostname}:8181/api`

export type ModelStatus = 'ready' | 'loading' | 'offline'

export const api = {
  async getHealth(): Promise<ModelStatus> {
    try {
      const res = await fetch(`${API_URL}/health`)
      if (!res.ok) return 'offline'
      const data = await res.json()
      return data.status === 'ready' ? 'ready' : 'loading'
    } catch {
      return 'offline'
    }
  },

  async getHistory(userId: string) {
    const res = await fetch(`${API_URL}/history/${userId}`)
    if (!res.ok) throw new Error('Failed to fetch history')
    return res.json()
  },

  async generateImage(prompt: string, userId: string, images?: string[]) {
    const res = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, user_id: userId, images }),
    })

    if (!res.ok) {
        let errorMessage = 'Failed to generate image';
        try {
            const errorData = await res.json();
            if (errorData.detail) errorMessage = errorData.detail;
        } catch {
            // ignore JSON parse error
        }
        throw new Error(errorMessage)
    }
    return res.json()
  },

  async deleteHistory(id: string) {
    const res = await fetch(`${API_URL}/history/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete item')
    return res.json()
  }
}
