export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export type MediaType = 'movie' | 'tv';

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface AkinatorQuestion {
  id: string;
  text: string;
  category: 'genre' | 'year' | 'popularity' | 'characteristics' | 'language';
  filterFn: (item: TMDBMovie | TMDBTVShow, answer: AnswerType) => boolean;
}

export type AnswerType = 'yes' | 'no' | 'probably' | 'probably_not' | 'unknown';

export interface GameState {
  mediaType: MediaType | null;
  currentQuestionIndex: number;
  answers: Record<string, AnswerType>;
  candidates: (TMDBMovie | TMDBTVShow)[];
  currentGuess: TMDBMovie | TMDBTVShow | null;
  questionsAsked: number;
  isFinished: boolean;
  hasWon: boolean | null;
}

// Genre IDs from TMDB
export const MOVIE_GENRES: TMDBGenre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentaire' },
  { id: 18, name: 'Drame' },
  { id: 10751, name: 'Familial' },
  { id: 14, name: 'Fantastique' },
  { id: 36, name: 'Histoire' },
  { id: 27, name: 'Horreur' },
  { id: 10402, name: 'Musique' },
  { id: 9648, name: 'Mystère' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science-Fiction' },
  { id: 10770, name: 'Téléfilm' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerre' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES: TMDBGenre[] = [
  { id: 10759, name: 'Action & Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentaire' },
  { id: 18, name: 'Drame' },
  { id: 10751, name: 'Familial' },
  { id: 10762, name: 'Enfants' },
  { id: 9648, name: 'Mystère' },
  { id: 10763, name: 'Actualités' },
  { id: 10764, name: 'Réalité' },
  { id: 10765, name: 'Science-Fiction & Fantastique' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'Guerre & Politique' },
  { id: 37, name: 'Western' },
];
