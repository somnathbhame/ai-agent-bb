// API Configuration
// In production, use the environment variable. In development, use relative URLs (proxy handles it)
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const API_ENDPOINTS = {
  agents: `${API_BASE_URL}/api/agents`,
  scenarios: `${API_BASE_URL}/api/scenarios`,
  assistant: `${API_BASE_URL}/api/assistant`,
}
