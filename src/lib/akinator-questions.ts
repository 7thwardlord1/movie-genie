import { AkinatorQuestion, AnswerType, TMDBMovie, TMDBTVShow, MediaType, MOVIE_GENRES, TV_GENRES } from '@/types/tmdb';
import { isMovie, getReleaseYear } from './tmdb';

// Superhero/franchise keywords detection
const SUPERHERO_KEYWORDS = ['marvel', 'avengers', 'spider', 'batman', 'superman', 'dc', 'x-men', 'iron man', 'captain america', 'thor', 'hulk', 'wonder woman', 'justice league', 'aquaman', 'flash'];
const FRANCHISE_KEYWORDS = ['2', '3', 'ii', 'iii', 'iv', 'part', 'chapter', 'episode', 'returns', 'revenge', 'rising', 'awakens', 'strikes', 'wars', 'saga'];

function matchesKeywords(item: TMDBMovie | TMDBTVShow, keywords: string[]): boolean {
  const title = isMovie(item) ? item.title.toLowerCase() : item.name.toLowerCase();
  const originalTitle = isMovie(item) ? item.original_title.toLowerCase() : item.original_name.toLowerCase();
  return keywords.some(keyword => title.includes(keyword) || originalTitle.includes(keyword));
}

function hasGenre(item: TMDBMovie | TMDBTVShow, genreIds: number[]): boolean {
  return item.genre_ids.some(id => genreIds.includes(id));
}

// Apply answer weight to filtering decision
function shouldInclude(matchesCondition: boolean, answer: AnswerType): boolean {
  switch (answer) {
    case 'yes':
      return matchesCondition;
    case 'no':
      return !matchesCondition;
    case 'probably':
      return matchesCondition;
    case 'probably_not':
      return !matchesCondition;
    case 'unknown':
      return true;
    default:
      return true;
  }
}

