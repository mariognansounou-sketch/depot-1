import type { Metadata } from "next";
import { CompetitorAnalyzerApp } from "@/modules/competitor-analyzer/components/competitor-analyzer-app";

export const metadata: Metadata = { title: "Competitor Intelligence AI" };

export default function CompetitorAnalyzerPage() {
  return <CompetitorAnalyzerApp />;
}
