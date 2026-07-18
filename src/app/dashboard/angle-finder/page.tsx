import type { Metadata } from "next";
import { AngleFinderApp } from "@/modules/angle-finder/components/angle-finder-app";

export const metadata: Metadata = { title: "Angle Marketing Finder" };

export default function AngleFinderPage() {
  return <AngleFinderApp />;
}
