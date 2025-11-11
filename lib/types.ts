export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    confidence?: number;
    escalationTrigger?: boolean;
    attachments?: string[];
  };
}

export interface ChatSession {
  id: string;
  messages: Message[];
  status: 'active' | 'escalated' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  ticketId?: string;
  userId?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'created' | 'ai_handling' | 'escalated' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'complaint' | 'feature_request';
  chatSessionId: string;
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  escalationReason?: string;
  tags?: string[];
  metadata?: {
    customerInfo?: {
      email?: string;
      name?: string;
    };
    escalationTriggers?: string[];
    aiConfidenceScore?: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  activeTickets: string[];
  skillTags: string[];
}

export interface EscalationTrigger {
  type: 'keyword' | 'sentiment' | 'confidence' | 'manual' | 'repeated_issue';
  value: string | number;
  description: string;
}

export interface AIResponse {
  message: string;
  confidence: number;
  shouldEscalate: boolean;
  escalationReason?: string;
  suggestedCategory?: Ticket['category'];
  suggestedPriority?: Ticket['priority'];
}

export interface AppState {
  chatSessions: ChatSession[];
  tickets: Ticket[];
  currentChatSession: ChatSession | null;
  agents: Agent[];
  escalationTriggers: EscalationTrigger[];
}

export type TicketStatus = Ticket['status'];
export type MessageRole = Message['role'];
export type Priority = Ticket['priority'];
export type Category = Ticket['category'];