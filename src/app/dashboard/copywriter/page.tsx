import type { Metadata } from "next";
import { CopywriterApp } from "@/modules/copywriter/components/copywriter-app";

export const metadata: Metadata = { title: "AI Copywriter E-commerce" };

export default function CopywriterPage() {
  return <CopywriterApp />;
}
