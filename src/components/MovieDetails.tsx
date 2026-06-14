import { useEffect, useState } from "react";
import { createTmdbRequest, hasTmdbApiKey, TMDB_CONFIG_ERROR } from "../api/tmdb";

// 1. Explicitly typing the TMDB details response schema
interface Genre {
    id: number;
    name: string;
}

interface ProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
}

interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

interface CrewMember {
    id: number;
    name: string;
    job: string;
}

interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

interface MovieDetailData {
    id: number;
    title: string;
    tagline: string;
    original_title: string;
    original_language: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    runtime: number;
    genres: Genre[];
    vote_average: number;
    vote_count: number;
    popularity: number;
    status: string;
    budget: number;
    revenue: number;
    homepage: string;
    imdb_id: string;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    spoken_languages: SpokenLanguage[];
    credits?: {
        cast: CastMember[];
        crew: CrewMember[];
    };
    videos?: {
        results: Video[];
    };
}

interface MovieDetailsProps {
    movieId: string | number; // e.g., 1057265 passed from parameters
}

const USD_TO_INR_RATE = 95.35;

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
                    append_to_response: "credits,videos",
                });
                const response = await fetch(url, options);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch movie data (Status: ${response.status})`);
                }

                const data = await response.json();
                setMovie(data);
            } catch (err: unknown) {
                if (import.meta.env.DEV) {
                    console.error("Error loading movie detail parameters:", err);
                }
                setError(err instanceof Error ? err.message : "An unexpected system fault occurred.");
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
            <div className="max-w-4xl mx-auto p-4">
                <div className="h-8 shimmer w-1/3 rounded mb-4"></div>
                <div className="w-full h-64 shimmer rounded-md mb-4"></div>
                <div className="h-4 shimmer rounded w-full mb-2"></div>
                <div className="h-4 shimmer rounded w-5/6"></div>
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
    const formattedReleaseDate = movie.release_date
        ? new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(movie.release_date))
        : "N/A";
    const formatIndianMoney = (amountInUsd: number) => amountInUsd > 0
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amountInUsd * USD_TO_INR_RATE)
        : "N/A";
    const formatRuntime = (minutes: number) => {
        if (!minutes) return "N/A";

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
    };
    const directors = movie.credits?.crew.filter((member) => member.job === "Director").slice(0, 3) ?? [];
    const topCast = movie.credits?.cast.slice(0, 8) ?? [];
    const trailer = movie.videos?.results.find((video) => (
        video.site === "YouTube" && video.type === "Trailer"
    ));

    return (
        <div className="movie-details max-w-5xl mx-auto p-4 text-white">
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
                    {movie.tagline && (
                        <p className="text-sm italic text-gray-400 mb-3">{movie.tagline}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                        <span>{releaseYear}</span>
                        {movie.runtime > 0 && (
                            <>
                                <span>•</span>
                                <span>{formatRuntime(movie.runtime)}</span>
                            </>
                        )}
                        {movie.vote_average > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-yellow-500 font-semibold">★ {movie.vote_average.toFixed(1)} / 10</span>
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

                    <div className="mt-5 flex flex-wrap gap-3">
                        {trailer && (
                            <a
                                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
                            >
                                Watch Trailer
                            </a>
                        )}
                        {movie.homepage && (
                            <a
                                href={movie.homepage}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                            >
                                Official Site
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DetailStat label="Release Date" value={formattedReleaseDate} />
                <DetailStat label="Status" value={movie.status || "N/A"} />
                <DetailStat label="Budget" value={formatIndianMoney(movie.budget)} hint="Approx INR" />
                <DetailStat label="Revenue" value={formatIndianMoney(movie.revenue)} hint="Approx INR" />
                <DetailStat label="Votes" value={movie.vote_count ? movie.vote_count.toLocaleString() : "N/A"} />
                <DetailStat label="Popularity" value={movie.popularity ? movie.popularity.toFixed(1) : "N/A"} />
                <DetailStat label="Original Title" value={movie.original_title || movie.title} />
                <DetailStat label="IMDB" value={movie.imdb_id || "N/A"} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <section>
                    <h3 className="text-lg font-semibold text-white mb-3">Top Cast</h3>
                    {topCast.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {topCast.map((cast) => (
                                <div key={cast.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-3">
                                    <img
                                        src={cast.profile_path ? `https://image.tmdb.org/t/p/w185${cast.profile_path}` : "https://placehold.co/185x278?text=No+Photo"}
                                        alt={cast.name}
                                        className="mb-2 aspect-[2/3] w-full rounded-md object-cover"
                                    />
                                    <p className="line-clamp-1 text-sm font-semibold text-white">{cast.name}</p>
                                    <p className="line-clamp-1 text-xs text-gray-500">{cast.character || "Role unavailable"}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Cast details are not available.</p>
                    )}
                </section>

                <section className="space-y-5">
                    <InfoBlock
                        title="Director"
                        values={directors.map((director) => director.name)}
                        emptyText="Director details are not available."
                    />
                    <InfoBlock
                        title="Languages"
                        values={movie.spoken_languages.map((language) => language.english_name || language.name)}
                        emptyText="Language details are not available."
                    />
                    <InfoBlock
                        title="Production Countries"
                        values={movie.production_countries.map((country) => country.name)}
                        emptyText="Country details are not available."
                    />
                    <InfoBlock
                        title="Production Companies"
                        values={movie.production_companies.map((company) => company.name)}
                        emptyText="Company details are not available."
                    />
                </section>
            </div>
        </div>
    );
}

type DetailStatProps = {
    label: string;
    value: string;
    hint?: string;
}

function DetailStat({ label, value, hint }: DetailStatProps) {
    return (
        <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
            <p className="break-words text-sm font-medium text-neutral-100">{value}</p>
            {hint && value !== "N/A" && (
                <p className="mt-1 text-xs text-neutral-500">{hint}</p>
            )}
        </div>
    );
}

type InfoBlockProps = {
    title: string;
    values: string[];
    emptyText: string;
}

function InfoBlock({ title, values, emptyText }: InfoBlockProps) {
    const visibleValues = values.filter(Boolean);

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400 mb-2">{title}</h3>
            {visibleValues.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {visibleValues.map((value) => (
                        <span key={value} className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-200">
                            {value}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">{emptyText}</p>
            )}
        </div>
    );
}

export default MovieDetails;
