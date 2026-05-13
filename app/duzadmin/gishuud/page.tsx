export const runtime = "edge";
export const preferredRegion = "auto";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import GishuudClient from "./GishuudPage";

export default function Page() {
  return <GishuudClient />;
}
