import { NextRequest, NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/openai';
import { Message } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sessionId }: { messages: unknown[]; sessionId: string } = body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate message format
    const validMessages = messages.filter((msg: unknown) => {
      const message = msg as Record<string, unknown>;
      return message.content &&
        typeof message.content === 'string' &&
        ['user', 'assistant', 'system'].includes(message.role as string);
    });

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages found' },
        { status: 400 }
      );
    }

    // Parse messages to proper format
    const formattedMessages: Message[] = validMessages.map((msg: unknown) => {
      const message = msg as Record<string, unknown>;
      return {
        id: (message.id as string) || crypto.randomUUID(),
        content: message.content as string,
        role: message.role as 'user' | 'assistant' | 'system',
        timestamp: message.timestamp ? new Date(message.timestamp as string) : new Date(),
        metadata: message.metadata as Message['metadata']
      };
    });

    // Get AI response
    const aiResponse = await getChatCompletion(formattedMessages);

    return NextResponse.json({
      message: aiResponse.message,
      confidence: aiResponse.confidence,
      shouldEscalate: aiResponse.shouldEscalate,
      escalationReason: aiResponse.escalationReason,
      suggestedCategory: aiResponse.suggestedCategory,
      suggestedPriority: aiResponse.suggestedPriority,
      sessionId
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    // Return different error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured properly' },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error. Please try again later.',
        shouldEscalate: true,
        escalationReason: 'Technical error occurred'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'chat-api'
  });
}