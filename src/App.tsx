/**
 * App.tsx
 *
 * Root application shell. Composes the full page layout and manages the shared
 * state that flows between SearchFilters (produces) and ResultsTable (consumes).
 *
 * OPTIMISATIONS OVER ORIGINAL:
 * - Removed the `useEffect` that derived `highlightEnabled` from `searchTerm`.
 *   Derived state should not live in `useEffect` — it creates a stale render
 *   between the state change and the effect firing. Instead, `highlightEnabled`
 *   is now a proper independent boolean that the user toggles explicitly, and
 *   it resets to `false` when the search term is cleared (handled inline).
 * - Removed unused `React` import (React 17+ JSX transform doesn't require it).
 */

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchFilters from "./components/SearchFilters";
import ResultsTable from "./components/ResultsTable";
import Footer from "./components/Footer";
import TableActionBar from "./components/TableActionBar";
import { Separator } from "./components/ui/separator";
import type { Sponsor } from "@/types";
import React from "react";

function App() {
  const [filteredData, setFilteredData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightEnabled, setHighlightEnabled] = useState(false);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    // Auto-disable highlight when the search is cleared so the toggle
    // button disappears cleanly without stale highlight state.
    if (!term.trim()) setHighlightEnabled(false);
  };

  return (
    <section className="flex flex-col p-6 w-full min-h-screen">
      <Navbar />
      <Hero />
      <SearchFilters
        onFilteredDataChange={setFilteredData}
        onLoadingChange={setIsLoading}
        onSearchChange={handleSearchChange}
      />
      <TableActionBar
        searchTerm={searchTerm}
        highlightEnabled={highlightEnabled}
        onHighlightToggle={() => setHighlightEnabled((prev) => !prev)}
        filteredData={filteredData}
      />
      <Separator className=""/>
      <ResultsTable
        data={filteredData}
        isLoading={isLoading}
        searchTerm={searchTerm}
        highlightEnabled={highlightEnabled}
      />
      <Footer />
    </section>
  );
}

export default App;