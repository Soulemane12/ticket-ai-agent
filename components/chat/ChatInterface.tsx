'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Message } from '@/lib/types';
import { Send, Bot, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = '' }: ChatInterfaceProps) {
  const { addMessage, getCurrentChatSession, startNewChat, escalateChat } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = getCurrentChatSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    if (!currentSession) {
      startNewChat();
    }
  }, [currentSession, startNewChat]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentSession || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    addMessage(currentSession.id, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          messages: [...currentSession.messages, userMessage]
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          confidence: data.confidence,
          escalationTrigger: data.shouldEscalate
        }
      };

      addMessage(currentSession.id, assistantMessage);

      // Handle escalation if needed
      if (data.shouldEscalate) {
        setTimeout(() => {
          escalateChat(currentSession.id, data.escalationReason || 'AI recommended escalation');
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'I apologize, but I encountered an error. Let me connect you with a human agent.',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          confidence: 0,
          escalationTrigger: true
        }
      };

      addMessage(currentSession.id, errorMessage);
      escalateChat(currentSession.id, 'Technical error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Starting chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="font-semibold text-gray-900">Support Assistant</h2>
            <p className="text-sm text-gray-500">
              {currentSession.status === 'escalated'
                ? 'Connected to human agent'
                : 'AI-powered support'}
            </p>
          </div>
        </div>

        {currentSession.status === 'escalated' && (
          <div className="flex items-center space-x-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Escalated</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSession.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Support Chat
            </h3>
            <p>
              Hi! I&apos;m here to help you with your questions.
              You can ask me anything, and if I can&apos;t help,
              I&apos;ll connect you with a human agent.
            </p>
          </div>
        ) : (
          currentSession.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Bot className="h-6 w-6" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTextareaResize();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading || currentSession.status === 'escalated'}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || currentSession.status === 'escalated'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {currentSession.status === 'escalated' && (
          <p className="text-sm text-orange-600 mt-2">
            This conversation has been escalated to a human agent.
            They will respond shortly.
          </p>
        )}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-xs lg:max-w-md space-x-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isAssistant ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {isAssistant ? (
            <Bot className="h-5 w-5 text-blue-600" />
          ) : (
            <User className="h-5 w-5 text-gray-600" />
          )}
        </div>

        {/* Message bubble */}
        <div className="flex flex-col">
          <div className={`px-4 py-2 rounded-lg ${
            isAssistant
              ? 'bg-gray-100 text-gray-900'
              : 'bg-blue-500 text-white'
          }`}>
            <p className="whitespace-pre-wrap">{message.content}</p>

            {/* Confidence indicator for AI messages */}
            {isAssistant && message.metadata?.confidence !== undefined && (
              <div className="mt-2 flex items-center space-x-2">
                <div className={`h-1 w-12 rounded-full ${
                  message.metadata.confidence > 0.7
                    ? 'bg-green-400'
                    : message.metadata.confidence > 0.4
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}>
                  <div
                    className="h-full bg-gray-300 rounded-full"
                    style={{ width: `${message.metadata.confidence * 100}%` }}
                  />
                </div>
                {message.metadata.escalationTrigger && (
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {format(message.timestamp, 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}