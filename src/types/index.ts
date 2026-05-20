// ─── Domain types ────────────────────────────────────────────────────────────

/** Every visa route the Home Office register uses. */
export type Route =
  | "All"
  | "Charity Worker"
  | "Creative Worker"
  | "Global Business Mobility: Graduate Trainee"
  | "Global Business Mobility: Secondment Worker"
  | "Global Business Mobility: Senior or Specialist Worker"
  | "Global Business Mobility: Service Supplier"
  | "Global Business Mobility: UK Expansion Worker"
  | "Government Authorised Exchange"
  | "International Agreement"
  | "International Sportsperson"
  | "Intra Company Transfers (ICT)"
  | "Intra-company Routes"
  | "Religious Worker"
  | "Scale-up"
  | "Seasonal Worker"
  | "Skilled Worker"
  | "Tier 2 Ministers of Religion";

/** Every sponsor type/rating combination that appears in the register. */
export type TypeRating =
  | "All"
  | "Temporary Worker (A (Premium))"
  | "Temporary Worker (A (SME+))"
  | "Temporary Worker (A rating)"
  | "Temporary Worker (B rating)"
  | "Worker (A (Premium))"
  | "Worker (A (SME+))"
  | "Worker (A rating)"
  | "Worker (B rating)"
  | "Worker (UK Expansion Worker: Provisional )";

/** A single row from the CSV register. Keys match CSV headers exactly. */
export interface Sponsor {
  "Organisation Name": string;
  "Town/City": string;
  "Type & Rating": string;
  Route: string;
}

// ─── Component prop types ─────────────────────────────────────────────────────

export interface RouteFilterProps {
  value: Route;
  onValueChange: (value: Route) => void;
}

export interface TypeRatingFilterProps {
  value: TypeRating;
  onValueChange: (value: TypeRating) => void;
}

export interface LocationFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  locationRadius: string;
  onLocationRadiusChange: (value: string) => void;
  locationSelected?: boolean;
  onHandleSelect?: () => void;
  onHandleClose?: () => void;
  onCitiesChange?: (cities: string[]) => void;
}

export interface CompanySearchProps {
  companySearch: string;
  onCompanySearchChange: (value: string) => void;
}

export interface SearchFiltersProps {
  onFilteredDataChange: (data: Sponsor[]) => void;
  onLoadingChange: (loading: boolean) => void;
  /** Mirrors the current search term up to App so it can be passed to ResultsTable. */
  onSearchChange: (term: string) => void;
}

export interface ResultsTableProps {
  data: Sponsor[];
  isLoading: boolean;
  /** Current search term — used to highlight matched text. */
  searchTerm: string;
  /** Whether the highlight overlay is active. */
  highlightEnabled: boolean;
}

export interface TableActionBarProps {
  searchTerm: string;
  highlightEnabled: boolean;
  onHighlightToggle: () => void;
  filteredData: Sponsor[];
  /** ISO date string shown in the action bar ("Updated On"). */
  updatedOn?: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface LocationSearchResult {
  cities: string[];
  /** Human-readable label for the resolved location (postcode, town name, etc.). */
  displayName: string;
}

export interface FooterProps {
  buildDate: string;
}
