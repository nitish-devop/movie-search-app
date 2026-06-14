// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTmdbRequest, hasTmdbApiKey, TMDB_CONFIG_ERROR } from "./api/tmdb";
import Navbar from "./components/Header";
import Home from "./pages/Home";
import MovieDetailPage from "./pages/MovieDetailPage";

type Genre = {
  id: number;
  name: string;
}

function App() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresError, setGenresError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchGenres = async () => {
      if (!hasTmdbApiKey()) {
        setGenres([]);
        setGenresError(TMDB_CONFIG_ERROR);
        return;
      }

      try {
        const { url, options } = createTmdbRequest("genre/movie/list");
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`Failed to fetch genres (Status: ${response.status})`);
        }

        const data = await response.json();
        setGenres(Array.isArray(data.genres) ? data.genres : []);
        setGenresError(null);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching genres:', error);
        }
        setGenres([]);
        setGenresError("Could not load movie genres. Please check your TMDB API credentials.");
      }
    };

    fetchGenres();
  }, []);

  return (
    <Router>
      <div className="min-h-screen text-white">
        {/* Navbar stays sticky across all individual sub-page re-renders */}
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <Routes>
          {/* Main Landing Route Dashboard Dashboard */}
          <Route path="/" element={<Home genres={genres} genresError={genresError} searchQuery={searchQuery} />} />
          
          {/* Dynamic Details Page Identifier Matching Route Parameter */}
          <Route path="/movie/:id" element={<MovieDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
