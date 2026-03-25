// Owner email addresses (lowercase for comparison)
const OWNER_EMAILS = ['max.sokolvp@gmail.com', 'belovodvadim@gmail.com'];

/**
 * Check if the user is an owner (can create/edit/delete services)
 */
export function isOwner(user: any): boolean {
  if (!user?.email) {
    // Silently return false without warning if email is missing
    return false;
  }
  const userEmail = user.email.toLowerCase().trim();
  const isOwnerUser = OWNER_EMAILS.includes(userEmail);
  return isOwnerUser;
}

/**
 * Get owner emails
 */
export function getOwnerEmails(): string[] {
  return [...OWNER_EMAILS];
}