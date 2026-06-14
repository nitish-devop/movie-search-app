// src/pages/Home.tsx
import { useState } from "react";
import FilterSidebar, { type MovieFilters } from "../components/FilterSidebar";
import MovieSection from "../components/MovieSection";

type Genre = {
  id: number;
  name: string;
}

interface HomeProps {
  genres: Genre[];
  genresError: string | null;
  searchQuery: string;
}

function Home({ genres, genresError, searchQuery }: HomeProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [filters, setFilters] = useState<MovieFilters>({
    sortBy: "popularity.desc",
    year: "",
    minRating: "",
    language: "",
  });
  const trimmedSearchQuery = searchQuery.trim();
  const hasSearchQuery = trimmedSearchQuery.length > 0;
  const hasActiveFilters = Boolean(selectedGenre || filters.year || filters.minRating || filters.language || filters.sortBy !== "popularity.desc");
  const filteredTitle = selectedGenre ? `${selectedGenre.name} Movies` : "Filtered Movies";

  const resetFilters = () => {
    setSelectedGenre(null);
    setFilters({
      sortBy: "popularity.desc",
      year: "",
      minRating: "",
      language: "",
    });
  };

  return (
    <div className="animate-fadeIn md:flex md:items-start">
      <FilterSidebar
        genres={genres}
        error={genresError}
        selectedGenreId={selectedGenre?.id ?? null}
        filters={filters}
        onSelectGenre={setSelectedGenre}
        onClearGenre={() => setSelectedGenre(null)}
        onChangeFilters={setFilters}
        onResetFilters={resetFilters}
      />

      <main className="min-w-0 flex-1">
        {hasSearchQuery ? (
          <MovieSection
            title={`Search results for "${trimmedSearchQuery}"`}
            slug="search"
            searchQuery={trimmedSearchQuery}
            layout="grid"
          />
        ) : hasActiveFilters ? (
          <MovieSection
            title={filteredTitle}
            slug="filter"
            genreId={selectedGenre?.id}
            filters={filters}
            layout="grid"
          />
        ) : (
          <>
            <MovieSection title="Popular" slug="popular" />
            <MovieSection title="Top Rated" slug="top_rated" />
            <MovieSection title="Upcoming" slug="upcoming" />
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
