import { headers } from "next/headers";
import { PageFade } from "@/components/motion/PageFade";
import { isAdminHost } from "@/lib/admin-paths";

export default async function Template({ children }: { children: React.ReactNode }) {
  if (isAdminHost(await headers())) return children;
  return <PageFade>{children}</PageFade>;
}
