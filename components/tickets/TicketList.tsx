'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Ticket } from '@/lib/types';
import { Clock, AlertCircle, CheckCircle, User, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TicketListProps {
  className?: string;
  showEscalatedOnly?: boolean;
}

export function TicketList({ className = '', showEscalatedOnly = false }: TicketListProps) {
  const { state, updateTicketStatus, assignTicketToAgent } = useApp();

  const tickets = showEscalatedOnly
    ? state.tickets.filter(t => t.status === 'escalated')
    : state.tickets;

  const sortedTickets = [...tickets].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (tickets.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {showEscalatedOnly ? 'No escalated tickets' : 'No tickets yet'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {sortedTickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onStatusChange={(status) => updateTicketStatus(ticket.id, status)}
          onAssignAgent={(agentId) => assignTicketToAgent(ticket.id, agentId)}
          availableAgents={state.agents.filter(a => a.status === 'available')}
        />
      ))}
    </div>
  );
}

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange: (status: Ticket['status']) => void;
  onAssignAgent: (agentId: string) => void;
  availableAgents: Array<{ id: string; name: string }>;
}

function TicketCard({ ticket, onStatusChange, onAssignAgent, availableAgents }: TicketCardProps) {
  const getStatusIcon = () => {
    switch (ticket.status) {
      case 'created':
      case 'ai_handling':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'escalated':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'in_progress':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'created':
      case 'ai_handling':
        return 'bg-blue-50 border-blue-200';
      case 'escalated':
        return 'bg-orange-50 border-orange-200';
      case 'in_progress':
        return 'bg-purple-50 border-purple-200';
      case 'resolved':
        return 'bg-green-50 border-green-200';
      case 'closed':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (ticket.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon()}
            <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
              {ticket.priority}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {ticket.description}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>#{ticket.id.slice(-8)}</span>
            <span>{ticket.category}</span>
            <span>{formatDistanceToNow(ticket.createdAt)} ago</span>
            {ticket.assignedAgent && (
              <span className="text-purple-600">
                Assigned to {ticket.assignedAgent}
              </span>
            )}
          </div>
        </div>

        <div className="ml-4">
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(e.target.value as Ticket['status'])}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Created</option>
            <option value="ai_handling">AI Handling</option>
            <option value="escalated">Escalated</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {ticket.status === 'escalated' && availableAgents.length > 0 && !ticket.assignedAgent && (
            <select
              onChange={(e) => e.target.value && onAssignAgent(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="">Assign to...</option>
              {availableAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {ticket.escalationReason && (
        <div className="mt-3 p-2 bg-orange-100 rounded text-sm text-orange-800">
          <strong>Escalation reason:</strong> {ticket.escalationReason}
        </div>
      )}
    </div>
  );
}