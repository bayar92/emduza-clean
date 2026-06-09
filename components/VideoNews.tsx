import { prisma } from '@/utils/prisma';
import VideoNewsClient from './VideoNewsClient';

// Home page video carousel only needs the most recent handful.
const VIDEO_FETCH_LIMIT = 10;

export default async function VideoNews() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    take: VIDEO_FETCH_LIMIT,
    select: { id: true, title: true, videoPath: true },
  });

  return <VideoNewsClient videos={videos} />;
}
