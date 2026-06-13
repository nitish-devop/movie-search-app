import { useEffect, useState } from "react";
import { createTmdbRequest, hasTmdbApiKey, TMDB_CONFIG_ERROR } from "../api/tmdb";

// 1. Explicitly typing the TMDB details response schema
interface Genre {
    id: number;
    name: string;
}

interface MovieDetailData {
    id: number;
    title: string;
    release_date: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    runtime: number;
    genres: Genre[];
    vote_average: number;
}

interface MovieDetailsProps {
    movieId: string | number; // e.g., 1057265 passed from parameters
}

function MovieDetails({ movieId }: MovieDetailsProps) {    
    const [movie, setMovie] = useState<MovieDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true);
            setError(null);

            if (!hasTmdbApiKey()) {
                setError(TMDB_CONFIG_ERROR);
                setLoading(false);
                return;
            }
            
            try {
                // Hits the precise path mapping to https://api.themoviedb.org/3/movie/1057265
                const { url, options } = createTmdbRequest(`movie/${movieId}`, {
                    language: "en-US",
                });
                const response = await fetch(url, options);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch movie data (Status: ${response.status})`);
                }

                const data = await response.json();
                setMovie(data);
            } catch (err: any) {
                if (import.meta.env.DEV) {
                    console.error("Error loading movie detail parameters:", err);
                }
                setError(err.message || "An unexpected system fault occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (movieId) {
            fetchMovieDetails();
        }
    }, [movieId]);

    // Loading State Placeholder Skeleton
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 w-1/3 rounded mb-4"></div>
                <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
        );
    }

    // Error State Handling Screen
    if (error || !movie) {
        return (
            <div className="p-6 text-center text-red-500 font-medium">
                <p>Error: {error || "Movie profile could not be assembled."}</p>
            </div>
        );
    }

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";

    return (
        <div className="movie-details max-w-4xl mx-auto p-4 text-white">
            {/* Backdrop Hero Header Accent */}
            {movie.backdrop_path && (
                <div className="w-full h-48 md:h-64 overflow-hidden rounded-lg mb-6 relative opacity-40">
                    <img 
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
                        alt="" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 mt-[-4rem] relative z-10 px-2 md:px-6">
                {/* Poster Display Column */}
                <div className="w-44 md:w-56 flex-shrink-0 mx-auto md:mx-0">
                    <img 
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750?text=No+Poster'} 
                        alt={movie.title} 
                        className="w-full h-auto rounded-lg shadow-xl border border-gray-800" 
                    />
                </div>

                {/* Content Metadata Area */}
                <div className="flex-1 text-gray-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{movie.title}</h2>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                        <span>{releaseYear}</span>
                        {movie.runtime > 0 && (
                            <>
                                <span>•</span>
                                <span>{movie.runtime} mins</span>
                            </>
                        )}
                        {movie.vote_average > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-yellow-500 font-semibold">★ {movie.vote_average.toFixed(1)}</span>
                            </>
                        )}
                    </div>

                    {/* Genres Tag Cloud Loop */}
                    {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {movie.genres.map((genre) => (
                                <span key={genre.id} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <h3 className="text-md font-semibold text-white mb-2">Overview</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                        {movie.overview || "No comprehensive plot synopsis is explicitly provided for this record profile."}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;
