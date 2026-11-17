import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = NOINDEX;

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
