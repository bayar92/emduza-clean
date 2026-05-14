import { prisma } from '@/utils/prisma';
import VideoNewsClient from './VideoNewsClient';

export default async function VideoNews() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, videoPath: true },
  });

  return <VideoNewsClient videos={videos} />;
}
