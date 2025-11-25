import type { FormType, LeadStatus } from '@prisma/client';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';

// GET /api/leads - List all leads with filters
export async function GET(request: Request) {
  try {
    // Check authentication
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
      return NextResponse.json(
        { error: 'Forbidden - User does not have access' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LeadStatus | null;
    const formType = searchParams.get('formType') as FormType | null;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      status?: LeadStatus;
      formType?: FormType;
      OR?: Array<{
        firstName?: { contains: string; mode: 'insensitive' };
        lastName?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        phone?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (status) {
      where.status = status;
    }

    if (formType) {
      where.formType = formType;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          emails: {
            orderBy: { sentAt: 'desc' },
            take: 1, // Get most recent email
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log full error details for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
    });

    // In production, return a more helpful error message
    const isProduction = process.env.NODE_ENV === 'production';

    return NextResponse.json(
      {
        error: 'Failed to fetch leads',
        ...(isProduction
          ? {
              message: errorMessage,
              // Include error type to help debug
              type: error instanceof Error ? error.name : 'UnknownError',
            }
          : {
              details: errorMessage,
              stack: errorStack,
            }),
      },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.formType) {
      return NextResponse.json(
        { error: 'formType is required' },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        formType: body.formType,
        status: body.status || 'NEW',
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        email: body.email || null,
        phone: body.phone || null,
        // Vehicle info
        vin: body.vin || null,
        year: body.year || null,
        make: body.make || null,
        model: body.model || null,
        transportType: body.transportType || null,
        // Address info
        pickupDate: body.pickupDate ? new Date(body.pickupDate) : null,
        dropoffDate: body.dropoffDate ? new Date(body.dropoffDate) : null,
        pickupAddress: body.pickupAddress || null,
        pickupCity: body.pickupCity || null,
        pickupState: body.pickupState || null,
        pickupZip: body.pickupZip || null,
        dropoffAddress: body.dropoffAddress || null,
        dropoffCity: body.dropoffCity || null,
        dropoffState: body.dropoffState || null,
        dropoffZip: body.dropoffZip || null,
        // Quotes
        openQuote: body.openQuote || null,
        enclosedQuote: body.enclosedQuote || null,
        // Message
        message: body.message || null,
        // Notes
        notes: body.notes || null,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);

    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
