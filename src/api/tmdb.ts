const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export type TmdbParams = Record<string, string | number | boolean | undefined>;

export function createTmdbRequest(path: string, params: TmdbParams = {}) {
    const searchParams = new URLSearchParams();
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
    const headers: Record<string, string> = {
        accept: "application/json",
    };

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            searchParams.set(key, String(value));
        }
    });

    if (apiKey) {
        searchParams.set("api_key", apiKey);
    } else if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return {
        url: `${TMDB_BASE_URL}/${path}?${searchParams.toString()}`,
        options: {
            method: "GET",
            headers,
        },
    };
}
