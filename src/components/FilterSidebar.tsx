type Genre = {
    id: number;
    name: string;
}

export type MovieFilters = {
    sortBy: string;
    year: string;
    minRating: string;
    language: string;
}

type FilterSidebarProps = {
    genres: Genre[];
    error: string | null;
    selectedGenreId: number | null;
    filters: MovieFilters;
    onSelectGenre: (genre: Genre) => void;
    onClearGenre: () => void;
    onChangeFilters: (filters: MovieFilters) => void;
    onResetFilters: () => void;
}

const sortOptions = [
    { value: "popularity.desc", label: "Popular" },
    { value: "vote_average.desc", label: "Top Rated" },
    { value: "primary_release_date.desc", label: "Newest" },
    { value: "revenue.desc", label: "Revenue" },
];

const languageOptions = [
    { value: "", label: "Any" },
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ml", label: "Malayalam" },
    { value: "kn", label: "Kannada" },
    { value: "mr", label: "Marathi" },
    { value: "bn", label: "Bengali" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
];

function FilterSidebar({
    genres,
    error,
    selectedGenreId,
    filters,
    onSelectGenre,
    onClearGenre,
    onChangeFilters,
    onResetFilters,
}: FilterSidebarProps) {
    const updateFilter = (key: keyof MovieFilters, value: string) => {
        onChangeFilters({
            ...filters,
            [key]: value,
        });
    };

    return (
        <aside className="w-full border-b border-white/10 bg-black/40 md:w-68 md:flex-shrink-0 md:border-b-0 md:border-r md:bg-black/25">
            <div className="p-4 md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:overflow-y-auto">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-white">Filters</h2>
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="rounded-md px-2 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                        Reset
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                        Sort
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(event) => updateFilter("sortBy", event.target.value)}
                        className="w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-400"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                        Language
                    </label>
                    <select
                        value={filters.language}
                        onChange={(event) => updateFilter("language", event.target.value)}
                        className="w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-amber-400"
                    >
                        {languageOptions.map((option) => (
                            <option key={option.value || "any-language"} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                            Year
                        </label>
                        <input
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={filters.year}
                            onChange={(event) => updateFilter("year", event.target.value)}
                            placeholder="Any"
                            className="w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 transition-colors focus:border-amber-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                            Rating
                        </label>
                        <select
                            value={filters.minRating}
                            onChange={(event) => updateFilter("minRating", event.target.value)}
                            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-white"
                        >
                            <option value="">Any</option>
                            <option value="7">7+</option>
                            <option value="8">8+</option>
                            <option value="9">9+</option>
                        </select>
                    </div>
                </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                        Genres
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-y-visible md:overflow-x-hidden md:pr-1">
                        <button
                            type="button"
                            onClick={onClearGenre}
                            className={`w-max md:w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                                selectedGenreId === null ? "bg-amber-400 text-black" : "bg-white/[0.06] text-neutral-200 hover:bg-white/10"
                            }`}
                        >
                            All
                        </button>

                        {error && (
                            <p className="min-w-48 text-sm text-red-300 md:min-w-0">{error}</p>
                        )}

                        {!error && genres.map((genre) => (
                            <button
                                type="button"
                                key={genre.id}
                                onClick={() => onSelectGenre(genre)}
                                className={`w-max md:w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                                    selectedGenreId === genre.id ? "bg-amber-400 text-black" : "bg-white/[0.06] text-neutral-200 hover:bg-white/10"
                                }`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default FilterSidebar;
