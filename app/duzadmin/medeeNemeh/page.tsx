export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import MedeeNemehClient from "./MedeeNemehClient";

export default function Page() {
  return <MedeeNemehClient />;
}
