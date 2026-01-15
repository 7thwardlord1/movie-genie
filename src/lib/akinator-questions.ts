import { AkinatorQuestion, AnswerType, TMDBMovie, TMDBTVShow, MOVIE_GENRES, TV_GENRES, MediaType } from '@/types/tmdb';
import { getReleaseYear, isMovie } from './tmdb';

const currentYear = new Date().getFullYear();

// Helper to check if answer leans positive
function isPositive(answer: AnswerType): boolean {
  return answer === 'yes' || answer === 'probably';
}

// Helper to check if answer leans negative
function isNegative(answer: AnswerType): boolean {
  return answer === 'no' || answer === 'probably_not';
}

export function getQuestions(mediaType: MediaType): AkinatorQuestion[] {
  const genres = mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;
  
  const questions: AkinatorQuestion[] = [
    // Popularity questions
    {
      id: 'very_popular',
      text: 'Est-ce un film/une série très populaire et connu(e) de tous ?',
      category: 'popularity',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const isVeryPopular = item.popularity > 50 && item.vote_count > 1000;
        return isPositive(answer) ? isVeryPopular : !isVeryPopular;
      },
    },
    {
      id: 'high_rated',
      text: 'Est-ce que ça a une très bonne note (8/10 ou plus) ?',
      category: 'popularity',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const isHighRated = item.vote_average >= 8;
        return isPositive(answer) ? isHighRated : !isHighRated;
      },
    },
    
    // Year questions
    {
      id: 'recent',
      text: 'Est-ce sorti après 2020 ?',
      category: 'year',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const year = getReleaseYear(item);
        const isRecent = year >= 2020;
        return isPositive(answer) ? isRecent : !isRecent;
      },
    },
    {
      id: 'modern',
      text: 'Est-ce sorti après 2010 ?',
      category: 'year',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const year = getReleaseYear(item);
        const isModern = year >= 2010;
        return isPositive(answer) ? isModern : !isModern;
      },
    },
    {
      id: 'classic',
      text: 'Est-ce un classique (avant 2000) ?',
      category: 'year',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const year = getReleaseYear(item);
        const isClassic = year < 2000 && year > 0;
        return isPositive(answer) ? isClassic : !isClassic;
      },
    },
    
    // Genre questions
    {
      id: 'genre_action',
      text: "Est-ce un film/une série d'action avec des scènes de combat ou de poursuite ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const actionGenres = mediaType === 'movie' ? [28, 12] : [10759];
        const hasAction = item.genre_ids.some(g => actionGenres.includes(g));
        return isPositive(answer) ? hasAction : !hasAction;
      },
    },
    {
      id: 'genre_comedy',
      text: 'Est-ce une comédie qui fait rire ?',
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasComedy = item.genre_ids.includes(35);
        return isPositive(answer) ? hasComedy : !hasComedy;
      },
    },
    {
      id: 'genre_drama',
      text: "Est-ce un drame avec des émotions fortes ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasDrama = item.genre_ids.includes(18);
        return isPositive(answer) ? hasDrama : !hasDrama;
      },
    },
    {
      id: 'genre_horror',
      text: 'Est-ce un film/une série qui fait peur (horreur/thriller) ?',
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasHorror = item.genre_ids.some(g => [27, 53].includes(g));
        return isPositive(answer) ? hasHorror : !hasHorror;
      },
    },
    {
      id: 'genre_scifi',
      text: "Y a-t-il de la science-fiction ou du fantastique ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const scifiGenres = mediaType === 'movie' ? [878, 14] : [10765];
        const hasScifi = item.genre_ids.some(g => scifiGenres.includes(g));
        return isPositive(answer) ? hasScifi : !hasScifi;
      },
    },
    {
      id: 'genre_animation',
      text: "Est-ce un film/une série d'animation ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasAnimation = item.genre_ids.includes(16);
        return isPositive(answer) ? hasAnimation : !hasAnimation;
      },
    },
    {
      id: 'genre_romance',
      text: "Y a-t-il une histoire d'amour importante ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasRomance = item.genre_ids.includes(10749);
        return isPositive(answer) ? hasRomance : !hasRomance;
      },
    },
    {
      id: 'genre_crime',
      text: "Est-ce lié au crime, à la police ou aux enquêtes ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasCrime = item.genre_ids.some(g => [80, 9648].includes(g));
        return isPositive(answer) ? hasCrime : !hasCrime;
      },
    },
    {
      id: 'genre_documentary',
      text: "Est-ce un documentaire ?",
      category: 'genre',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const hasDoc = item.genre_ids.includes(99);
        return isPositive(answer) ? hasDoc : !hasDoc;
      },
    },
    
    // Characteristics
    {
      id: 'family_friendly',
      text: "Est-ce adapté pour toute la famille / les enfants ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const familyGenres = mediaType === 'movie' ? [10751, 16] : [10751, 10762, 16];
        const isFamilyFriendly = item.genre_ids.some(g => familyGenres.includes(g)) && !item.genre_ids.some(g => [27, 53].includes(g));
        return isPositive(answer) ? isFamilyFriendly : !isFamilyFriendly;
      },
    },
    {
      id: 'adult_content',
      text: "Est-ce réservé aux adultes (contenu mature) ?",
      category: 'characteristics',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        if (isMovie(item)) {
          const isAdult = item.adult || item.genre_ids.some(g => [27, 53].includes(g));
          return isPositive(answer) ? isAdult : !isAdult;
        }
        return true;
      },
    },
    
    // Language questions
    {
      id: 'english',
      text: "Est-ce une production américaine ou anglaise ?",
      category: 'language',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const isEnglish = item.original_language === 'en';
        return isPositive(answer) ? isEnglish : !isEnglish;
      },
    },
    {
      id: 'french',
      text: "Est-ce une production française ?",
      category: 'language',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const isFrench = item.original_language === 'fr';
        return isPositive(answer) ? isFrench : !isFrench;
      },
    },
    {
      id: 'asian',
      text: "Est-ce une production asiatique (Japon, Corée, Chine...) ?",
      category: 'language',
      filterFn: (item, answer) => {
        if (answer === 'unknown') return true;
        const asianLanguages = ['ja', 'ko', 'zh', 'cn'];
        const isAsian = asianLanguages.includes(item.original_language);
        return isPositive(answer) ? isAsian : !isAsian;
      },
    },
  ];
  
  return questions;
}

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get a smart ordering of questions based on remaining candidates
export function getNextQuestion(
  questions: AkinatorQuestion[],
  askedQuestionIds: string[],
  candidates: (TMDBMovie | TMDBTVShow)[]
): AkinatorQuestion | null {
  const remainingQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
  
  if (remainingQuestions.length === 0) return null;
  
  // Score each question based on how well it splits the candidates
  const scoredQuestions = remainingQuestions.map(question => {
    let yesCount = 0;
    let noCount = 0;
    
    candidates.forEach(candidate => {
      if (question.filterFn(candidate, 'yes')) yesCount++;
      if (question.filterFn(candidate, 'no')) noCount++;
    });
    
    // Best questions split candidates close to 50/50
    const total = candidates.length;
    const balance = Math.abs(yesCount - noCount);
    const score = total - balance;
    
    return { question, score };
  });
  
  // Sort by score and pick the best one (with some randomization for variety)
  scoredQuestions.sort((a, b) => b.score - a.score);
  
  // Pick from top 3 for some variety
  const topQuestions = scoredQuestions.slice(0, Math.min(3, scoredQuestions.length));
  return topQuestions[Math.floor(Math.random() * topQuestions.length)].question;
}

// Filter candidates based on answer
export function filterCandidates(
  candidates: (TMDBMovie | TMDBTVShow)[],
  question: AkinatorQuestion,
  answer: AnswerType
): (TMDBMovie | TMDBTVShow)[] {
  if (answer === 'unknown') return candidates;
  
  return candidates.filter(candidate => question.filterFn(candidate, answer));
}

// Pick a guess from candidates
export function pickGuess(candidates: (TMDBMovie | TMDBTVShow)[]): TMDBMovie | TMDBTVShow | null {
  if (candidates.length === 0) return null;
  
  // Prefer more popular items as guesses
  const sorted = [...candidates].sort((a, b) => b.popularity - a.popularity);
  
  // Pick from top 5 with some randomization
  const topCandidates = sorted.slice(0, Math.min(5, sorted.length));
  return topCandidates[Math.floor(Math.random() * topCandidates.length)];
}
