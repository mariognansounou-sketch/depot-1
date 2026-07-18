import type { Metadata } from "next";
import { EcommerceBrainApp } from "@/modules/ecommerce-brain/components/ecommerce-brain-app";

export const metadata: Metadata = { title: "AI Personal Ecommerce Brain" };

export default function EcommerceBrainPage() {
  return <EcommerceBrainApp />;
}
