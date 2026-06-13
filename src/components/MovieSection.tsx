import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createTmdbRequest, type TmdbParams } from "../api/tmdb";

type MovieSectionProps = {
    title: string;
    slug: string;
    genreId?: number;
}

function MovieSection({ title, slug, genreId }: MovieSectionProps) {  
    const navigate = useNavigate();
    const [movies, setMovies] = useState<any[]>([]);
    const [, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Observer reference to watch the last movie card
    const observer = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<boolean>(false);
    const hasMoreRef = useRef<boolean>(true);
    const sectionKey = genreId ? `genre-${genreId}` : slug;

    // Fetch implementation
    const fetchMovies = useCallback(async (pageNum: number) => {
        if (loadingRef.current || (!hasMoreRef.current && pageNum !== 1)) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const params: TmdbParams = {
                region: "IN",
                page: pageNum,
            };
            const endpoint = genreId
                ? (() => {
                    params.include_adult = false;
                    params.sort_by = "popularity.desc";
                    params.with_genres = genreId;
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
            console.error(`Error fetching ${slug} movies on page ${pageNum}:`, error);
            setMovies([]);
            setError("Could not load movies. Please check your TMDB API credentials.");
            hasMoreRef.current = false;
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [slug, genreId]);

    // Reset everything when the category/slug changes
    useEffect(() => {
        setMovies([]);
        setError(null);
        setPage(1);
        hasMoreRef.current = true;
        setHasMore(true);
        // Fetch page 1 initially
        fetchMovies(1);
    }, [sectionKey, fetchMovies]);

    // React callback ref to target the very last rendered movie element
    const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            // If the last card enters the viewport threshold, load the next page
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchMovies(nextPage);
                    return nextPage;
                });
            }
        }, {
            root: document.querySelector(`.scroll-container-${sectionKey}`), // Scours relative to this wrapper container
            rootMargin: "0px 300px 0px 0px" // Triggers load 300px BEFORE the user hits the actual end
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchMovies, sectionKey]);

    return (
        <section className="movie-section my-6">
            <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            
            {/* Horizontal Scroll Layout */}
            <div className={`scroll-container-${sectionKey} flex gap-4 overflow-x-auto scrollbar-none px-4 pb-2 snap-x snap-mandatory`}>
                {error && (
                    <p className="text-sm text-red-300 py-6">{error}</p>
                )}

                {movies.map((movie, index) => {
                    const isLastElement = movies.length === index + 1;
                    return (
                        <div 
                            key={`${movie.id}-${index}`} // Prevents duplicate key errors if data cross-over happens
                            ref={isLastElement ? lastMovieElementRef : null} 
                            onClick={() => navigate(`/movie/${movie.id}`)}
                            className="movie-card w-40 flex-shrink-0 snap-start transition-transform active:scale-95 cursor-pointer"
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
                                className="w-full h-60 object-cover rounded-md mb-2 shadow-sm" 
                            />
                            <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
                            <p className="text-xs text-gray-500">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            </p>
                        </div>
                    );
                })}

                {/* Optional Skeleton loading card placeholder at the end */}
                {loading && (
                    <div className="w-40 flex-shrink-0 animate-pulse">
                        <div className="w-full h-60 bg-gray-300 dark:bg-gray-700 rounded-md mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default MovieSection;
