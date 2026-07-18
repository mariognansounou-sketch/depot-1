import type { Metadata } from "next";
import { SupplierFinderApp } from "@/modules/supplier-finder/components/supplier-finder-app";

export const metadata: Metadata = { title: "AI Supplier Finder" };

export default function SupplierFinderPage() {
  return <SupplierFinderApp />;
}
