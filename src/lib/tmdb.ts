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
      // Fetch a much larger and more diverse pool
      const [
        popular1, popular2, popular3, popular4, popular5,
        topRated1, topRated2, topRated3,
        discover2020s, discover2010s, discover2000s, discover90s, discover80s,
        discoverAction, discoverComedy, discoverDrama, discoverSciFi, discoverHorror
      ] = await Promise.all([
        getPopularMovies(1),
        getPopularMovies(2),
        getPopularMovies(3),
        getPopularMovies(4),
        getPopularMovies(5),
        getTopRatedMovies(1),
        getTopRatedMovies(2),
        getTopRatedMovies(3),
        // By decade
        discoverMovies({ 'primary_release_date.gte': '2020-01-01', sort_by: 'popularity.desc' }),
        discoverMovies({ 'primary_release_date.gte': '2010-01-01', 'primary_release_date.lte': '2019-12-31', sort_by: 'popularity.desc' }),
        discoverMovies({ 'primary_release_date.gte': '2000-01-01', 'primary_release_date.lte': '2009-12-31', sort_by: 'popularity.desc' }),
        discoverMovies({ 'primary_release_date.gte': '1990-01-01', 'primary_release_date.lte': '1999-12-31', sort_by: 'popularity.desc' }),
        discoverMovies({ 'primary_release_date.gte': '1980-01-01', 'primary_release_date.lte': '1989-12-31', sort_by: 'popularity.desc' }),
        // By genre
        discoverMovies({ with_genres: '28', sort_by: 'popularity.desc' }), // Action
        discoverMovies({ with_genres: '35', sort_by: 'popularity.desc' }), // Comedy
        discoverMovies({ with_genres: '18', sort_by: 'popularity.desc' }), // Drama
        discoverMovies({ with_genres: '878', sort_by: 'popularity.desc' }), // Sci-Fi
        discoverMovies({ with_genres: '27', sort_by: 'popularity.desc' }), // Horror
      ]);
      pool.push(
        ...popular1.results, ...popular2.results, ...popular3.results, ...popular4.results, ...popular5.results,
        ...topRated1.results, ...topRated2.results, ...topRated3.results,
        ...discover2020s.results, ...discover2010s.results, ...discover2000s.results, ...discover90s.results, ...discover80s.results,
        ...discoverAction.results, ...discoverComedy.results, ...discoverDrama.results, ...discoverSciFi.results, ...discoverHorror.results
      );
    } else {
      const [
        popular1, popular2, popular3, popular4, popular5,
        topRated1, topRated2, topRated3,
        discoverDrama, discoverComedy, discoverCrime, discoverSciFi, discoverAnimation
      ] = await Promise.all([
        getPopularTVShows(1),
        getPopularTVShows(2),
        getPopularTVShows(3),
        getPopularTVShows(4),
        getPopularTVShows(5),
        getTopRatedTVShows(1),
        getTopRatedTVShows(2),
        getTopRatedTVShows(3),
        // By genre
        discoverTVShows({ with_genres: '18', sort_by: 'popularity.desc' }), // Drama
        discoverTVShows({ with_genres: '35', sort_by: 'popularity.desc' }), // Comedy
        discoverTVShows({ with_genres: '80', sort_by: 'popularity.desc' }), // Crime
        discoverTVShows({ with_genres: '10765', sort_by: 'popularity.desc' }), // Sci-Fi & Fantasy
        discoverTVShows({ with_genres: '16', sort_by: 'popularity.desc' }), // Animation
      ]);
      pool.push(
        ...popular1.results, ...popular2.results, ...popular3.results, ...popular4.results, ...popular5.results,
        ...topRated1.results, ...topRated2.results, ...topRated3.results,
        ...discoverDrama.results, ...discoverComedy.results, ...discoverCrime.results, ...discoverSciFi.results, ...discoverAnimation.results
      );
    }
  } catch (error) {
    console.error('Error fetching media pool:', error);
  }
  
  // Remove duplicates based on id
  const uniquePool = pool.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  // Shuffle for variety
  return shuffleArray(uniquePool);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
