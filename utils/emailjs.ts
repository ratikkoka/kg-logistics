// EmailJS utility with error handling

import emailjs from '@emailjs/browser';

export interface EmailJSError {
  text: string;
  status: number;
}

export const sendEmail = async (
  serviceId: string,
  templateId: string,
  templateParams: Record<string, unknown>,
  publicKey: string
): Promise<{ success: boolean; error?: EmailJSError }> => {
  // Validate environment variables
  if (!serviceId || !templateId || !publicKey) {
    return {
      success: false,
      error: {
        text: 'Email service configuration is missing. Please contact support.',
        status: 500,
      },
    };
  }

  try {
    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
    });

    return { success: true };
  } catch (error) {
    console.error('EmailJS error:', error);

    return {
      success: false,
      error: {
        text:
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'text' in error
              ? String((error as { text: unknown }).text)
              : 'Failed to send email. Please try again later.',
        status:
          error instanceof Error && 'status' in error
            ? Number((error as { status: unknown }).status)
            : 500,
      },
    };
  }
};
