import type { Metadata } from "next";
import { MarketOpportunityApp } from "@/modules/market-opportunity/components/market-opportunity-app";

export const metadata: Metadata = { title: "Market Opportunity Score" };

export default function MarketOpportunityPage() {
  return <MarketOpportunityApp />;
}
