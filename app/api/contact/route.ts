import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { isAdminRequest } from '@/utils/requireAdmin';
import { validateContactInput } from '@/utils/contact';
import { getContactInfo } from '@/utils/contactServer';

/** Public: the footer and any client component can read the contact details. */
export async function GET() {
  return NextResponse.json(await getContactInfo());
}

/**
 * Admin only. proxy.ts already guards non-GET /api/contact requests, but this
 * is the data shown to every visitor (a forged phone number or e-mail would be
 * an effective scam vector), so the token is verified again here.
 */
export async function PUT(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = validateContactInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const saved = await prisma.contactInfo.upsert({
      where: { id: 1 },
      create: { id: 1, ...parsed.data },
      update: parsed.data,
    });

    // The footer is on every public page.
    revalidatePath('/', 'layout');

    return NextResponse.json({
      address: saved.address,
      phone: saved.phone,
      email: saved.email,
      socialName: saved.socialName,
      socialUrl: saved.socialUrl,
    });
  } catch (err) {
    console.error('PUT contact error:', err);
    return NextResponse.json({ error: 'Хадгалахад алдаа гарлаа' }, { status: 500 });
  }
}
