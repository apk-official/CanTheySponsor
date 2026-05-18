import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchFilters from "./components/SearchFilters";
import ResultsTable from "./components/ResultsTable";
import Footer from "./components/Footer";
// import ResultsTableSkeleton from "./components/ResultsTableSkeleton";
function App() {
  return (
    <section className="flex flex-col p-6 w-full min-h-screen">
      <Navbar />
      <Hero />
      <SearchFilters />
      <ResultsTable />
      <Footer/>
    </section>
  );
}

export default App;
