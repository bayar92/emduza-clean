'use client';

import useSWR from 'swr';
import TopNavView from './TopNavView';
import type { CustomMenuPage } from '@/utils/menuPages';
import { jsonFetcher } from '@/utils/swr';

/**
 * Top navigation for 'use client' pages, which cannot import the async Server
 * Component. Renders the built-in menu immediately and adds the admin-created
 * entries once /api/menuPages responds.
 */
export default function TopNavBarClient() {
  const { data } = useSWR<CustomMenuPage[]>('/api/menuPages', jsonFetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });
  return <TopNavView customPages={Array.isArray(data) ? data : []} />;
}
