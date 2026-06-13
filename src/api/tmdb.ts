const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export type TmdbParams = Record<string, string | number | boolean | undefined>;

export const TMDB_CONFIG_ERROR = "TMDB API key is missing. Add VITE_TMDB_API_KEY to your deployment environment and rebuild.";

export function hasTmdbApiKey() {
    return Boolean(import.meta.env.VITE_TMDB_API_KEY);
}

export function createTmdbRequest(path: string, params: TmdbParams = {}) {
    const searchParams = new URLSearchParams();
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const headers: Record<string, string> = {
        accept: "application/json",
    };

    if (!apiKey) {
        throw new Error(TMDB_CONFIG_ERROR);
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.set(key, String(value));
        }
    });

    searchParams.set("api_key", apiKey);

    return {
        url: `${TMDB_BASE_URL}/${path}?${searchParams.toString()}`,
        options: {
            method: "GET",
            headers,
        },
    };
}
