'use client';

import { useMemo } from 'react';
import MemberList, { Member } from './MemberList';
import DOMPurify from 'dompurify';

export default function MemberListClient({ members }: { members: Member[] }) {
  const sanitizedMembers = useMemo<Member[]>(() => {
    if (typeof window === 'undefined') return members;
    return members.map((m) => ({
      ...m,
      education: DOMPurify.sanitize(m.education ?? ''),
      company: DOMPurify.sanitize(m.company ?? ''),
      parlament: DOMPurify.sanitize(m.parlament ?? ''),
    }));
  }, [members]);

  if (!sanitizedMembers.length) return <div>Loading...</div>;

  return <MemberList members={sanitizedMembers} />;
}
