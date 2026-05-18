import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchFilters from "./components/SearchFilters";
import ResultsTable from "./components/ResultsTable";
import Footer from "./components/Footer";
import { useState } from "react";
// import ResultsTableSkeleton from "./components/ResultsTableSkeleton";
import { Sponsor } from "@/types/index"

function App() {
  const [filteredData, setFilteredData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  return (
    <section className="flex flex-col p-6 w-full min-h-screen">
      <Navbar />
      <Hero />
      <SearchFilters onFilteredDataChange={setFilteredData} onLoadingChange={setIsLoading}/>
      <ResultsTable data={filteredData} isLoading={isLoading}/>
      <Footer/>
    </section>
  );
}

export default App;
