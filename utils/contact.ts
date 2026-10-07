/**
 * Public contact details shown in the site footer. This file is pure (no
 * database / server imports) so both server and client components can use it.
 */

export type ContactInfoData = {
  address: string;
  phone: string;
  email: string;
  /** Display name of the organisation's social media page. Optional. */
  socialName: string;
  /** Link to that page. Optional; only http(s) URLs are accepted. */
  socialUrl: string;
};

/**
 * Shown until an admin saves something (and whenever the database is
 * unreachable), so the footer is never empty.
 */
export const DEFAULT_CONTACT: ContactInfoData = {
  address:
    'Чингисийн өргөн чөлөө, Хан-Уул дүүрэг 20-р хороо УБ хот- 17032, Монгол улс',
  phone: '77135051',
  email: 'emduz@gov.mn',
  socialName: 'Эрүүл мэндийн даатгалын үндэсний зөвлөл',
  socialUrl: '',
};

export const CONTACT_LIMITS = {
  address: 300,
  phone: 60,
  email: 254,
  socialName: 150,
  socialUrl: 500,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_RE = /^[0-9+\-()\s,;/.]+$/;

/** Returns the URL only if it is a well-formed http(s) URL, otherwise null. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

/** `tel:` link for the first number in a possibly multi-number string. */
export function telHref(phone: string): string | null {
  const first = phone.split(/[,;/]/)[0] ?? '';
  const digits = first.replace(/[^\d+]/g, '');
  return /\d/.test(digits) ? `tel:${digits}` : null;
}

export function mailtoHref(email: string): string | null {
  const v = email.trim();
  return EMAIL_RE.test(v) ? `mailto:${v}` : null;
}

export type ContactValidation =
  | { ok: true; data: ContactInfoData }
  | { ok: false; error: string };

/** Validates and normalises (trims) untrusted input from the admin form. */
export function validateContactInput(input: unknown): ContactValidation {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Буруу хүсэлт байна.' };
  }
  const raw = input as Record<string, unknown>;
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string).trim() : '');

  const data: ContactInfoData = {
    address: str('address'),
    phone: str('phone'),
    email: str('email'),
    socialName: str('socialName'),
    socialUrl: str('socialUrl'),
  };

  if (!data.address) return { ok: false, error: 'Хаягаа оруулна уу.' };
  if (!data.phone) return { ok: false, error: 'Утасны дугаараа оруулна уу.' };
  if (!data.email) return { ok: false, error: 'Цахим шуудангийн хаягаа оруулна уу.' };

  for (const key of Object.keys(CONTACT_LIMITS) as (keyof typeof CONTACT_LIMITS)[]) {
    if (data[key].length > CONTACT_LIMITS[key]) {
      return { ok: false, error: `Хэт урт байна (дээд тал нь ${CONTACT_LIMITS[key]} тэмдэгт).` };
    }
  }

  if (!PHONE_CHARS_RE.test(data.phone) || data.phone.replace(/\D/g, '').length < 6) {
    return {
      ok: false,
      error: 'Утасны дугаар зөвхөн тоо, +, -, (, ), таслал агуулах ба 6-аас доошгүй орон байх ёстой.',
    };
  }
  if (!EMAIL_RE.test(data.email)) {
    return { ok: false, error: 'Цахим шуудангийн хаяг буруу байна.' };
  }
  if (data.socialUrl && !safeHttpUrl(data.socialUrl)) {
    return { ok: false, error: 'Холбоос нь http:// эсвэл https:// гэж эхлэх ёстой.' };
  }

  return { ok: true, data };
}
