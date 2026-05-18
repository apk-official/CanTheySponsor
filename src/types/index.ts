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
export type RouteFilterProps = {
  value: Route;
  onValueChange: (value: Route) => void;
};
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
export type TypeRatingFilterProps = {
  value: TypeRating;
  onValueChange: (value: TypeRating) => void;
};

export type LocationType =
  | "Next.js"
  | "SvelteKit"
  | "Nuxt.js"
  | "Remix"
  | "Astro";

export type LocationFilterProps = {
  value: string;
  onValueChange: (value: string) => void;
  locationRadius: string;
  onLocationRadiusChange: (value: string) => void;
  locationSelected?: boolean;
  onHandleSelect?: () => void;
  onHandleClose?: () => void;
};

export type CompanySearchProps = {
  companySearch: string;
  onCompanySearchChange: (value: string) => void;
};

export type Sponsor = {
  "Organisation Name": string;
  "Town/City": string;
  "Type & Rating": string;
  Route: string;
};

export type SearchFiltersProps = {
  onFilteredDataChange: (data: Sponsor[]) => void;
  onLoadingChange: (loading: boolean) => void;
};

export type ResultsTableProps = {
  data: Sponsor[];
  isLoading: boolean;
};
