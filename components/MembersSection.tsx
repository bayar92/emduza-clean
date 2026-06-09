import { prisma } from '@/utils/prisma';
import MembersSectionClient from './MembersSectionClient';

export default async function MembersSection() {
  const rows = await prisma.members
    .findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true, position: true, image: true },
    })
    .catch((err) => {
      console.error('MembersSection fetch failed:', err);
      return [] as Array<{
        id: number;
        name: string | null;
        position: string;
        image: string | null;
      }>;
    });

  const members = rows.map((m) => ({
    id: m.id,
    name: m.name ?? '',
    position: m.position,
    image: m.image,
  }));

  return <MembersSectionClient members={members} />;
}
