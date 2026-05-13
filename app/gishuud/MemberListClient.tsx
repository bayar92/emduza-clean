'use client';

import { useEffect, useState } from 'react';
import MemberList, { Member } from './MemberList';
import DOMPurify from 'dompurify';

export default function MemberListClient({ members }: { members: Member[] }) {
  const [sanitizedMembers, setSanitizedMembers] = useState<Member[]>([]);

  useEffect(() => {
    const clean = members.map((m) => ({
      ...m,
      education: DOMPurify.sanitize(m.education ?? ''),
      company: DOMPurify.sanitize(m.company ?? ''),
      parlament: DOMPurify.sanitize(m.parlament ?? ''),
    }));

    setSanitizedMembers(clean);
  }, [members]);

  if (!sanitizedMembers.length) return <div>Loading...</div>;

  return <MemberList members={sanitizedMembers} />;
}
