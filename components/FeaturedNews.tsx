import { prisma } from '@/utils/prisma';
import FeaturedNewsClient from './FeaturedNewsClient';

export default async function FeaturedNews() {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      date: true,
      category: true,
    },
  });

  const serialized = news.map((n) => ({
    ...n,
    date: n.date.toISOString(),
  }));

  return <FeaturedNewsClient news={serialized} />;
}
