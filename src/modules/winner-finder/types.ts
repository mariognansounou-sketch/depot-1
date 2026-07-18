export interface WinnerFinderFilters {
  query: string;
  countries: string[];
  category?: string;
  minDurationDays?: number;
  language?: string;
  physicalProductOnly?: boolean;
  codCompatible?: boolean;
}

export interface WinnerCandidate {
  productName: string;
  pageName?: string;
  sourceUrl?: string;
  countries: string[];
  variantsCount: number;
  durationDays: number;
  isActive: boolean;
  mediaType?: string;
  scores: {
    winnerScore: number; // /100
    opportunity: number; // /100
    competitionLevel: number; // /100 (higher = more competition)
    launchPotential: number; // /100
  };
  reasoning: string;
}