export function getQuestions(mediaType: MediaType): AkinatorQuestion[] {
  const baseQuestions: AkinatorQuestion[] = [
    // === POPULARITY & RATINGS ===
    {
      id: 'very_popular',
      text: "Est-ce un titre très connu du grand public ?",
      category: 'popularity',
      filterFn: (item, answer) => shouldInclude(item.popularity > 100, answer),
    },
    {
      id: 'critically_acclaimed',
      text: "Est-ce considéré comme un chef-d'œuvre ou très bien noté ?",
      category: 'popularity',
      filterFn: (item, answer) => shouldInclude(item.vote_average >= 8, answer),
    },
    {
      id: 'cult_classic',
      text: "Est-ce un film culte ou de niche ?",
      category: 'popularity',
      filterFn: (item, answer) => shouldInclude(item.popularity < 50 && item.vote_average >= 7, answer),
    },
    
    // === RELEASE PERIOD ===
    {
      id: 'very_recent',
      text: "Est-ce sorti dans les 3 dernières années (2023-2026) ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2023, answer);
      },
    },
    {
      id: 'recent_2020s',
      text: "Est-ce sorti dans les années 2020 (2020-2026) ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2020, answer);
      },
    },
    {
      id: 'recent_2010s',
      text: "Est-ce sorti dans les années 2010 (2010-2019) ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2010 && year <= 2019, answer);
      },
    },
    {
      id: 'era_2000s',
      text: "Est-ce sorti dans les années 2000 (2000-2009) ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2000 && year <= 2009, answer);
      },
    },
    {
      id: 'classic_pre2000',
      text: "Est-ce sorti avant l'an 2000 ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year > 0 && year < 2000, answer);
      },
    },
    {
      id: 'era_90s',
      text: "Est-ce sorti dans les années 90 ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 1990 && year <= 1999, answer);
      },
    },
    {
      id: 'era_80s_or_before',
      text: "Est-ce sorti dans les années 80 ou avant ?",
      category: 'year',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year > 0 && year <= 1989, answer);
      },
    },
    
    // === LANGUAGE & ORIGIN ===
    {
      id: 'english_language',
      text: "Est-ce en anglais à l'origine ?",
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'en', answer),
    },
    {
      id: 'french_language',
      text: "Est-ce un film/série français(e) ?",
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'fr', answer),
    },
    {
      id: 'asian_origin',
      text: "Est-ce d'origine asiatique (Japon, Corée, Chine) ?",
      category: 'language',
      filterFn: (item, answer) => shouldInclude(['ja', 'ko', 'zh', 'cn'].includes(item.original_language), answer),
    },
    {
      id: 'european_non_english',
      text: "Est-ce européen mais pas anglophone ?",
      category: 'language',
      filterFn: (item, answer) => shouldInclude(['fr', 'de', 'es', 'it', 'pt', 'nl', 'sv', 'da', 'no', 'pl'].includes(item.original_language), answer),
    },
    
    // === CHARACTERISTICS & THEMES ===
    {
      id: 'superhero',
      text: "Est-ce un film/série de super-héros (Marvel, DC) ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const isSuperHero = matchesKeywords(item, SUPERHERO_KEYWORDS) || 
                           hasGenre(item, [28, 878, 14, 10765]) && matchesKeywords(item, ['man', 'woman', 'super', 'hero']);
        return shouldInclude(isSuperHero, answer);
      },
    },
    {
      id: 'franchise_sequel',
      text: "Est-ce une suite, un remake ou fait partie d'une franchise ?",
      category: 'characteristics',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, FRANCHISE_KEYWORDS), answer),
    },
    {
      id: 'adult_content',
      text: "Est-ce réservé à un public adulte (violent, mature) ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const isAdult = (isMovie(item) && item.adult) || hasGenre(item, [27, 53, 80]);
        return shouldInclude(isAdult, answer);
      },
    },
    {
      id: 'family_friendly',
      text: "Est-ce adapté aux enfants/familles ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const isFamily = hasGenre(item, [16, 10751, 10762]);
        return shouldInclude(isFamily, answer);
      },
    },
    {
      id: 'based_on_book',
      text: "Est-ce basé sur un livre, comic ou jeu vidéo ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const adaptationKeywords = ['harry potter', 'lord of the rings', 'game of thrones', 'hunger games', 'twilight', 'dune', 'witcher', 'resident evil', 'assassin', 'tomb raider'];
        return shouldInclude(matchesKeywords(item, adaptationKeywords), answer);
      },
    },
    {
      id: 'true_story',
      text: "Est-ce basé sur une histoire vraie ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const trueStoryGenres = [36, 99];
        return shouldInclude(hasGenre(item, trueStoryGenres), answer);
      },
    },
  ];

  // === GENRE-SPECIFIC QUESTIONS ===
  const genreQuestions: AkinatorQuestion[] = [
    {
      id: 'genre_action_adventure',
      text: "Y a-t-il beaucoup d'action et d'aventure ?",
      category: 'genre',
      filterFn: (item, answer) => {
        const actionGenres = mediaType === 'movie' ? [28, 12] : [10759];
        return shouldInclude(hasGenre(item, actionGenres), answer);
      },
    },
    {
      id: 'genre_comedy',
      text: "Est-ce une comédie ou c'est drôle ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [35]), answer),
    },
    {
      id: 'genre_drama',
      text: "Est-ce un drame sérieux/émouvant ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [18]), answer),
    },
    {
      id: 'genre_horror_thriller',
      text: "Est-ce effrayant ou angoissant (horreur/thriller) ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [27, 53]), answer),
    },
    {
      id: 'genre_scifi',
      text: "Est-ce de la science-fiction ?",
      category: 'genre',
      filterFn: (item, answer) => {
        const scifiGenres = mediaType === 'movie' ? [878] : [10765];
        return shouldInclude(hasGenre(item, scifiGenres), answer);
      },
    },
    {
      id: 'genre_fantasy',
      text: "Est-ce fantastique/fantasy (magie, créatures) ?",
      category: 'genre',
      filterFn: (item, answer) => {
        const fantasyGenres = mediaType === 'movie' ? [14] : [10765];
        return shouldInclude(hasGenre(item, fantasyGenres), answer);
      },
    },
    {
      id: 'genre_romance',
      text: "Y a-t-il une histoire d'amour importante ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10749]), answer),
    },
    {
      id: 'genre_animation',
      text: "Est-ce un film/série d'animation ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [16]), answer),
    },
    {
      id: 'genre_crime_mystery',
      text: "Y a-t-il une enquête policière ou un mystère ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [80, 9648]), answer),
    },
    {
      id: 'genre_documentary',
      text: "Est-ce un documentaire ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [99]), answer),
    },
    {
      id: 'genre_war',
      text: "Est-ce sur la guerre ou le militaire ?",
      category: 'genre',
      filterFn: (item, answer) => {
        const warGenres = mediaType === 'movie' ? [10752] : [10768];
        return shouldInclude(hasGenre(item, warGenres), answer);
      },
    },
    {
      id: 'genre_musical',
      text: "Y a-t-il beaucoup de musique ou de chansons ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10402]), answer),
    },
    {
      id: 'genre_western',
      text: "Est-ce un western ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [37]), answer),
    },
  ];

  // TV-specific questions
  const tvQuestions: AkinatorQuestion[] = mediaType === 'tv' ? [
    {
      id: 'tv_long_running',
      text: "Est-ce une série avec beaucoup de saisons (5+) ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        return shouldInclude(item.vote_count > 5000, answer);
      },
    },
    {
      id: 'tv_miniseries',
      text: "Est-ce une mini-série ou série limitée ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        return shouldInclude(item.vote_count < 1000 && item.vote_average >= 7, answer);
      },
    },
    {
      id: 'tv_ongoing',
      text: "Est-ce une série toujours en cours de diffusion ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const tvItem = item as TMDBTVShow;
        const firstAirYear = tvItem.first_air_date ? new Date(tvItem.first_air_date).getFullYear() : 0;
        return shouldInclude(firstAirYear >= 2020 && item.popularity > 50, answer);
      },
    },
    {
      id: 'tv_streaming_original',
      text: "Est-ce une production Netflix, Amazon ou Disney+ ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        const streamingKeywords = ['netflix', 'amazon', 'disney', 'hbo', 'apple'];
        return shouldInclude(matchesKeywords(item, streamingKeywords) || item.popularity > 80, answer);
      },
    },
  ] : [];

  return [...baseQuestions, ...genreQuestions, ...tvQuestions];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Score a question by how well it splits the candidates (closer to 50/50 = better)
