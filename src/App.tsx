// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Header";
import Home from "./pages/Home";
import MovieDetailPage from "./pages/MovieDetailPage";

function App() {
  const apiKey = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      let options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      };
      try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list`, options);
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, [apiKey]);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Navbar stays sticky across all individual sub-page re-renders */}
        <Navbar />
        
        <Routes>
          {/* Main Landing Route Dashboard Dashboard */}
          <Route path="/" element={<Home genres={genres} />} />
          
          {/* Dynamic Details Page Identifier Matching Route Parameter */}
          <Route path="/movie/:id" element={<MovieDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;