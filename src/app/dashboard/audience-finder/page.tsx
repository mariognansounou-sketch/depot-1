import type { Metadata } from "next";
import { AudienceFinderApp } from "@/modules/audience-finder/components/audience-finder-app";

export const metadata: Metadata = { title: "AI Audience Finder" };

export default function AudienceFinderPage() {
  return <AudienceFinderApp />;
}
