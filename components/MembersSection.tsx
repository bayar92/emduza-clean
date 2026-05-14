import { prisma } from '@/utils/prisma';
import MembersSectionClient from './MembersSectionClient';

export default async function MembersSection() {
  const rows = await prisma.members.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, position: true, image: true },
  });

  const members = rows.map((m) => ({
    id: m.id,
    name: m.name ?? '',
    position: m.position,
    image: m.image,
  }));

  return <MembersSectionClient members={members} />;
}
