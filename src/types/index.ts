export type Route = "All" | "Workers" | "Temporary Workers";
export type RouteFilterProps = {
  value: Route;
  onValueChange: (value: Route) => void;
};
export type TypeRating =
  | "All"
  | "Worker(A Rating)"
  | "Worker (UK Expansion Worker: Provisional )";
export type TypeRatingFilterProps = {
  value: TypeRating;
  onValueChange: (value: TypeRating) => void;
};
