import type { Metadata } from "next";
import { SaturationDetectorApp } from "@/modules/saturation-detector/components/saturation-detector-app";

export const metadata: Metadata = { title: "Saturation Detector" };

export default function SaturationDetectorPage() {
  return <SaturationDetectorApp />;
}
