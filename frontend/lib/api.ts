const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res;
}

export const api = {
  // Auth
  getMe: () => fetchAPI('/auth/me'),
  login: () => `${API_BASE}/auth/login`,
  logout: () => `${API_BASE}/auth/logout`,

  // Linking
  getLinkingStatus: () => fetchAPI('/linking/status'),
  sendOTP: (phone: string) => fetchAPI('/linking/send-otp', { method: 'POST', body: JSON.stringify({ phone_number: phone }) }),
  verifyOTP: (phone: string, code: string) => fetchAPI('/linking/verify-otp', { method: 'POST', body: JSON.stringify({ phone_number: phone, code }) }),
  unlinkWhatsApp: () => fetchAPI('/linking/unlink', { method: 'DELETE' }),

  // Tools
  getAvailableTools: () => fetchAPI('/tools/available'),
  getConnectedTools: () => fetchAPI('/tools/connected'),
  connectTool: (toolkit: string) => fetchAPI(`/tools/connect/${toolkit}`, { method: 'POST' }),
  disconnectTool: (toolkit: string) => fetchAPI(`/tools/disconnect/${toolkit}`, { method: 'DELETE' }),
  getToolStatus: (toolkit: string) => fetchAPI(`/tools/status/${toolkit}`),

  // Triggers
  getTriggerStatus: () => fetchAPI('/tools/triggers/status'),
  getQueuedEmails: () => fetchAPI('/tools/triggers/emails'),
  setupGmailTrigger: () => fetchAPI('/tools/triggers/gmail', { method: 'POST' }),
  clearEmailQueue: () => fetchAPI('/tools/triggers/emails', { method: 'DELETE' }),

  // User
  getProfile: () => fetchAPI('/users/me'),
  getConnections: () => fetchAPI('/users/me/connections'),

  // Memory
  getMemories: () => fetchAPI('/users/me/memories'),
  searchMemories: (query: string) => fetchAPI(`/users/me/memories/search?query=${encodeURIComponent(query)}`),
  addMemory: (content: string) => fetchAPI('/users/me/memories', { method: 'POST', body: JSON.stringify({ content }) }),
  deleteMemory: (id: string) => fetchAPI(`/users/me/memories/${id}`, { method: 'DELETE' }),
  clearMemories: () => fetchAPI('/users/me/memories', { method: 'DELETE' }),

  // Admin
  clearSessions: () => fetchAPI('/tools/clear-sessions', { method: 'POST' }),
};

export type User = { user_id: string; email: string; name: string; picture?: string };
export type LinkingStatus = { linked: boolean; phone_number?: string; linked_at?: string };
export type Tool = { toolkit: string; status: string };
export type AvailableTool = { name: string; label: string; icon: string; logo?: string };
export type Memory = { id: string; memory?: string; text?: string; created_at?: string };
