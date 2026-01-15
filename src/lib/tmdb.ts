import { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBSearchResponse, 
  MediaType,
  TMDBMovieEnriched,
  TMDBTVEnriched,
  EnrichedMedia,
  TMDBCastMember,
  TMDBCrewMember,
  TMDBKeyword,
} from '@/types/tmdb';
import { getCachedPool, setCachedPool } from './tmdb-cache';

const TMDB_API_KEY = '2e84aa13e9ca7dbe6ba675d776e79c04';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 50;

async function rateLimitedFetch<T>(url: string): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export function getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'fr-FR',
    ...params,
  });
  
  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams}`;
  return rateLimitedFetch<T>(url);
}

async function getPopularMovies(page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/movie/popular', { page: String(page) });
}

async function getTopRatedMovies(page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/movie/top_rated', { page: String(page) });
}

async function getPopularTVShows(page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/tv/popular', { page: String(page) });
}

async function getTopRatedTVShows(page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/tv/top_rated', { page: String(page) });
}

async function discoverMovies(params: Record<string, string> = {}, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> {
  return fetchTMDB<TMDBSearchResponse<TMDBMovie>>('/discover/movie', { page: String(page), ...params });
}

async function discoverTVShows(params: Record<string, string> = {}, page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBSearchResponse<TMDBTVShow>>('/discover/tv', { page: String(page), ...params });
}

interface MovieDetailsResponse extends TMDBMovie {
  runtime: number | null;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  keywords?: {
    keywords: TMDBKeyword[];
  };
}

interface TVDetailsResponse extends TMDBTVShow {
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string;
  type: string;
  networks: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  created_by: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  keywords?: {
    results: TMDBKeyword[];
  };
}

async function getMovieDetails(id: number): Promise<MovieDetailsResponse> {
  return fetchTMDB<MovieDetailsResponse>(`/movie/${id}`, { 
    append_to_response: 'credits,keywords' 
  });
}

async function getTVDetails(id: number): Promise<TVDetailsResponse> {
  return fetchTMDB<TVDetailsResponse>(`/tv/${id}`, { 
    append_to_response: 'credits,keywords' 
  });
}

function enrichMovie(basic: TMDBMovie, details: MovieDetailsResponse): TMDBMovieEnriched {
  const cast = details.credits?.cast || [];
  const crew = details.credits?.crew || [];
  const director = crew.find(c => c.job === 'Director');
  
  return {
    ...basic,
    runtime: details.runtime,
    budget: details.budget || 0,
    revenue: details.revenue || 0,
    tagline: details.tagline || '',
    status: details.status || '',
    cast: cast.slice(0, 20),
    crew: crew.filter(c => ['Director', 'Producer', 'Writer', 'Screenplay', 'Executive Producer'].includes(c.job)).slice(0, 10),
    keywords: details.keywords?.keywords || [],
    production_companies: details.production_companies || [],
    director,
    mainCast: cast.slice(0, 10),
  };
}

function enrichTVShow(basic: TMDBTVShow, details: TVDetailsResponse): TMDBTVEnriched {
  const cast = details.credits?.cast || [];
  const crew = details.credits?.crew || [];
  
  return {
    ...basic,
    number_of_seasons: details.number_of_seasons || 0,
    number_of_episodes: details.number_of_episodes || 0,
    episode_run_time: details.episode_run_time || [],
    status: details.status || '',
    type: details.type || '',
    networks: details.networks || [],
    created_by: details.created_by || [],
    cast: cast.slice(0, 20),
    crew: crew.filter(c => ['Director', 'Producer', 'Writer', 'Creator', 'Executive Producer', 'Showrunner'].includes(c.job)).slice(0, 10),
    keywords: details.keywords?.results || [],
    production_companies: details.production_companies || [],
    mainCast: cast.slice(0, 10),
  };
}

async function enrichMovies(movies: TMDBMovie[], onProgress?: (current: number, total: number) => void): Promise<TMDBMovieEnriched[]> {
  const enriched: TMDBMovieEnriched[] = [];
  const batchSize = 5;
  
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (movie) => {
        try {
          const details = await getMovieDetails(movie.id);
          return enrichMovie(movie, details);
        } catch (error) {
          console.warn(`Failed to enrich movie ${movie.id}:`, error);
          return {
            ...movie,
            runtime: null,
            budget: 0,
            revenue: 0,
            tagline: '',
            status: '',
            cast: [],
            crew: [],
            keywords: [],
            production_companies: [],
            mainCast: [],
          } as TMDBMovieEnriched;
        }
      })
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        enriched.push(result.value);
      }
    }
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, movies.length), movies.length);
    }
  }
  
  return enriched;
}

async function enrichTVShows(shows: TMDBTVShow[], onProgress?: (current: number, total: number) => void): Promise<TMDBTVEnriched[]> {
  const enriched: TMDBTVEnriched[] = [];
  const batchSize = 5;
  
  for (let i = 0; i < shows.length; i += batchSize) {
    const batch = shows.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (show) => {
        try {
          const details = await getTVDetails(show.id);
          return enrichTVShow(show, details);
        } catch (error) {
          console.warn(`Failed to enrich TV show ${show.id}:`, error);
          return {
            ...show,
            number_of_seasons: 0,
            number_of_episodes: 0,
            episode_run_time: [],
            status: '',
            type: '',
            networks: [],
            created_by: [],
            cast: [],
            crew: [],
            keywords: [],
            production_companies: [],
            mainCast: [],
          } as TMDBTVEnriched;
        }
      })
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        enriched.push(result.value);
      }
    }
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, shows.length), shows.length);
    }
  }
  
  return enriched;
}

async function buildMoviePool(onProgress?: (step: string, progress: number) => void): Promise<TMDBMovie[]> {
  const allMovies: TMDBMovie[] = [];
  
  onProgress?.('Chargement des films populaires...', 0);
  
  for (let page = 1; page <= 10; page++) {
    try {
      const response = await getPopularMovies(page);
      allMovies.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch popular movies page ${page}`);
    }
  }
  
  onProgress?.('Chargement des meilleurs films...', 15);
  
  for (let page = 1; page <= 5; page++) {
    try {
      const response = await getTopRatedMovies(page);
      allMovies.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch top rated movies page ${page}`);
    }
  }
  
  onProgress?.('Chargement par décennies...', 25);
  
  const decades = [
    { start: '2020-01-01', end: '2029-12-31', label: '2020s' },
    { start: '2010-01-01', end: '2019-12-31', label: '2010s' },
    { start: '2000-01-01', end: '2009-12-31', label: '2000s' },
    { start: '1990-01-01', end: '1999-12-31', label: '1990s' },
    { start: '1980-01-01', end: '1989-12-31', label: '1980s' },
    { start: '1970-01-01', end: '1979-12-31', label: '1970s' },
  ];
  
  for (const decade of decades) {
    for (let page = 1; page <= 2; page++) {
      try {
        const response = await discoverMovies({
          'primary_release_date.gte': decade.start,
          'primary_release_date.lte': decade.end,
          'sort_by': 'popularity.desc',
          'vote_count.gte': '100',
        }, page);
        allMovies.push(...response.results);
      } catch (error) {
        console.warn(`Failed to fetch ${decade.label} movies`);
      }
    }
  }
  
  onProgress?.('Chargement par langues...', 45);
  
  const languages = ['fr', 'ko', 'ja', 'es', 'hi', 'it', 'de', 'zh'];
  
  for (const lang of languages) {
    try {
      const response = await discoverMovies({
        'with_original_language': lang,
        'sort_by': 'popularity.desc',
        'vote_count.gte': '50',
      });
      allMovies.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch ${lang} movies`);
    }
  }
  
  onProgress?.('Chargement par studios...', 60);
  
  const studios = [420, 128064, 3, 10342, 41077, 3172, 923, 2, 521, 1];
  
  for (const studioId of studios) {
    try {
      const response = await discoverMovies({
        'with_companies': String(studioId),
        'sort_by': 'popularity.desc',
      });
      allMovies.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch studio ${studioId} movies`);
    }
  }
  
  onProgress?.('Chargement par genres...', 75);
  
  const genres = ['27', '16', '99', '10749', '878', '14', '53', '80', '10752', '37'];
  
  for (const genre of genres) {
    try {
      const response = await discoverMovies({
        'with_genres': genre,
        'sort_by': 'vote_count.desc',
        'vote_count.gte': '100',
      });
      allMovies.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch genre ${genre} movies`);
    }
  }
  
  onProgress?.('Déduplication...', 90);
  
  const uniqueMap = new Map<number, TMDBMovie>();
  for (const movie of allMovies) {
    if (!uniqueMap.has(movie.id)) {
      uniqueMap.set(movie.id, movie);
    }
  }
  
  const unique = Array.from(uniqueMap.values());
  
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  
  console.log(`[TMDB] Built movie pool with ${unique.length} unique movies`);
  return unique;
}