function scoreQuestion(question: AkinatorQuestion, candidates: (TMDBMovie | TMDBTVShow)[]): number {
  if (candidates.length === 0) return 0;
  
  let yesCount = 0;
  let noCount = 0;
  
  for (const candidate of candidates) {
    if (question.filterFn(candidate, 'yes')) {
      yesCount++;
    }
    if (question.filterFn(candidate, 'no')) {
      noCount++;
    }
  }
  
  const total = candidates.length;
  const yesRatio = yesCount / total;
  const noRatio = noCount / total;
  
  // Best score when both are around 0.5
  const balance = 1 - Math.abs(yesRatio - noRatio);
  
  // Penalize questions that don't filter much
  const filterPower = Math.min(yesRatio, noRatio) * 2;
  
  return balance * filterPower;
}

// Category priority for question order
const categoryPriority: Record<string, number> = {
  'genre': 1,
  'year': 2,
  'language': 3,
  'characteristics': 4,
  'popularity': 5,
};

export function getNextQuestion(
  questions: AkinatorQuestion[],
  askedQuestionIds: string[],
  candidates: (TMDBMovie | TMDBTVShow)[]
): AkinatorQuestion | null {
  const remainingQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
  
  if (remainingQuestions.length === 0 || candidates.length <= 1) {
    return null;
  }

  // Score all remaining questions
  const scoredQuestions = remainingQuestions.map(question => ({
    question,
    score: scoreQuestion(question, candidates),
    priority: categoryPriority[question.category] || 5,
  }));

  // Sort by: high score first, then by category priority
  scoredQuestions.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.1) {
      return a.priority - b.priority;
    }
    return b.score - a.score;
  });

  // Filter out questions with very low scores
  const goodQuestions = scoredQuestions.filter(sq => sq.score > 0.1);
  
  if (goodQuestions.length === 0) {
    return remainingQuestions[0];
  }

  // Add randomness among top questions
  const topQuestions = goodQuestions.slice(0, Math.min(3, goodQuestions.length));
  const randomIndex = Math.floor(Math.random() * topQuestions.length);
  
  return topQuestions[randomIndex].question;
}

export function filterCandidates(
  candidates: (TMDBMovie | TMDBTVShow)[],
  question: AkinatorQuestion,
  answer: AnswerType
): (TMDBMovie | TMDBTVShow)[] {
  if (answer === 'unknown') return candidates;
  
  const filtered = candidates.filter(candidate => question.filterFn(candidate, answer));
  
  // Never reduce to 0 candidates
  if (filtered.length === 0) {
    console.warn('Filter would eliminate all candidates, keeping original pool');
    return candidates;
  }
  
  // For uncertain answers, keep more candidates
  if (answer === 'probably' || answer === 'probably_not') {
    const minToKeep = Math.max(1, Math.floor(candidates.length * 0.3));
    if (filtered.length < minToKeep) {
      const eliminated = candidates.filter(c => !filtered.includes(c));
      const toAdd = shuffleArray(eliminated).slice(0, minToKeep - filtered.length);
      return [...filtered, ...toAdd];
    }
  }
  
  return filtered;
}

export function pickGuess(candidates: (TMDBMovie | TMDBTVShow)[]): TMDBMovie | TMDBTVShow | null {
  if (candidates.length === 0) return null;
  
  // Sort by popularity + vote score
  const scored = candidates.map(c => ({
    item: c,
    score: (c.popularity * 0.7) + (c.vote_average * c.vote_count * 0.0001),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  const topCount = Math.min(3, scored.length);
  const topCandidates = scored.slice(0, topCount);
  
  // Weighted random selection
  const totalScore = topCandidates.reduce((sum, c) => sum + c.score, 0);
  let random = Math.random() * totalScore;
  
  for (const candidate of topCandidates) {
    random -= candidate.score;
    if (random <= 0) {
      return candidate.item;
    }
  }
  
  return topCandidates[0].item;
}

// Get initial questions prioritized for a good start
export function getInitialQuestions(mediaType: MediaType): AkinatorQuestion[] {
  const allQuestions = getQuestions(mediaType);
  
  const priorityOrder = ['genre_animation', 'recent_2020s', 'english_language', 'genre_action_adventure', 'genre_comedy'];
  
  const prioritized: AkinatorQuestion[] = [];
  for (const id of priorityOrder) {
    const q = allQuestions.find(q => q.id === id);
    if (q) prioritized.push(q);
  }
  
  const remaining = allQuestions.filter(q => !priorityOrder.includes(q.id));
  
  return [...prioritized, ...shuffleArray(remaining)];
}
