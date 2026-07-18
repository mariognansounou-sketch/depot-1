import type { Metadata } from "next";
import { WinnerFinderApp } from "@/modules/winner-finder/components/winner-finder-app";

export const metadata: Metadata = { title: "Winner Finder" };

export default function WinnerFinderPage() {
  return <WinnerFinderApp />;
}