async function buildTVPool(onProgress?: (step: string, progress: number) => void): Promise<TMDBTVShow[]> {
  const allShows: TMDBTVShow[] = [];
  
  onProgress?.('Chargement des séries populaires...', 0);
  
  for (let page = 1; page <= 10; page++) {
    try {
      const response = await getPopularTVShows(page);
      allShows.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch popular TV shows page ${page}`);
    }
  }
  
  onProgress?.('Chargement des meilleures séries...', 20);
  
  for (let page = 1; page <= 5; page++) {
    try {
      const response = await getTopRatedTVShows(page);
      allShows.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch top rated TV shows page ${page}`);
    }
  }
  
  onProgress?.('Chargement par plateformes...', 40);
  
  const networks = [213, 49, 1024, 2739, 2552, 174, 88, 67, 493];
  
  for (const networkId of networks) {
    try {
      const response = await discoverTVShows({
        'with_networks': String(networkId),
        'sort_by': 'popularity.desc',
      });
      allShows.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch network ${networkId} shows`);
    }
  }
  
  onProgress?.('Chargement par genres...', 70);
  
  const genres = ['18', '35', '10765', '80', '16', '10759', '9648'];
  
  for (const genre of genres) {
    try {
      const response = await discoverTVShows({
        'with_genres': genre,
        'sort_by': 'vote_count.desc',
        'vote_count.gte': '50',
      });
      allShows.push(...response.results);
    } catch (error) {
      console.warn(`Failed to fetch genre ${genre} shows`);
    }
  }
  
  onProgress?.('Déduplication...', 90);
  
  const uniqueMap = new Map<number, TMDBTVShow>();
  for (const show of allShows) {
    if (!uniqueMap.has(show.id)) {
      uniqueMap.set(show.id, show);
    }
  }
  
  const unique = Array.from(uniqueMap.values());
  
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  
  console.log(`[TMDB] Built TV pool with ${unique.length} unique shows`);
  return unique;
}

export async function getMediaPool(
  type: MediaType, 
  onProgress?: (step: string, progress: number) => void
): Promise<EnrichedMedia[]> {
  const cached = getCachedPool(type);
  if (cached && cached.length > 0) {
    onProgress?.('Chargé depuis le cache!', 100);
    return cached;
  }
  
  if (type === 'movie') {
    onProgress?.('Construction du pool de films...', 0);
    const basicMovies = await buildMoviePool(onProgress);
    const toEnrich = basicMovies.slice(0, 400);
    
    onProgress?.('Enrichissement des données...', 50);
    const enriched = await enrichMovies(toEnrich, (current, total) => {
      onProgress?.(`Enrichissement: ${current}/${total}`, 50 + (current / total) * 45);
    });
    
    onProgress?.('Terminé!', 100);
    setCachedPool(type, enriched);
    
    return enriched;
  } else {
    onProgress?.('Construction du pool de séries...', 0);
    const basicShows = await buildTVPool(onProgress);
    const toEnrich = basicShows.slice(0, 300);
    
    onProgress?.('Enrichissement des données...', 50);
    const enriched = await enrichTVShows(toEnrich, (current, total) => {
      onProgress?.(`Enrichissement: ${current}/${total}`, 50 + (current / total) * 45);
    });
    
    onProgress?.('Terminé!', 100);
    setCachedPool(type, enriched);
    
    return enriched;
  }
}

export function isMovie(item: EnrichedMedia): item is TMDBMovieEnriched {
  return 'title' in item;
}

export function isTVShow(item: EnrichedMedia): item is TMDBTVEnriched {
  return 'name' in item;
}

export function getTitle(item: EnrichedMedia): string {
  if (isMovie(item)) {
    return item.title;
  }
  return item.name;
}

export function getReleaseYear(item: EnrichedMedia): number {
  if (isMovie(item)) {
    return item.release_date ? new Date(item.release_date).getFullYear() : 0;
  }
  return item.first_air_date ? new Date(item.first_air_date).getFullYear() : 0;
}

export function hasActor(item: EnrichedMedia, actorId: number): boolean {
  return item.cast?.some(c => c.id === actorId) || false;
}

export function hasDirector(item: EnrichedMedia, directorId: number): boolean {
  if (isMovie(item)) {
    return item.director?.id === directorId || item.crew?.some(c => c.job === 'Director' && c.id === directorId) || false;
  }
  return item.created_by?.some(c => c.id === directorId) || 
         item.crew?.some(c => ['Director', 'Creator', 'Showrunner'].includes(c.job) && c.id === directorId) || 
         false;
}

export function hasProductionCompany(item: EnrichedMedia, companyId: number): boolean {
  return item.production_companies?.some(c => c.id === companyId) || false;
}

export function hasNetwork(item: EnrichedMedia, networkId: number): boolean {
  if (isTVShow(item)) {
    return item.networks?.some(n => n.id === networkId) || false;
  }
  return false;
}

export function hasKeyword(item: EnrichedMedia, keywordId: number): boolean {
  return item.keywords?.some(k => k.id === keywordId) || false;
}

export function hasKeywordByName(item: EnrichedMedia, keywordNames: string[]): boolean {
  if (!item.keywords || item.keywords.length === 0) return false;
  
  const itemKeywords = item.keywords.map(k => k.name.toLowerCase());
  return keywordNames.some(name => 
    itemKeywords.some(k => k.includes(name.toLowerCase()) || name.toLowerCase().includes(k))
  );
}
