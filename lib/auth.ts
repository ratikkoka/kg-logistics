import { prisma } from '@/lib/prisma';

/**
 * Check if a user is authorized to access the admin dashboard
 * @param userId - Supabase Auth user ID
 * @returns true if user is authorized, false otherwise
 */
export async function isUserAuthorized(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { hasAccess: true },
    });

    return profile?.hasAccess ?? false;
  } catch (error) {
    console.error('Error checking user authorization:', error);

    return false;
  }
}

/**
 * Get all user profiles with their auth data
 * Note: This requires querying Supabase Admin API for user emails
 */
export async function getUserProfiles() {
  return await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Grant access to a user
 */
export async function grantUserAccess(userId: string) {
  return await prisma.profile.update({
    where: { id: userId },
    data: { hasAccess: true },
  });
}

/**
 * Revoke access from a user
 */
export async function revokeUserAccess(userId: string) {
  return await prisma.profile.update({
    where: { id: userId },
    data: { hasAccess: false },
  });
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  data: { hasAccess?: boolean; name?: string }
) {
  const updateData: any = {};

  if (data.hasAccess !== undefined) updateData.hasAccess = data.hasAccess;
  if (data.name !== undefined) updateData.name = data.name;

  return await prisma.profile.update({
    where: { id: userId },
    data: updateData,
  });
}
