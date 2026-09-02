import type { Metadata } from "next";
import { UsShell } from "@/components/us/UsShell";
import "./us.css";

export const metadata: Metadata = {
  title: "Us",
  description: "A small private world for two.",
  robots: { index: false, follow: false },
};

export default function UsLayout({ children }: LayoutProps<"/us">) {
  return <UsShell>{children}</UsShell>;
}
