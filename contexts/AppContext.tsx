'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, ChatSession, Ticket, Message, Agent } from '@/lib/types';
import { storage, createChatSession, createTicket } from '@/lib/storage';

interface AppContextType {
  state: AppState;
  startNewChat: () => ChatSession;
  addMessage: (sessionId: string, message: Message) => void;
  createTicketFromChat: (sessionId: string, title: string, description: string) => Ticket;
  escalateChat: (sessionId: string, reason: string) => void;
  assignTicketToAgent: (ticketId: string, agentId: string) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  getCurrentChatSession: () => ChatSession | null;
  setCurrentChatSession: (session: ChatSession | null) => void;
}

type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'START_NEW_CHAT'; payload: ChatSession }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'CREATE_TICKET'; payload: Ticket }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'UPDATE_CHAT_SESSION'; payload: ChatSession }
  | { type: 'SET_CURRENT_CHAT_SESSION'; payload: ChatSession | null }
  | { type: 'UPDATE_AGENT'; payload: Agent };

const initialState: AppState = {
  chatSessions: [],
  tickets: [],
  agents: [],
  currentChatSession: null,
  escalationTriggers: [
    {
      type: 'keyword',
      value: 'human agent',
      description: 'User requests human assistance'
    },
    {
      type: 'confidence',
      value: 0.3,
      description: 'AI confidence below threshold'
    },
    {
      type: 'repeated_issue',
      value: 'multiple attempts',
      description: 'Issue not resolved after multiple attempts'
    }
  ]
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'START_NEW_CHAT': {
      const newSession = action.payload;
      const updatedSessions = [...state.chatSessions, newSession];

      // Save to storage
      storage.updateChatSession(newSession);

      return {
        ...state,
        chatSessions: updatedSessions,
        currentChatSession: newSession
      };
    }

    case 'ADD_MESSAGE': {
      const { sessionId, message } = action.payload;
      const updatedSessions = state.chatSessions.map(session => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            messages: [...session.messages, message],
            updatedAt: new Date()
          };

          // Save to storage
          storage.updateChatSession(updatedSession);

          return updatedSession;
        }
        return session;
      });

      return {
        ...state,
        chatSessions: updatedSessions,
        currentChatSession: state.currentChatSession?.id === sessionId
          ? updatedSessions.find(s => s.id === sessionId) || state.currentChatSession
          : state.currentChatSession
      };
    }

    case 'CREATE_TICKET': {
      const newTicket = action.payload;
      const updatedTickets = [...state.tickets, newTicket];

      // Save to storage
      storage.updateTicket(newTicket);

      return {
        ...state,
        tickets: updatedTickets
      };
    }

    case 'UPDATE_TICKET': {
      const updatedTicket = action.payload;
      const updatedTickets = state.tickets.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      );

      // Save to storage
      storage.updateTicket(updatedTicket);

      return {
        ...state,
        tickets: updatedTickets
      };
    }

    case 'UPDATE_CHAT_SESSION': {
      const updatedSession = action.payload;
      const updatedSessions = state.chatSessions.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      );

      // Save to storage
      storage.updateChatSession(updatedSession);

      return {
        ...state,
        chatSessions: updatedSessions,
        currentChatSession: state.currentChatSession?.id === updatedSession.id
          ? updatedSession
          : state.currentChatSession
      };
    }

    case 'SET_CURRENT_CHAT_SESSION':
      return {
        ...state,
        currentChatSession: action.payload
      };

    case 'UPDATE_AGENT': {
      const updatedAgent = action.payload;
      const updatedAgents = state.agents.map(agent =>
        agent.id === updatedAgent.id ? updatedAgent : agent
      );

      // Save to storage
      storage.updateAgent(updatedAgent);

      return {
        ...state,
        agents: updatedAgents
      };
    }

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = storage.getAppState();
    dispatch({ type: 'LOAD_STATE', payload: savedState });
  }, []);

  const startNewChat = (): ChatSession => {
    const newSession = createChatSession();
    dispatch({ type: 'START_NEW_CHAT', payload: newSession });
    return newSession;
  };

  const addMessage = (sessionId: string, message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message } });
  };

  const createTicketFromChat = (sessionId: string, title: string, description: string): Ticket => {
    const chatSession = state.chatSessions.find(s => s.id === sessionId);
    if (!chatSession) {
      throw new Error('Chat session not found');
    }

    const newTicket = createTicket(chatSession, title, description);

    // Update chat session status
    const updatedChatSession = {
      ...chatSession,
      status: 'escalated' as const,
      ticketId: newTicket.id,
      updatedAt: new Date()
    };

    dispatch({ type: 'CREATE_TICKET', payload: newTicket });
    dispatch({ type: 'UPDATE_CHAT_SESSION', payload: updatedChatSession });

    return newTicket;
  };

  const escalateChat = (sessionId: string, reason: string) => {
    const chatSession = state.chatSessions.find(s => s.id === sessionId);
    if (!chatSession) return;

    // Create a ticket for the escalated chat
    const title = `Escalated: ${chatSession.messages[0]?.content?.substring(0, 50) || 'Customer Inquiry'}...`;
    const description = `Chat escalated. Reason: ${reason}\n\nConversation summary: ${chatSession.messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}`;

    createTicketFromChat(sessionId, title, description);
  };

  const assignTicketToAgent = (ticketId: string, agentId: string) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    const agent = state.agents.find(a => a.id === agentId);

    if (!ticket || !agent) return;

    const updatedTicket = {
      ...ticket,
      assignedAgent: agentId,
      status: 'in_progress' as const,
      updatedAt: new Date()
    };

    const updatedAgent = {
      ...agent,
      activeTickets: [...agent.activeTickets.filter(id => id !== ticketId), ticketId],
      status: 'busy' as const
    };

    dispatch({ type: 'UPDATE_TICKET', payload: updatedTicket });
    dispatch({ type: 'UPDATE_AGENT', payload: updatedAgent });
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updatedTicket = {
      ...ticket,
      status,
      updatedAt: new Date(),
      resolvedAt: status === 'resolved' || status === 'closed' ? new Date() : ticket.resolvedAt
    };

    dispatch({ type: 'UPDATE_TICKET', payload: updatedTicket });

    // If ticket is resolved/closed, update agent status
    if ((status === 'resolved' || status === 'closed') && ticket.assignedAgent) {
      const agent = state.agents.find(a => a.id === ticket.assignedAgent);
      if (agent) {
        const updatedAgent = {
          ...agent,
          activeTickets: agent.activeTickets.filter(id => id !== ticketId),
          status: agent.activeTickets.length <= 1 ? 'available' as const : 'busy' as const
        };
        dispatch({ type: 'UPDATE_AGENT', payload: updatedAgent });
      }
    }
  };

  const getCurrentChatSession = (): ChatSession | null => {
    return state.currentChatSession;
  };

  const setCurrentChatSession = (session: ChatSession | null) => {
    dispatch({ type: 'SET_CURRENT_CHAT_SESSION', payload: session });
  };

  const contextValue: AppContextType = {
    state,
    startNewChat,
    addMessage,
    createTicketFromChat,
    escalateChat,
    assignTicketToAgent,
    updateTicketStatus,
    getCurrentChatSession,
    setCurrentChatSession
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}