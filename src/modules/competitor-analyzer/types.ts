export type CompetitorInputMode = "AD_URL" | "PRODUCT_NAME" | "STORE_URL" | "BRAND_NAME";

export interface ManualAdInput {
  pageName?: string;
  headline?: string;
  primaryText?: string;
  description?: string;
  cta?: string;
  mediaUrl?: string;
  mediaType?: "VIDEO" | "IMAGE" | "CAROUSEL" | "UNKNOWN";
  countries?: string[];
  languages?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  variantsCount?: number;
  sourceUrl?: string;
  comments?: string[];
}

export interface CompetitorAnalysisRequest {
  mode: CompetitorInputMode;
  value: string;
  productId?: string;
  manualAd?: ManualAdInput;
}
