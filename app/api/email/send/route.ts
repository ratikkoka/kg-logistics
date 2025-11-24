import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Helper function to replace template variables
function replaceTemplateVariables(
  template: string,
  lead: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    openQuote: string | null;
    enclosedQuote: string | null;
    year: string | null;
    make: string | null;
    model: string | null;
    pickupAddress: string | null;
    pickupCity: string | null;
    pickupState: string | null;
    dropoffAddress: string | null;
    dropoffCity: string | null;
    dropoffState: string | null;
  }
): string {
  const name =
    `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
    'Valued Customer';
  const vehicle =
    lead.make && lead.model
      ? `${lead.year || ''} ${lead.make} ${lead.model}`.trim()
      : 'your vehicle';
  const pickupLocation = lead.pickupAddress
    ? `${lead.pickupAddress}${lead.pickupCity ? `, ${lead.pickupCity}` : ''}${lead.pickupState ? `, ${lead.pickupState}` : ''}`
    : 'pickup location';
  const dropoffLocation = lead.dropoffAddress
    ? `${lead.dropoffAddress}${lead.dropoffCity ? `, ${lead.dropoffCity}` : ''}${lead.dropoffState ? `, ${lead.dropoffState}` : ''}`
    : 'drop-off location';
  const sanitizedOpenQuote = lead.openQuote
    ? lead.openQuote.replace(/\D/g, '')
    : '';
  const sanitizedEnclosedQuote = lead.enclosedQuote
    ? lead.enclosedQuote.replace(/\D/g, '')
    : '';

  return template
    .replace(/\{\{lead\.name\}\}/g, name)
    .replace(/\{\{lead\.firstName\}\}/g, lead.firstName || '')
    .replace(/\{\{lead\.lastName\}\}/g, lead.lastName || '')
    .replace(/\{\{lead\.email\}\}/g, lead.email)
    .replace(/\{\{lead\.phone\}\}/g, lead.phone || '')
    .replace(/\{\{lead\.vehicle\}\}/g, vehicle)
    .replace(/\{\{lead\.year\}\}/g, lead.year || '')
    .replace(/\{\{lead\.make\}\}/g, lead.make || '')
    .replace(/\{\{lead\.model\}\}/g, lead.model || '')
    .replace(/\{\{lead\.pickupLocation\}\}/g, pickupLocation)
    .replace(/\{\{lead\.dropoffLocation\}\}/g, dropoffLocation)
    .replace(/\{\{lead\.openQuote\}\}/g, sanitizedOpenQuote)
    .replace(/\{\{lead\.enclosedQuote\}\}/g, sanitizedEnclosedQuote);
}

// POST /api/email/send - Send an email to a lead
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      leadId,
      templateId,
      subject,
      body: emailBody,
      customSubject,
      customBody,
    } = body;

    if (!leadId || (!templateId && (!subject || !emailBody))) {
      return NextResponse.json(
        {
          error: 'Lead ID and either template ID or subject/body are required',
        },
        { status: 400 }
      );
    }

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    let finalSubject = subject || customSubject;
    let finalBody = emailBody || customBody;

    // If using a template, get it and replace variables
    if (templateId) {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }

      finalSubject = replaceTemplateVariables(template.subject, lead);
      finalBody = replaceTemplateVariables(template.body, lead);
    } else {
      // Replace variables in custom subject/body too
      finalSubject = replaceTemplateVariables(finalSubject, lead);
      finalBody = replaceTemplateVariables(finalBody, lead);
    }

    // Send email using Resend
    let emailSent = false;

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Convert line breaks to HTML
        const htmlBody = finalBody.replace(/\n/g, '<br>');

        const { error } = await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ||
            'KG Logistics <onboarding@resend.dev>',
          to: lead.email,
          subject: finalSubject,
          html: htmlBody,
        });

        if (error) {
          console.error('Resend error:', error);
          // Still save to history even if sending fails
        } else {
          emailSent = true;
        }
      } catch (resendError) {
        console.error('Error sending email via Resend:', resendError);
        // Still save to history even if sending fails
      }
    }

    // Save to email history
    const emailHistory = await prisma.emailHistory.create({
      data: {
        leadId: lead.id,
        templateId: templateId || null,
        sentTo: lead.email,
        subject: finalSubject,
        body: finalBody,
        sentBy: user.id,
      },
    });

    // Update lead's last contacted date
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        lastContactedAt: new Date(),
        status: lead.status === 'NEW' ? 'CONTACTED' : lead.status,
      },
    });

    return NextResponse.json({
      success: true,
      emailHistory,
      emailSent,
      message: emailSent
        ? 'Email sent successfully'
        : process.env.RESEND_API_KEY
          ? 'Email saved to history but sending failed - check logs'
          : 'Email saved to history - configure RESEND_API_KEY to send emails',
    });
  } catch (error) {
    console.error('Error sending email:', error);

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
