import FooterView from './FooterView';
import { getContactInfo } from '@/utils/contactServer';

/**
 * Site footer for Server Component pages: contact details come straight from
 * the database, so an admin edit is visible on the next request with no
 * flash of stale text. Client pages must use FooterNavBarClient instead.
 */
export default async function FooterNavBar() {
  const contact = await getContactInfo();
  return <FooterView contact={contact} />;
}
