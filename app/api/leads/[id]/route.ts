import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';

const sanitizeQuoteValue = (value: unknown) => {
  if (typeof value !== 'string') return null;

  const digitsOnly = value.replace(/\D/g, '');

  return digitsOnly.length > 0 ? digitsOnly : null;
};

// GET /api/leads/[id] - Get a single lead
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        emails: {
          orderBy: { sentAt: 'desc' },
          include: {
            template: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);

    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id] - Update a lead
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update lead
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as LeadStatus }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
        ...(body.lastContactedAt && {
          lastContactedAt: new Date(body.lastContactedAt),
        }),
        // Allow updating any other fields
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.message !== undefined && { message: body.message }),
        ...(body.openQuote !== undefined && {
          openQuote: sanitizeQuoteValue(body.openQuote),
        }),
        ...(body.enclosedQuote !== undefined && {
          enclosedQuote: sanitizeQuoteValue(body.enclosedQuote),
        }),
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);

    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);

    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
