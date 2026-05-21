import { describe, it, expect } from "vitest";
import type { Sponsor } from "../types";
import { mockRows } from "./mockData";

// mirrors the matchesLocation logic from SearchFilters.tsx
function matchesLocation(row: Sponsor, locationCities: string[]): boolean {
  if (locationCities.length === 0) return true;
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "");
  return locationCities.some((city) => {
    const normCity = normalize(city);
    const normRow = normalize(row["Town/City"] ?? "");
    return normRow.includes(normCity) || normCity.includes(normRow);
  });
}

function filterRows(
  rows: Sponsor[],
  {
    search = "",
    route = "All",
    typeRating = "All",
    locationCities = [] as string[],
  } = {},
): Sponsor[] {
  return rows.filter((row) => {
    if (!row["Organisation Name"]) return false;

    const matchesSearch = row["Organisation Name"]
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRoute = route === "All" || row["Route"]?.trim() === route;

    const matchesTypeRating =
      typeRating === "All" || row["Type & Rating"]?.trim() === typeRating;

    return (
      matchesSearch &&
      matchesRoute &&
      matchesTypeRating &&
      matchesLocation(row, locationCities)
    );
  });
}

describe("company name search", () => {
  it("returns all rows when search is empty", () => {
    expect(filterRows(mockRows)).toHaveLength(5);
  });

  it("filters by partial company name (case-insensitive)", () => {
    const results = filterRows(mockRows, { search: "google" });
    expect(results).toHaveLength(1);
    expect(results[0]["Organisation Name"]).toBe("Google UK Ltd");
  });

  it("returns empty when no match", () => {
    expect(filterRows(mockRows, { search: "xyz123" })).toHaveLength(0);
  });
});

describe("route filter", () => {
  it("returns all rows when route is All", () => {
    expect(filterRows(mockRows, { route: "All" })).toHaveLength(5);
  });

  it("filters to only matching route", () => {
    const results = filterRows(mockRows, { route: "Creative Worker" });
    expect(results).toHaveLength(1);
    expect(results[0]["Organisation Name"]).toBe("Creative Agency Ltd");
  });
});

describe("type & rating filter", () => {
  it("returns all rows when typeRating is All", () => {
    expect(filterRows(mockRows, { typeRating: "All" })).toHaveLength(5);
  });

  it("filters to B-rated sponsors only", () => {
    const results = filterRows(mockRows, { typeRating: "Worker (B rating)" });
    expect(results).toHaveLength(1);
    expect(results[0]["Organisation Name"]).toBe("Manchester NHS Trust");
  });
});

describe("location filter (matchesLocation)", () => {
  it("returns true when no cities selected", () => {
    expect(matchesLocation(mockRows[0], [])).toBe(true);
  });

  it("matches exact city name", () => {
    expect(matchesLocation(mockRows[1], ["newcastle upon tyne"])).toBe(true);
  });

  it("matches case-insensitive uppercase city", () => {
    expect(matchesLocation(mockRows[2], ["manchester"])).toBe(true);
  });

  it("does not match wrong city", () => {
    expect(matchesLocation(mockRows[0], ["manchester"])).toBe(false);
  });

  it("matches partial city name", () => {
    expect(matchesLocation(mockRows[1], ["newcastle"])).toBe(true);
  });

  it("matches when multiple cities provided and one matches", () => {
    expect(matchesLocation(mockRows[0], ["manchester", "london"])).toBe(true);
  });
});

it("search + route together", () => {
  const results = filterRows(mockRows, {
    search: "google",
    route: "Skilled Worker",
  });
  expect(results).toHaveLength(1);
  expect(results[0]["Organisation Name"]).toBe("Google UK Ltd");
});

it("search + location together", () => {
  const results = filterRows(mockRows, {
    search: "university",
    locationCities: ["newcastle"],
  });
  expect(results).toHaveLength(1);
  expect(results[0]["Organisation Name"]).toBe("Newcastle University");
});

it("returns nothing when filters conflict", () => {
  const results = filterRows(mockRows, {
    route: "Creative Worker",
    locationCities: ["edinburgh"],
  });
  expect(results).toHaveLength(0);
});
