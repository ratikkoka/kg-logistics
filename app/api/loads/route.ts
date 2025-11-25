import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';

type LoadStatus =
  | 'UNLISTED'
  | 'LISTED'
  | 'CARRIER_ASSIGNED'
  | 'PICKED_UP'
  | 'COMPLETED';
type LoadType = 'OPEN' | 'ENCLOSED';

// GET /api/loads - List all loads with filters
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LoadStatus | null;
    const loadType = searchParams.get('loadType') as LoadType | null;
    const leadId = searchParams.get('leadId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      ...(status && { status }),
      ...(loadType && { loadType }),
      ...(leadId && { leadId }),
    };

    if (status) {
      where.status = status;
    }

    if (loadType) {
      where.loadType = loadType;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { year: { contains: search, mode: 'insensitive' } },
        { carrierName: { contains: search, mode: 'insensitive' } },
        { pickupContactName: { contains: search, mode: 'insensitive' } },
        { dropoffContactName: { contains: search, mode: 'insensitive' } },
        {
          lead: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Get loads with pagination
    const [loads, total] = await Promise.all([
      prisma.load.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.load.count({ where }),
    ]);

    return NextResponse.json({
      loads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching loads:', error);

    return NextResponse.json(
      { error: 'Failed to fetch loads' },
      { status: 500 }
    );
  }
}

// POST /api/loads - Create a new load from a lead
export async function POST(request: Request) {
  try {
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
    const { leadId, loadType } = body;

    if (!leadId || !loadType) {
      return NextResponse.json(
        { error: 'leadId and loadType are required' },
        { status: 400 }
      );
    }

    // Verify loadType is either OPEN or ENCLOSED
    if (loadType !== 'OPEN' && loadType !== 'ENCLOSED') {
      return NextResponse.json(
        { error: 'loadType must be either OPEN or ENCLOSED' },
        { status: 400 }
      );
    }

    // Check if lead exists and get its data
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if load already exists for this lead
    const existingLoad = await prisma.load.findUnique({
      where: { leadId },
    });

    if (existingLoad) {
      return NextResponse.json(
        { error: 'Load already exists for this lead' },
        { status: 409 }
      );
    }

    // Create load from lead data
    const load = await prisma.load.create({
      data: {
        leadId,
        loadType: loadType as LoadType,
        // Vehicle info from lead
        vin: lead.vin,
        year: lead.year,
        make: lead.make,
        model: lead.model,
        // Address info from lead
        pickupDate: lead.pickupDate,
        dropoffDate: lead.dropoffDate,
        pickupAddress: lead.pickupAddress,
        pickupCity: lead.pickupCity,
        pickupState: lead.pickupState,
        pickupZip: lead.pickupZip,
        dropoffAddress: lead.dropoffAddress,
        dropoffCity: lead.dropoffCity,
        dropoffState: lead.dropoffState,
        dropoffZip: lead.dropoffZip,
        assignedTo: user.id,
      },
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

    // Update lead status to CONVERTED
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONVERTED' },
    });

    return NextResponse.json(load, { status: 201 });
  } catch (error) {
    console.error('Error creating load:', error);

    return NextResponse.json(
      { error: 'Failed to create load' },
      { status: 500 }
    );
  }
}
