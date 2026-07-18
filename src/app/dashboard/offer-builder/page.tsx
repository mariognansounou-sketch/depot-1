import type { Metadata } from "next";
import { OfferBuilderApp } from "@/modules/offer-builder/components/offer-builder-app";

export const metadata: Metadata = { title: "AI Offer Builder" };

export default function OfferBuilderPage() {
  return <OfferBuilderApp />;
}
