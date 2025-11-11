'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen">
        <ChatInterface className="h-full rounded-none sm:rounded-lg sm:shadow-lg sm:h-[600px] sm:my-8" />
      </div>
    </div>
  );
}