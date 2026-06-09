import { prisma } from '@/utils/prisma';
import FeaturedNewsClient from './FeaturedNewsClient';

// Client uses last 4 per tab × 4 tabs; 40 newest rows is plenty headroom
// without dragging the whole news table into the page payload.
const NEWS_FETCH_LIMIT = 40;

export default async function FeaturedNews() {
  // If Prisma can't connect (e.g. DATABASE_URL unset in a preview deploy),
  // fall back to an empty list instead of throwing the whole home page into
  // the error boundary. The client component renders an empty state.
  const news = await prisma.news
    .findMany({
      orderBy: { createdAt: 'desc' },
      take: NEWS_FETCH_LIMIT,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        date: true,
        category: true,
      },
    })
    .catch((err) => {
      console.error('FeaturedNews fetch failed:', err);
      return [];
    });

  // Client expects ascending order (it does slice(-4).reverse()), so flip back.
  const serialized = news
    .map((n) => ({
      ...n,
      date: n.date.toISOString(),
    }))
    .reverse();

  return <FeaturedNewsClient news={serialized} />;
}
