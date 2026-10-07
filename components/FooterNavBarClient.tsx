'use client';

import useSWR from 'swr';
import FooterView from './FooterView';
import { DEFAULT_CONTACT, type ContactInfoData } from '@/utils/contact';
import { jsonFetcher } from '@/utils/swr';

/**
 * Footer for 'use client' pages, which cannot import the async Server
 * Component. Renders the defaults immediately and swaps in the saved contact
 * details once /api/contact responds.
 */
export default function FooterNavBarClient() {
  const { data } = useSWR<ContactInfoData>('/api/contact', jsonFetcher, {
    fallbackData: DEFAULT_CONTACT,
    revalidateOnFocus: false,
  });
  return <FooterView contact={data ?? DEFAULT_CONTACT} />;
}
