import { NextRequest, NextResponse } from 'next/server';
import { Ticket } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assignedAgent = searchParams.get('assignedAgent');

    // Note: In a real app, this would fetch from a database
    // For now, we'll return a success response indicating the client should use local storage
    return NextResponse.json({
      message: 'Tickets are managed locally via localStorage',
      filters: {
        status,
        priority,
        category,
        assignedAgent
      }
    });
  } catch (error) {
    console.error('Tickets GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, sessionId, priority, category } = body;

    // Validate required fields
    if (!title || !description || !sessionId) {
      return NextResponse.json(
        { error: 'Title, description, and sessionId are required' },
        { status: 400 }
      );
    }

    // Create ticket object (client will handle storage)
    const ticket: Partial<Ticket> = {
      id: crypto.randomUUID(),
      title,
      description,
      status: 'created',
      priority: priority || 'medium',
      category: category || 'general',
      chatSessionId: sessionId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      ticket,
      message: 'Ticket created successfully'
    });
  } catch (error) {
    console.error('Tickets POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}