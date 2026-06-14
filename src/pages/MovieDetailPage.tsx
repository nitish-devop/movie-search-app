// src/pages/MovieDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import MovieDetails from "../components/MovieDetails";

function MovieDetailPage() {
  // Extracts the dynamic ":id" parameter out of the active URL string
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 animate-fadeIn">
      {/* Back Button utilizes native router history to step backward */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm px-4 py-2 rounded-md transition-colors"
      >
        ← Back
      </button>

      {id ? <MovieDetails movieId={id} /> : <p className="text-center text-red-500">No Movie ID found.</p>}
    </div>
  );
}

export default MovieDetailPage;
