import type { Metadata } from "next";
import { ProductValidatorApp } from "@/modules/product-validator/components/product-validator-app";

export const metadata: Metadata = { title: "Product Validator AI" };

export default function ProductValidatorPage() {
  return <ProductValidatorApp />;
}
