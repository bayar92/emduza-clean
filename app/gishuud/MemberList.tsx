"use client";

import Section from "./Section";

export interface Member {
  id: number;
  name: string | null;
  image: string | null;
  position: string | null;
  education: string | null;
  company: string | null;
  parlament: string | null;
}

const groups = [
  {
    key: "Засгийн газрын төлөөлөл",
    title: "Засгийн газрыг төлөөлсөн гишүүд",
    color: "bg-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
  {
    key: "Даатгуулагчийн төлөөлөл",
    title: "Даатгуулагчийг төлөөлсөн гишүүд",
    color: "bg-purple-600",
    badge: "bg-purple-50 text-purple-700",
  },
  {
    key: "Ажил олгогчийн төлөөлөл",
    title: "Ажил олгогчийг төлөөлсөн гишүүд",
    color: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700",
  },
];

export default function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="flex-1 min-w-0">
      {groups.map((g) => (
        <Section
          key={g.key}
          title={g.title}
          color={g.color}
          members={members.filter((m) => m.position === g.key)}
        />
      ))}
    </div>
  );
}
