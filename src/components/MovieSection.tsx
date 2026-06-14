import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createTmdbRequest, hasTmdbApiKey, TMDB_CONFIG_ERROR, type TmdbParams } from "../api/tmdb";
import type { MovieFilters } from "./FilterSidebar";

type Movie = {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
}

type MovieSectionProps = {
    title: string;
    slug: string;
    genreId?: number;
    filters?: MovieFilters;
    searchQuery?: string;
    layout?: "row" | "grid";
}

const defaultFilters: MovieFilters = {
    sortBy: "popularity.desc",
    year: "",
    minRating: "",
    language: "",
};

function MovieSection({ title, slug, genreId, filters = defaultFilters, searchQuery = "", layout = "row" }: MovieSectionProps) {  
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Observer reference to watch the last movie card
    const observer = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<boolean>(false);
    const hasMoreRef = useRef<boolean>(true);
    const pageRef = useRef<number>(1);
    const activeSortBy = filters.sortBy || defaultFilters.sortBy;
    const activeYear = filters.year.trim();
    const activeMinRating = filters.minRating;
    const activeLanguage = filters.language;
    const activeSearchQuery = searchQuery.trim();
    const hasSearchQuery = activeSearchQuery.length > 0;
    const hasDiscoverFilters = Boolean(genreId || activeYear || activeMinRating || activeLanguage || activeSortBy !== defaultFilters.sortBy);
    const sectionKey = [
        slug,
        activeSearchQuery || "no-search",
        genreId ?? "all",
        activeSortBy,
        activeYear || "any-year",
        activeMinRating || "any-rating",
        activeLanguage || "any-language",
    ].join("-");
    const isGridLayout = layout === "grid";

    // Fetch implementation
    const fetchMovies = useCallback(async (pageNum: number) => {
        if (loadingRef.current || (!hasMoreRef.current && pageNum !== 1)) return;

        if (!hasTmdbApiKey()) {
            setMovies([]);
            setError(TMDB_CONFIG_ERROR);
            hasMoreRef.current = false;
            setHasMore(false);
            setLoading(false);
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        if (pageNum === 1) {
            pageRef.current = 1;
            setMovies([]);
            setError(null);
            hasMoreRef.current = true;
            setHasMore(true);
        }

        try {
            const params: TmdbParams = {
                region: "IN",
                page: pageNum,
            };
            const endpoint = hasSearchQuery
                ? (() => {
                    params.query = activeSearchQuery;
                    params.include_adult = false;
                    return "search/movie";
                })()
                : hasDiscoverFilters
                ? (() => {
                    params.include_adult = false;
                    params.sort_by = activeSortBy;
                    if (genreId) {
                        params.with_genres = genreId;
                    }
                    if (activeYear) {
                        params.primary_release_year = activeYear;
                    }
                    if (activeMinRating) {
                        params["vote_average.gte"] = activeMinRating;
                    }
                    if (activeLanguage) {
                        params.with_original_language = activeLanguage;
                    }
                    return "discover/movie";
                })()
                : `movie/${slug}`;

            const { url, options } = createTmdbRequest(endpoint, params);
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${title} movies (Status: ${response.status})`);
            }

            const data = await response.json();
            
            if (Array.isArray(data.results) && data.results.length > 0) {
                // Append new movies to the existing array
                setMovies(prevMovies => pageNum === 1 ? data.results : [...prevMovies, ...data.results]);
                // TMDB provides total_pages. Check if we hit the limit
                hasMoreRef.current = pageNum < data.total_pages;
                setHasMore(pageNum < data.total_pages);
                setError(null);
            } else {
                hasMoreRef.current = false;
                setHasMore(false);
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(`Error fetching ${slug} movies on page ${pageNum}:`, error);
            }
            setMovies([]);
            setError("Could not load movies. Please check your TMDB API credentials.");
            hasMoreRef.current = false;
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [slug, genreId, title, hasSearchQuery, activeSearchQuery, hasDiscoverFilters, activeSortBy, activeYear, activeMinRating, activeLanguage]);

    // Reset everything when the category/slug changes
    useEffect(() => {
        hasMoreRef.current = true;
        const fetchTimer = window.setTimeout(() => {
            fetchMovies(1);
        }, 0);

        return () => {
            window.clearTimeout(fetchTimer);
        };
    }, [sectionKey, fetchMovies]);

    // React callback ref to target the very last rendered movie element
    const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            // If the last card enters the viewport threshold, load the next page
            if (entries[0].isIntersecting && hasMore) {
                pageRef.current += 1;
                fetchMovies(pageRef.current);
            }
        }, isGridLayout ? {
            root: null,
            rootMargin: "300px 0px"
        } : {
            root: document.querySelector(`.scroll-container-${sectionKey}`), // Scours relative to this wrapper container
            rootMargin: "0px 300px 0px 0px" // Triggers load 300px BEFORE the user hits the actual end
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchMovies, sectionKey, isGridLayout]);

    const movieListClassName = isGridLayout
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7 px-4 pb-8"
        : `scroll-container-${sectionKey} flex gap-4 overflow-x-auto scrollbar-none px-4 pb-2 snap-x snap-mandatory`;
    const skeletonCount = isGridLayout ? 12 : 3;

    return (
        <section className={`movie-section ${isGridLayout ? "my-8" : "my-6"}`}>
            <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            
            <div className={movieListClassName}>
                {error && (
                    <p className="text-sm text-red-300 py-6">{error}</p>
                )}

                {!error && !loading && movies.length === 0 && (
                    <p className="text-sm text-gray-500 py-6">No movies found.</p>
                )}

                {movies.map((movie, index) => {
                    const isLastElement = movies.length === index + 1;
                    return (
                        <div 
                            key={`${movie.id}-${index}`} // Prevents duplicate key errors if data cross-over happens
                            ref={isLastElement ? lastMovieElementRef : null} 
                            onClick={() => navigate(`/movie/${movie.id}`)}
                            className={`movie-card transition-transform active:scale-95 cursor-pointer ${
                                isGridLayout ? "w-full" : "w-40 flex-shrink-0 snap-start"
                            }`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    navigate(`/movie/${movie.id}`);
                                }
                            }}
                        >
                            <img 
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750?text=No+Poster'} 
                                alt={movie.title} 
                                className={`w-full object-cover rounded-md mb-2 shadow-sm ${
                                    isGridLayout ? "aspect-[2/3]" : "h-60"
                                }`}
                            />
                            <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
                            <p className="text-xs text-gray-500">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            </p>
                        </div>
                    );
                })}

                {loading && Array.from({ length: skeletonCount }, (_, index) => (
                    <div
                        key={`movie-skeleton-${sectionKey}-${index}`}
                        className={isGridLayout ? "w-full" : "w-40 flex-shrink-0"}
                    >
                        <div className={`w-full shimmer rounded-md mb-2 ${
                            isGridLayout ? "aspect-[2/3]" : "h-60"
                        }`}></div>
                        <div className="h-4 shimmer rounded w-3/4 mb-1"></div>
                        <div className="h-3 shimmer rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default MovieSection;
