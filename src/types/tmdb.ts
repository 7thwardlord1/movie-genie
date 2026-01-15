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

// Cast member from credits
export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  order: number;
  profile_path: string | null;
}

// Crew member from credits
export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// Keyword from TMDB
export interface TMDBKeyword {
  id: number;
  name: string;
}

// Production company
export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// Network (for TV shows)
export interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// Enriched movie with full details
export interface TMDBMovieEnriched extends TMDBMovie {
  runtime: number | null;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
  keywords: TMDBKeyword[];
  production_companies: TMDBProductionCompany[];
  // Computed helpers
  director?: TMDBCrewMember;
  mainCast: TMDBCastMember[]; // Top 10 actors
}

// Enriched TV show with full details
export interface TMDBTVEnriched extends TMDBTVShow {
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string; // "Returning Series", "Ended", "Canceled"
  type: string; // "Scripted", "Documentary", "Reality"
  networks: TMDBNetwork[];
  created_by: { id: number; name: string }[];
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
  keywords: TMDBKeyword[];
  production_companies: TMDBProductionCompany[];
  // Computed helpers
  mainCast: TMDBCastMember[]; // Top 10 actors
}

export type MediaType = 'movie' | 'tv';
export type EnrichedMedia = TMDBMovieEnriched | TMDBTVEnriched;

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
  category: 'genre' | 'subgenre' | 'period' | 'popularity' | 'characteristics' | 'language' | 'theme' | 'franchise' | 'tv' | 'year' | 'director' | 'actor' | 'specific_franchise' | 'era' | 'location' | 'narrative' | 'platform' | 'studio' | 'technical' | 'awards';
  filterFn: (item: EnrichedMedia, answer: AnswerType) => boolean;
  // Priority weight for question selection (higher = asked earlier)
  priority?: number;
}

export type AnswerType = 'yes' | 'no' | 'probably' | 'probably_not' | 'unknown';

export interface GameState {
  mediaType: MediaType | null;
  currentQuestionIndex: number;
  answers: Record<string, AnswerType>;
  candidates: EnrichedMedia[];
  currentGuess: EnrichedMedia | null;
  questionsAsked: number;
  isFinished: boolean;
  hasWon: boolean | null;
}

// TMDB IDs for famous people (for precise filtering)
export const FAMOUS_DIRECTORS: Record<string, number> = {
  'Christopher Nolan': 525,
  'Quentin Tarantino': 138,
  'Steven Spielberg': 488,
  'Martin Scorsese': 1032,
  'Denis Villeneuve': 137427,
  'Ridley Scott': 578,
  'James Cameron': 2710,
  'Wes Anderson': 5655,
  'David Fincher': 7467,
  'Stanley Kubrick': 240,
  'Alfred Hitchcock': 2636,
  'Tim Burton': 510,
  'Peter Jackson': 108,
  'Guillermo del Toro': 10828,
  'Coen Brothers': 1223,
  'Greta Gerwig': 45400,
  'Jordan Peele': 291263,
  'Bong Joon-ho': 21684,
  'Park Chan-wook': 10099,
  'Hayao Miyazaki': 608,
  'Damien Chazelle': 136495,
  'Ari Aster': 962178,
  'Robert Eggers': 156331,
  'Zack Snyder': 15217,
  'Michael Bay': 10096,
  'Guy Ritchie': 956,
  'Edgar Wright': 15277,
  'Taika Waititi': 55934,
  'Ryan Coogler': 82702,
  'The Russo Brothers': 19272,
};

export const FAMOUS_ACTORS: Record<string, number> = {
  'Leonardo DiCaprio': 6193,
  'Tom Hanks': 31,
  'Brad Pitt': 287,
  'Dwayne Johnson': 18918,
  'Timothée Chalamet': 1190668,
  'Margot Robbie': 234352,
  'Scarlett Johansson': 1245,
  'Keanu Reeves': 6384,
  'Robert Downey Jr.': 3223,
  'Chris Evans': 16828,
  'Chris Hemsworth': 74568,
  'Tom Cruise': 500,
  'Will Smith': 2888,
  'Samuel L. Jackson': 2231,
  'Morgan Freeman': 192,
  'Denzel Washington': 5292,
  'Meryl Streep': 5064,
  'Cate Blanchett': 112,
  'Emma Stone': 54693,
  'Jennifer Lawrence': 72129,
  'Ryan Gosling': 30614,
  'Jake Gyllenhaal': 131,
  'Joaquin Phoenix': 73421,
  'Florence Pugh': 560057,
  'Zendaya': 505710,
  'Adam Driver': 1023139,
  'Oscar Isaac': 79072,
  'Saoirse Ronan': 228969,
  'Ana de Armas': 224513,
  'Austin Butler': 11024,
  'Matt Damon': 1892,
  'Christian Bale': 3894,
  'Nicolas Cage': 2963,
  'Harrison Ford': 3,
  'Al Pacino': 1158,
  'Robert De Niro': 380,
  'Anthony Hopkins': 4173,
  'Michael Caine': 3895,
  'Tom Hardy': 2524,
  'Cillian Murphy': 2037,
  'Pedro Pascal': 1253360,
  'Jason Momoa': 117642,
  'Gal Gadot': 90633,
  'Henry Cavill': 73968,
  'Anne Hathaway': 1813,
  'Michelle Yeoh': 1620,
  'Viola Davis': 19492,
  'Sandra Bullock': 18277,
  'Julia Roberts': 1204,
};

