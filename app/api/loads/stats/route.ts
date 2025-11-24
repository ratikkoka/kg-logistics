import type { LoadStatus, LoadType } from '@prisma/client';

import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/loads/stats - Get load dashboard statistics
export async function GET(request: Request) {
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

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LoadStatus | null;
    const loadType = searchParams.get('loadType') as LoadType | null;
    const search = searchParams.get('search') || '';

    // Build where clause for filtering
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (loadType) {
      where.loadType = loadType;
    }

    // Add search filter if provided
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

    // Get filtered loads for statistics
    const allLoads = await prisma.load.findMany({
      where,
      select: {
        status: true,
        loadType: true,
        quotedCost: true,
        carrierCost: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Calculate basic counts
    const total = allLoads.length;
    const statusCounts = {
      UNLISTED: allLoads.filter((l) => l.status === 'UNLISTED').length,
      LISTED: allLoads.filter((l) => l.status === 'LISTED').length,
      CARRIER_ASSIGNED: allLoads.filter((l) => l.status === 'CARRIER_ASSIGNED')
        .length,
      PICKED_UP: allLoads.filter((l) => l.status === 'PICKED_UP').length,
      COMPLETED: allLoads.filter((l) => l.status === 'COMPLETED').length,
    };

    const loadTypeCounts = {
      OPEN: allLoads.filter((l) => l.loadType === 'OPEN').length,
      ENCLOSED: allLoads.filter((l) => l.loadType === 'ENCLOSED').length,
    };

    // Calculate financial metrics
    const completedLoads = allLoads.filter((l) => l.status === 'COMPLETED');

    // Total income (sum of quotedCost for completed loads)
    const totalIncome = completedLoads.reduce((sum, load) => {
      if (load.quotedCost) {
        const cost = parseFloat(load.quotedCost);

        return sum + (isNaN(cost) ? 0 : cost);
      }

      return sum;
    }, 0);

    // Total profit (sum of profit for completed loads)
    const totalProfit = completedLoads.reduce((sum, load) => {
      if (load.quotedCost && load.carrierCost) {
        const quoted = parseFloat(load.quotedCost);
        const carrier = parseFloat(load.carrierCost);

        if (!isNaN(quoted) && !isNaN(carrier)) {
          return sum + (quoted - carrier);
        }
      }

      return sum;
    }, 0);

    // Average profit per completed load
    const avgProfit =
      completedLoads.length > 0 ? totalProfit / completedLoads.length : 0;

    // Total revenue (all loads with quotes, not just completed)
    const totalRevenue = allLoads.reduce((sum, load) => {
      if (load.quotedCost) {
        const cost = parseFloat(load.quotedCost);

        return sum + (isNaN(cost) ? 0 : cost);
      }

      return sum;
    }, 0);

    // Total carrier costs (all loads with carrier costs)
    const totalCarrierCosts = allLoads.reduce((sum, load) => {
      if (load.carrierCost) {
        const cost = parseFloat(load.carrierCost);

        return sum + (isNaN(cost) ? 0 : cost);
      }

      return sum;
    }, 0);

    // Profit margin (percentage) - only for completed loads with both quoted and carrier costs
    const completedLoadsWithBothCosts = completedLoads.filter(
      (l) => l.quotedCost && l.carrierCost
    );
    const profitMargin =
      completedLoadsWithBothCosts.length > 0
        ? completedLoadsWithBothCosts.reduce((sum, load) => {
            const quoted = parseFloat(load.quotedCost!);
            const carrier = parseFloat(load.carrierCost!);

            if (!isNaN(quoted) && !isNaN(carrier) && quoted > 0) {
              return sum + ((quoted - carrier) / quoted) * 100;
            }

            return sum;
          }, 0) / completedLoadsWithBothCosts.length
        : 0;

    // Completion rate
    const completionRate =
      total > 0 ? ((statusCounts.COMPLETED / total) * 100).toFixed(1) : '0';

    // Get loads from last 30 days
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLoads = allLoads.filter(
      (l) => new Date(l.createdAt) >= thirtyDaysAgo
    ).length;

    // Get loads from last 7 days
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLoads = allLoads.filter(
      (l) => new Date(l.createdAt) >= sevenDaysAgo
    ).length;

    // Average days to complete (for completed loads)
    const completedWithDates = completedLoads.filter(
      (l) => l.createdAt && l.completedAt
    );
    const avgDaysToComplete =
      completedWithDates.length > 0
        ? completedWithDates.reduce((sum, load) => {
            const created = new Date(load.createdAt);
            const completed = new Date(load.completedAt!);
            const days = Math.ceil(
              (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
            );

            return sum + days;
          }, 0) / completedWithDates.length
        : 0;

    return NextResponse.json({
      total,
      statusCounts,
      loadTypeCounts,
      totalIncome,
      totalProfit,
      avgProfit,
      totalRevenue,
      totalCarrierCosts,
      profitMargin: profitMargin.toFixed(1),
      completionRate,
      recentLoads,
      weeklyLoads,
      avgDaysToComplete: avgDaysToComplete.toFixed(1),
      completedCount: statusCounts.COMPLETED,
    });
  } catch (error) {
    console.error('Error fetching load stats:', error);

    return NextResponse.json(
      { error: 'Failed to fetch load stats' },
      { status: 500 }
    );
  }
}
