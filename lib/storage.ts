import { ChatSession, Ticket, Agent, AppState } from './types';

const STORAGE_KEYS = {
  CHAT_SESSIONS: 'ticket-ai-chat-sessions',
  TICKETS: 'ticket-ai-tickets',
  AGENTS: 'ticket-ai-agents',
  APP_STATE: 'ticket-ai-app-state'
} as const;

// No default agents - agents should be created/added by administrators

class StorageManager {
  private isClient = typeof window !== 'undefined';

  // Generic storage methods
  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const parsed = JSON.parse(item);

      // Handle date parsing for objects with Date fields
      return this.parseDates(parsed) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  private parseDates(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      // Check if string is a date
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      if (dateRegex.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.parseDates(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const parsed: Record<string, unknown> = {};
      const objRecord = obj as Record<string, unknown>;
      for (const key in objRecord) {
        if (objRecord.hasOwnProperty(key)) {
          parsed[key] = this.parseDates(objRecord[key]);
        }
      }
      return parsed;
    }

    return obj;
  }

  // Chat Sessions
  getChatSessions(): ChatSession[] {
    return this.getItem(STORAGE_KEYS.CHAT_SESSIONS, []);
  }

  saveChatSessions(sessions: ChatSession[]): void {
    this.setItem(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  }

  getChatSession(id: string): ChatSession | null {
    const sessions = this.getChatSessions();
    return sessions.find(session => session.id === id) || null;
  }

  updateChatSession(session: ChatSession): void {
    const sessions = this.getChatSessions();
    const index = sessions.findIndex(s => s.id === session.id);

    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: new Date() };
    } else {
      sessions.push(session);
    }

    this.saveChatSessions(sessions);
  }

  // Tickets
  getTickets(): Ticket[] {
    return this.getItem(STORAGE_KEYS.TICKETS, []);
  }

  saveTickets(tickets: Ticket[]): void {
    this.setItem(STORAGE_KEYS.TICKETS, tickets);
  }

  getTicket(id: string): Ticket | null {
    const tickets = this.getTickets();
    return tickets.find(ticket => ticket.id === id) || null;
  }

  updateTicket(ticket: Ticket): void {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);

    if (index >= 0) {
      tickets[index] = { ...ticket, updatedAt: new Date() };
    } else {
      tickets.push(ticket);
    }

    this.saveTickets(tickets);
  }

  // Agents
  getAgents(): Agent[] {
    return this.getItem(STORAGE_KEYS.AGENTS, []);
  }

  saveAgents(agents: Agent[]): void {
    this.setItem(STORAGE_KEYS.AGENTS, agents);
  }

  getAgent(id: string): Agent | null {
    const agents = this.getAgents();
    return agents.find(agent => agent.id === id) || null;
  }

  updateAgent(agent: Agent): void {
    const agents = this.getAgents();
    const index = agents.findIndex(a => a.id === agent.id);

    if (index >= 0) {
      agents[index] = agent;
    } else {
      agents.push(agent);
    }

    this.saveAgents(agents);
  }

  // Complete App State
  getAppState(): AppState {
    return {
      chatSessions: this.getChatSessions(),
      tickets: this.getTickets(),
      agents: this.getAgents(),
      currentChatSession: null,
      escalationTriggers: []
    };
  }

  // Utility methods
  clearAllData(): void {
    if (!this.isClient) return;

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data = {
      chatSessions: this.getChatSessions(),
      tickets: this.getTickets(),
      agents: this.getAgents(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.chatSessions) {
        this.saveChatSessions(data.chatSessions);
      }
      if (data.tickets) {
        this.saveTickets(data.tickets);
      }
      if (data.agents) {
        this.saveAgents(data.agents);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Get storage size (for debugging)
  getStorageSize(): { used: number; limit: number } {
    if (!this.isClient) return { used: 0, limit: 0 };

    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    return {
      used: Math.round(totalSize / 1024), // KB
      limit: 5120 // ~5MB typical limit
    };
  }
}

// Create a singleton instance
export const storage = new StorageManager();

// Utility functions for common operations
export function createChatSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    messages: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function createTicket(
  chatSession: ChatSession,
  title: string,
  description: string
): Ticket {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    status: 'created',
    priority: 'medium',
    category: 'general',
    chatSessionId: chatSession.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}