import type { Metadata } from "next";
import { CreativeAnalyzerApp } from "@/modules/creative-analyzer/components/creative-analyzer-app";

export const metadata: Metadata = { title: "AI Creative Analyzer" };

export default function CreativeAnalyzerPage() {
  return <CreativeAnalyzerApp />;
}
