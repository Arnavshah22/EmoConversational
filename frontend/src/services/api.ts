const API_BASE = '/api';

export interface Persona {
  id: string;
  name: string;
  label: string;
  emoji: string;
  description: string;
  tone: string;
  samplePhrases: string[];
}

export interface ChatStartResponse {
  success: boolean;
  sessionId: string;
  persona: Persona;
  greeting: string;
}

export interface ChatMessageResponse {
  success: boolean;
  response: string;
  emotion: {
    detected: string;
    intensity: number;
    confidence: number;
  };
}

export const api = {
  async getPersonas(): Promise<Persona[]> {
    const res = await fetch(`${API_BASE}/persona/all`);
    const data = await res.json();
    return data.personas;
  },

  async startChat(personaId: string, userName?: string): Promise<ChatStartResponse> {
    const res = await fetch(`${API_BASE}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId, userName }),
    });
    return res.json();
  },

  async sendMessage(sessionId: string, content: string): Promise<ChatMessageResponse> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, content }),
    });
    return res.json();
  },

  async getHistory(sessionId: string) {
    const res = await fetch(`${API_BASE}/chat/history/${sessionId}`);
    return res.json();
  },
};
