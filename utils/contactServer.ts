import { prisma } from '@/utils/prisma';
import { DEFAULT_CONTACT, type ContactInfoData } from '@/utils/contact';

let loggedFailure = false;

/**
 * Contact details for the footer / public API. Never throws: if there is no
 * saved row yet, or the database (or the ContactInfo table, before the
 * migration is applied) is unavailable, the built-in defaults are returned so
 * every page keeps rendering.
 */
export async function getContactInfo(): Promise<ContactInfoData> {
  try {
    const row = await prisma.contactInfo.findUnique({ where: { id: 1 } });
    if (!row) return DEFAULT_CONTACT;
    return {
      address: row.address,
      phone: row.phone,
      email: row.email,
      socialName: row.socialName,
      socialUrl: row.socialUrl,
    };
  } catch (err) {
    // Every page render calls this, so log once instead of flooding the logs.
    if (!loggedFailure) {
      loggedFailure = true;
      console.error('getContactInfo failed, serving defaults:', err);
    }
    return DEFAULT_CONTACT;
  }
}
