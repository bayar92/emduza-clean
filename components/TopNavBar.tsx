import TopNavView from './TopNavView';
import { getMenuPages } from '@/utils/menuPagesServer';

/**
 * Top navigation for Server Component pages: admin-created menu pages are read
 * from the database, so a new menu entry shows up on the next request. Client
 * pages must use TopNavBarClient instead.
 */
export default async function TopNavBar() {
  const customPages = await getMenuPages();
  return <TopNavView customPages={customPages} />;
}
