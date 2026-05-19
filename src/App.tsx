import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchFilters from "./components/SearchFilters";
import ResultsTable from "./components/ResultsTable";
import Footer from "./components/Footer";
import { Sponsor } from "@/types/index";
import TableActionBar from "./components/TableActionBar";
import { Separator } from "./components/ui/separator";

function App() {
  const [filteredData, setFilteredData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightEnabled, setHighlightEnabled] = useState(false);

  // Auto-enable highlight when user starts typing, auto-disable when cleared.
  // User can still manually toggle it off while searching if they don't want it.
  useEffect(() => {
    if (searchTerm.trim()) {
      setHighlightEnabled(true);
    } else {
      setHighlightEnabled(false);
    }
  }, [searchTerm]);

  return (
    <section className="flex flex-col p-6 w-full min-h-screen">
      <Navbar />
      <Hero />
      <SearchFilters
        onFilteredDataChange={setFilteredData}
        onLoadingChange={setIsLoading}
        onSearchChange={setSearchTerm}
      />
      <TableActionBar
        searchTerm={searchTerm}
        highlightEnabled={highlightEnabled}
        onHighlightToggle={() => setHighlightEnabled((prev) => !prev)}
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