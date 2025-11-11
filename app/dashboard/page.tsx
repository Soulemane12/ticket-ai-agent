'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TicketList } from '@/components/tickets/TicketList';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'escalated' | 'all'>('overview');

  // Calculate stats
  const totalTickets = state.tickets.length;
  const escalatedTickets = state.tickets.filter(t => t.status === 'escalated').length;
  const resolvedTickets = state.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const activeTickets = state.tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;

  const availableAgents = state.agents.filter(a => a.status === 'available').length;
  const busyAgents = state.agents.filter(a => a.status === 'busy').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
            <p className="text-gray-500">Manage tickets and customer support</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<TrendingUp className="h-8 w-8" />}
            color="blue"
          />
          <StatCard
            title="Escalated"
            value={escalatedTickets}
            icon={<AlertTriangle className="h-8 w-8" />}
            color="orange"
            highlight={escalatedTickets > 0}
          />
          <StatCard
            title="Resolved"
            value={resolvedTickets}
            icon={<CheckCircle className="h-8 w-8" />}
            color="green"
          />
          <StatCard
            title="Active"
            value={activeTickets}
            icon={<Clock className="h-8 w-8" />}
            color="purple"
          />
        </div>

        {/* Agent Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Available: {availableAgents}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Busy: {busyAgents}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Offline: {state.agents.filter(a => a.status === 'offline').length}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Agents</h3>
            <div className="space-y-2">
              {state.agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      agent.status === 'available' ? 'bg-green-500' :
                      agent.status === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium">{agent.name}</span>
                    <span className="text-sm text-gray-500">{agent.email}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {agent.activeTickets.length} active tickets
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('escalated')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'escalated'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Escalated ({escalatedTickets})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Tickets
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <TicketList
                  showEscalatedOnly={false}
                  className="max-h-96 overflow-y-auto"
                />
              </div>
            )}

            {activeTab === 'escalated' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Escalated Tickets
                </h2>
                <TicketList showEscalatedOnly={true} />
              </div>
            )}

            {activeTab === 'all' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  All Tickets
                </h2>
                <TicketList showEscalatedOnly={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'green' | 'purple';
  highlight?: boolean;
}

function StatCard({ title, value, icon, color, highlight = false }: StatCardProps) {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    orange: 'text-orange-600 bg-orange-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow ${highlight ? 'ring-2 ring-orange-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}