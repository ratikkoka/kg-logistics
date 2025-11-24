import type { LoadStatus } from '@prisma/client';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';

// GET /api/loads/[id] - Get a single load
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

    // Check if requesting user is authorized
    const authorized = await isUserAuthorized(user.id);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const load = await prisma.load.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 });
    }

    return NextResponse.json(load);
  } catch (error) {
    console.error('Error fetching load:', error);

    return NextResponse.json(
      { error: 'Failed to fetch load' },
      { status: 500 }
    );
  }
}

// PATCH /api/loads/[id] - Update a load
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

    // Check if requesting user is authorized
    const authorized = await isUserAuthorized(user.id);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Helper to sanitize cost values (numeric only)
    const sanitizeCost = (value: string | null | undefined): string | null => {
      if (!value) return null;
      // Remove all non-numeric characters
      const numeric = value.replace(/\D/g, '');

      return numeric || null;
    };

    // Build update data
    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status as LoadStatus;
      // If status is COMPLETED, set completedAt
      if (body.status === 'COMPLETED' && !body.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (body.loadType !== undefined) updateData.loadType = body.loadType;
    if (body.pickupContactName !== undefined)
      updateData.pickupContactName = body.pickupContactName;
    if (body.pickupContactPhone !== undefined)
      updateData.pickupContactPhone = body.pickupContactPhone;
    if (body.dropoffContactName !== undefined)
      updateData.dropoffContactName = body.dropoffContactName;
    if (body.dropoffContactPhone !== undefined)
      updateData.dropoffContactPhone = body.dropoffContactPhone;
    if (body.quotedCost !== undefined)
      updateData.quotedCost = sanitizeCost(body.quotedCost);
    if (body.carrierCost !== undefined)
      updateData.carrierCost = sanitizeCost(body.carrierCost);
    if (body.carrierName !== undefined)
      updateData.carrierName = body.carrierName;

    // Update vehicle/address info if provided
    if (body.vin !== undefined) updateData.vin = body.vin;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.make !== undefined) updateData.make = body.make;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.pickupDate !== undefined)
      updateData.pickupDate = body.pickupDate
        ? new Date(body.pickupDate)
        : null;
    if (body.dropoffDate !== undefined)
      updateData.dropoffDate = body.dropoffDate
        ? new Date(body.dropoffDate)
        : null;
    if (body.pickupAddress !== undefined)
      updateData.pickupAddress = body.pickupAddress;
    if (body.pickupCity !== undefined) updateData.pickupCity = body.pickupCity;
    if (body.pickupState !== undefined)
      updateData.pickupState = body.pickupState;
    if (body.pickupZip !== undefined) updateData.pickupZip = body.pickupZip;
    if (body.dropoffAddress !== undefined)
      updateData.dropoffAddress = body.dropoffAddress;
    if (body.dropoffCity !== undefined)
      updateData.dropoffCity = body.dropoffCity;
    if (body.dropoffState !== undefined)
      updateData.dropoffState = body.dropoffState;
    if (body.dropoffZip !== undefined) updateData.dropoffZip = body.dropoffZip;

    const updatedLoad = await prisma.load.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(updatedLoad);
  } catch (error) {
    console.error('Error updating load:', error);

    return NextResponse.json(
      { error: 'Failed to update load' },
      { status: 500 }
    );
  }
}

// DELETE /api/loads/[id] - Delete a load
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

    // Check if requesting user is authorized
    const authorized = await isUserAuthorized(user.id);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.load.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting load:', error);

    return NextResponse.json(
      { error: 'Failed to delete load' },
      { status: 500 }
    );
  }
}
