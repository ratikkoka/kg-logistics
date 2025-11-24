import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
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

    // Get all leads for statistics
    const allLeads = await prisma.lead.findMany({
      select: {
        status: true,
        formType: true,
        createdAt: true,
        openQuote: true,
        enclosedQuote: true,
      },
    });

    // Calculate statistics
    const total = allLeads.length;
    const statusCounts = {
      NEW: allLeads.filter((l) => l.status === 'NEW').length,
      CONTACTED: allLeads.filter((l) => l.status === 'CONTACTED').length,
      QUOTED: allLeads.filter((l) => l.status === 'QUOTED').length,
      CONVERTED: allLeads.filter((l) => l.status === 'CONVERTED').length,
      LOST: allLeads.filter((l) => l.status === 'LOST').length,
    };

    const formTypeCounts = {
      CONTACT: allLeads.filter((l) => l.formType === 'CONTACT').length,
      SHIPPING_QUOTE: allLeads.filter((l) => l.formType === 'SHIPPING_QUOTE')
        .length,
    };

    // Calculate conversion rate
    const conversionRate =
      total > 0 ? ((statusCounts.CONVERTED / total) * 100).toFixed(1) : '0';

    // Calculate quotes with values
    const quotesWithValues = allLeads.filter(
      (l) => l.openQuote || l.enclosedQuote
    ).length;

    // Get leads from last 30 days
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLeads = allLeads.filter(
      (l) => new Date(l.createdAt) >= thirtyDaysAgo
    ).length;

    // Get leads from last 7 days
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyLeads = allLeads.filter(
      (l) => new Date(l.createdAt) >= sevenDaysAgo
    ).length;

    // Calculate quote value statistics
    const leadsWithOpenQuote = allLeads.filter(
      (l) => l.openQuote && l.openQuote.trim() !== ''
    );
    const leadsWithEnclosedQuote = allLeads.filter(
      (l) => l.enclosedQuote && l.enclosedQuote.trim() !== ''
    );

    const totalOpenQuoteValue = leadsWithOpenQuote.reduce((sum, lead) => {
      const value = parseFloat(lead.openQuote || '0');

      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    const totalEnclosedQuoteValue = leadsWithEnclosedQuote.reduce(
      (sum, lead) => {
        const value = parseFloat(lead.enclosedQuote || '0');

        return sum + (isNaN(value) ? 0 : value);
      },
      0
    );

    const avgOpenQuote =
      leadsWithOpenQuote.length > 0
        ? totalOpenQuoteValue / leadsWithOpenQuote.length
        : 0;

    const avgEnclosedQuote =
      leadsWithEnclosedQuote.length > 0
        ? totalEnclosedQuoteValue / leadsWithEnclosedQuote.length
        : 0;

    return NextResponse.json({
      total,
      statusCounts,
      formTypeCounts,
      conversionRate,
      quotesWithValues,
      recentLeads,
      weeklyLeads,
      avgOpenQuote: Math.round(avgOpenQuote),
      avgEnclosedQuote: Math.round(avgEnclosedQuote),
      totalOpenQuoteValue: Math.round(totalOpenQuoteValue),
      totalEnclosedQuoteValue: Math.round(totalEnclosedQuoteValue),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
