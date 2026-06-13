// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTmdbRequest } from "./api/tmdb";
import Navbar from "./components/Header";
import Home from "./pages/Home";
import MovieDetailPage from "./pages/MovieDetailPage";

function App() {
  const [genres, setGenres] = useState<any[]>([]);
  const [genresError, setGenresError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
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
        console.error('Error fetching genres:', error);
        setGenres([]);
        setGenresError("Could not load movie genres. Please check your TMDB API credentials.");
      }
    };

    fetchGenres();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Navbar stays sticky across all individual sub-page re-renders */}
        <Navbar />
        
        <Routes>
          {/* Main Landing Route Dashboard Dashboard */}
          <Route path="/" element={<Home genres={genres} genresError={genresError} />} />
          
          {/* Dynamic Details Page Identifier Matching Route Parameter */}
          <Route path="/movie/:id" element={<MovieDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