export const PRODUCTION_COMPANIES: Record<string, number> = {
  'Marvel Studios': 420,
  'DC Films': 128064,
  'Warner Bros': 174,
  'Disney': 2,
  'Pixar': 3,
  'DreamWorks Animation': 521,
  'Universal Pictures': 33,
  'Paramount': 4,
  'Sony Pictures': 34,
  '20th Century Fox': 25,
  'Lionsgate': 1632,
  'A24': 41077,
  'Blumhouse': 3172,
  'Legendary': 923,
  'New Line Cinema': 12,
  'Studio Ghibli': 10342,
  'Bad Robot': 11461,
  'Plan B': 4081,
  'Lucasfilm': 1,
  'MGM': 8411,
  'Focus Features': 10146,
  'Searchlight Pictures': 43,
  'Neon': 90733,
  'Miramax': 14,
  'The Weinstein Company': 308,
  'Amblin Entertainment': 56,
};

export const TV_NETWORKS: Record<string, number> = {
  'Netflix': 213,
  'HBO': 49,
  'Amazon Prime Video': 1024,
  'Disney+': 2739,
  'Apple TV+': 2552,
  'Hulu': 453,
  'NBC': 6,
  'CBS': 16,
  'ABC': 2,
  'Fox': 19,
  'AMC': 174,
  'FX': 88,
  'Showtime': 67,
  'BBC': 4,
  'BBC One': 4,
  'BBC Two': 332,
  'ITV': 9,
  'Channel 4': 26,
  'The CW': 71,
  'Paramount+': 4330,
  'Peacock': 3353,
  'Starz': 318,
  'Syfy': 77,
  'USA Network': 30,
  'TNT': 41,
  'TBS': 68,
  'Comedy Central': 47,
  'MTV': 33,
  'Cartoon Network': 56,
  'Adult Swim': 80,
  'Nickelodeon': 13,
  'Disney Channel': 54,
  'Canal+': 285,
  'TF1': 52,
  'France 2': 83,
  'Arte': 98,
  'Netflix Korea': 213,
  'tvN': 493,
  'JTBC': 614,
  'MBC': 96,
  'KBS': 89,
};

// TMDB keyword IDs for precise filtering
export const TMDB_KEYWORDS: Record<string, number[]> = {
  'zombie': [12377, 1299],
  'vampire': [3133, 2556],
  'werewolf': [12564, 227979],
  'time_travel': [4379, 2964],
  'robot': [9951, 1426],
  'ai': [310, 9951],
  'superhero': [9715, 9717],
  'based_on_novel': [818, 378],
  'based_on_true_story': [9672, 3799],
  'based_on_comic': [9717, 180547],
  'sequel': [9663, 10683],
  'remake': [818, 10683],
  'revenge': [186789, 207317],
  'heist': [10291, 231671],
  'prison': [10084, 718],
  'post_apocalyptic': [4458, 12371],
  'dystopia': [4565, 12056],
  'space': [1432, 4565],
  'alien': [9882, 9951],
  'monster': [1299, 6152],
  'serial_killer': [10714, 207268],
  'spy': [10617, 10349],
  'martial_arts': [779, 188961],
  'coming_of_age': [10683, 2035],
  'road_trip': [699, 6552],
  'survival': [10236, 10237],
  'christmas': [207317, 4564],
  'wedding': [180545, 207313],
  'high_school': [2535, 3799],
  'college': [9826, 2535],
  'sports': [6075, 1701],
  'music': [6029, 6038],
  'dance': [6038, 10683],
  'war': [1956, 10085],
  'world_war_2': [2002, 14512],
  'vietnam_war': [1417, 10085],
  'cold_war': [209714, 6091],
  'medieval': [177912, 4390],
  'western': [611, 612],
  'noir': [853, 196269],
  'cult': [10093, 1299],
  'found_footage': [90396, 10683],
  'anthology': [4606, 14602],
  'twist_ending': [10683, 1732],
  'dream': [10224, 10093],
  'memory': [10683, 10087],
  'paranormal': [10093, 3133],
  'haunted_house': [3133, 158718],
  'exorcism': [3134, 3133],
  'slasher': [12339, 234213],
  'psychological': [10224, 853],
};

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
