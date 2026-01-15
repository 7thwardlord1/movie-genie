import { TMDBMovie, TMDBTVShow, TMDBSearchResponse } from '@/types/tmdb';

const TMDB_API_KEY = '312653f91a7437337179fedb42e6f36a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'fr-FR',
    ...params,
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }
  
  return response.json();
}

export async function getPopularMovies(page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/movie/popular', { page: page.toString() });
}

export async function getPopularTVShows(page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/tv/popular', { page: page.toString() });
}

export async function getTopRatedMovies(page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/movie/top_rated', { page: page.toString() });
}

export async function getTopRatedTVShows(page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/tv/top_rated', { page: page.toString() });
}

export async function discoverMovies(params: Record<string, string> = {}): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/discover/movie', params);
}

export async function discoverTVShows(params: Record<string, string> = {}): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/discover/tv', params);
}

export async function searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/search/movie', { query, page: page.toString() });
}

export async function searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/search/tv', { query, page: page.toString() });
}

// Helper to get a diverse pool of movies/shows for the game
export async function getMediaPool(type: 'movie' | 'tv'): Promise<(TMDBMovie | TMDBTVShow)[]> {
  const pool: (TMDBMovie | TMDBTVShow)[] = [];
  
  try {
    if (type === 'movie') {
      const [popular1, popular2, topRated1, topRated2] = await Promise.all([
        getPopularMovies(1),
        getPopularMovies(2),
        getTopRatedMovies(1),
        getTopRatedMovies(2),
      ]);
      pool.push(...popular1.results, ...popular2.results, ...topRated1.results, ...topRated2.results);
    } else {
      const [popular1, popular2, topRated1, topRated2] = await Promise.all([
        getPopularTVShows(1),
        getPopularTVShows(2),
        getTopRatedTVShows(1),
        getTopRatedTVShows(2),
      ]);
      pool.push(...popular1.results, ...popular2.results, ...topRated1.results, ...topRated2.results);
    }
  } catch (error) {
    console.error('Error fetching media pool:', error);
  }
  
  // Remove duplicates based on id
  const uniquePool = pool.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  return uniquePool;
}

export function isMovie(item: TMDBMovie | TMDBTVShow): item is TMDBMovie {
  return 'title' in item;
}

export function getTitle(item: TMDBMovie | TMDBTVShow): string {
  return isMovie(item) ? item.title : item.name;
}

export function getReleaseYear(item: TMDBMovie | TMDBTVShow): number {
  const date = isMovie(item) ? item.release_date : item.first_air_date;
  return date ? new Date(date).getFullYear() : 0;
}
