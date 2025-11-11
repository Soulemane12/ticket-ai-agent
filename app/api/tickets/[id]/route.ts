import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Note: In a real app, this would fetch from a database
    return NextResponse.json({
      message: 'Ticket details are managed locally via localStorage',
      ticketId
    });
  } catch (error) {
    console.error('Ticket GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Validate update fields
    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'category',
      'assignedAgent',
      'escalationReason'
    ];

    const updates = Object.keys(body).reduce((acc: Record<string, unknown>, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = body[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add update timestamp
    updates.updatedAt = new Date();

    // If status is being set to resolved/closed, add resolved timestamp
    if (updates.status && ['resolved', 'closed'].includes(updates.status as string)) {
      updates.resolvedAt = new Date();
    }

    return NextResponse.json({
      ticketId,
      updates,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Ticket PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ticketId,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Ticket DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}