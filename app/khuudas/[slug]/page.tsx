import { notFound } from 'next/navigation';
import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import CustomPageView from '@/components/CustomPageView';
import { getPublishedPage } from '@/utils/menuPagesServer';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug).catch(() => null);
  return { title: page ? `${page.title} | ЭМДҮЗ` : 'Хуудас олдсонгүй' };
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavBar />
      {/* content is sanitized on write (see /api/menuPages) */}
      <CustomPageView title={page.title} html={page.content} />
      <FooterNavBar />
    </div>
  );
}
