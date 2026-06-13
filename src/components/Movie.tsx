// src/components/Movie.tsx (Update snippet)
import { useNavigate } from "react-router-dom";

interface MovieProps {
  id: number | string; // Ensure you pass the movie id property down from MovieSection!
  title: string;
  year: string | number;
  poster: string;
}

function Movie({ id, title, year, poster }: MovieProps) {
  const navigate = useNavigate();
  const posterUrl = poster && !poster.endsWith('null') ? poster : 'https://placehold.co/500x750?text=No+Poster';

  return (
    <div 
      onClick={() => navigate(`/movie/${id}`)} // Changes url path to launch details route
      className="movie-card w-40 flex-shrink-0 snap-start group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-md mb-2 bg-gray-900 aspect-[2/3]">
        <img src={posterUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <h3 className="text-sm font-medium text-white truncate line-clamp-1 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{year}</p>
    </div>
  );
}

export default Movie;