const API_URL = `http://${window.location.hostname}:8000/api`

export const api = {
  async getHistory(userId: string) {
    const res = await fetch(`${API_URL}/history/${userId}`)
    if (!res.ok) throw new Error('Failed to fetch history')
    return res.json()
  },

  async generateImage(prompt: string, userId: string, model: string) {
    const res = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, user_id: userId, model }),
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
