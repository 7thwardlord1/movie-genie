import { AkinatorQuestion, AnswerType, MediaType, EnrichedMedia, TMDBMovieEnriched, TMDBTVEnriched } from '@/types/tmdb';
import { isMovie, isTVShow, getReleaseYear, hasActor, hasDirector, hasProductionCompany, hasNetwork, hasKeywordByName } from './tmdb';
import { FAMOUS_ACTORS, FAMOUS_DIRECTORS, PRODUCTION_COMPANIES, TV_NETWORKS } from '@/types/tmdb';

type MediaItem = EnrichedMedia;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hasGenre(item: MediaItem, genreIds: number[]): boolean {
  return item.genre_ids?.some(id => genreIds.includes(id)) || false;
}

function matchesKeywords(item: MediaItem, keywords: string[]): boolean {
  const title = isMovie(item) ? item.title : item.name;
  const originalTitle = isMovie(item) ? item.original_title : item.original_name;
  const overview = item.overview || '';
  const text = `${title} ${originalTitle} ${overview}`.toLowerCase();
  
  const textMatch = keywords.some(keyword => text.includes(keyword.toLowerCase()));
  const tmdbMatch = hasKeywordByName(item, keywords);
  
  return textMatch || tmdbMatch;
}

function shouldInclude(matchesCondition: boolean, answer: AnswerType): boolean {
  switch (answer) {
    case 'yes':
      return matchesCondition;
    case 'probably':
      return matchesCondition;
    case 'no':
      return !matchesCondition;
    case 'probably_not':
      return !matchesCondition;
    case 'unknown':
      return true;
    default:
      return true;
  }
}

// Helper to get movie-specific data
function getMovieData(item: MediaItem): TMDBMovieEnriched | null {
  return isMovie(item) ? item : null;
}

// Helper to get TV-specific data  
function getTVData(item: MediaItem): TMDBTVEnriched | null {
  return isTVShow(item) ? item : null;
}

// ============================================================================
// KEYWORD DATABASES (simplified - for text matching fallback)
// ============================================================================

const SUPERHERO_KEYWORDS = [
  'marvel', 'avengers', 'spider-man', 'spiderman', 'batman', 'superman', 'dc',
  'iron man', 'captain america', 'thor', 'hulk', 'x-men', 'deadpool',
  'wonder woman', 'justice league', 'aquaman', 'black panther',
  'guardians of the galaxy', 'doctor strange', 'black widow', 'shang-chi',
  'eternals', 'moon knight', 'she-hulk', 'loki', 'daredevil', 'the boys',
  'invincible', 'watchmen', 'the flash', 'superman & lois'
];

const CHRISTMAS_KEYWORDS = [
  'christmas', 'noel', 'noël', 'santa', 'holiday', 'xmas',
  'home alone', 'elf', 'grinch', 'polar express', 'love actually',
  'die hard', 'klaus', 'jingle', 'white christmas'
];

const ZOMBIE_KEYWORDS = [
  'zombie', 'zombies', 'undead', 'walking dead', 'outbreak', 'infected',
  'world war z', 'train to busan', '28 days', 'zombieland', 'resident evil',
  'all of us are dead', 'kingdom', 'army of the dead', 'last of us'
];

const VAMPIRE_KEYWORDS = [
  'vampire', 'vampires', 'dracula', 'twilight', 'blade', 'underworld',
  'true blood', 'what we do in the shadows', 'buffy', 'interview with the vampire',
  'castlevania', 'hotel transylvania'
];

const SPACE_KEYWORDS = [
  'space', 'star wars', 'star trek', 'galaxy', 'astronaut', 'interstellar',
  'gravity', 'martian', 'mars', 'moon', 'expanse', 'foundation',
  'for all mankind', 'battlestar', 'mandalorian', 'dune', 'ad astra'
];

const TIME_TRAVEL_KEYWORDS = [
  'time travel', 'back to the future', 'looper', 'terminator', '12 monkeys',
  'predestination', 'tenet', 'about time', 'edge of tomorrow', 'dark',
  'loki', 'umbrella academy', 'outlander', 'quantum leap', 'doctor who'
];

const HEIST_KEYWORDS = [
  'heist', 'robbery', 'bank', 'vault', "ocean's", 'italian job', 'heat',
  'inside man', 'money heist', 'casa de papel', 'now you see me', 'lupin',
  'the town', 'baby driver', 'snatch', 'reservoir dogs'
];

const BASED_ON_TRUE_STORY_KEYWORDS = [
  'true story', 'based on', 'biopic', 'biography', 'real events',
  'social network', 'wolf of wall street', 'schindler', 'spotlight',
  'the big short', 'bohemian rhapsody', 'hidden figures', 'oppenheimer'
];

const ANIME_KEYWORDS = [
  'anime', 'manga', 'naruto', 'one piece', 'attack on titan', 'demon slayer',
  'my hero academia', 'dragon ball', 'death note', 'jujutsu kaisen',
  'spy x family', 'chainsaw man', 'hunter x hunter', 'fullmetal',
  'your name', 'spirited away', 'ghibli', 'evangelion'
];

const DYSTOPIAN_KEYWORDS = [
  'dystopia', 'dystopian', 'hunger games', 'divergent', 'maze runner',
  'handmaid', 'black mirror', 'blade runner', 'children of men',
  'the 100', 'snowpiercer', 'brave new world', 'fahrenheit'
];

const FRANCHISE_KEYWORDS = ['2', '3', 'ii', 'iii', 'part', 'chapter', 'return', 'revenge', 'rises', 'sequel', 'remake'];

// ============================================================================
// QUESTION DEFINITIONS - 200+ QUESTIONS
// ============================================================================

export function getQuestions(mediaType: MediaType): AkinatorQuestion[] {
  const isTV = mediaType === 'tv';
  const mediaLabel = isTV ? 'série' : 'film';
  const mediaLabelCap = isTV ? 'Série' : 'Film';
  
  const questions: AkinatorQuestion[] = [];

  // ============================================================================
  // GENRE QUESTIONS (18) - Universal, high priority
  // ============================================================================
  
  questions.push(
    {
      id: 'animation',
      text: `Est-ce un ${mediaLabel} d'animation ?`,
      category: 'genre',
      priority: 10,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [16]), answer)
    },
    {
      id: 'comedy',
      text: 'Est-ce une comédie ?',
      category: 'genre',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [35]), answer)
    },
    {
      id: 'horror',
      text: `Est-ce un ${mediaLabel} d'horreur ?`,
      category: 'genre',
      priority: 10,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [27]), answer)
    },
    {
      id: 'action',
      text: `Est-ce un ${mediaLabel} d'action ?`,
      category: 'genre',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, isTV ? [10759] : [28, 12]), answer)
    },
    {
      id: 'drama',
      text: 'Est-ce un drame ?',
      category: 'genre',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [18]), answer)
    },
    {
      id: 'science_fiction',
      text: 'Est-ce de la science-fiction ?',
      category: 'genre',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, isTV ? [10765] : [878]), answer)
    },
    {
      id: 'fantasy',
      text: 'Est-ce fantastique (magie, créatures) ?',
      category: 'genre',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, isTV ? [10765] : [14]), answer)
    },
    {
      id: 'thriller',
      text: 'Est-ce un thriller ?',
      category: 'genre',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [53]), answer)
    },
    {
      id: 'romance',
      text: 'Est-ce romantique ?',
      category: 'genre',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10749]), answer)
    },
    {
      id: 'crime',
      text: `Est-ce un ${mediaLabel} policier / crime ?`,
      category: 'genre',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [80]), answer)
    },
    {
      id: 'documentary',
      text: 'Est-ce un documentaire ?',
      category: 'genre',
      priority: 10,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [99]), answer)
    },
    {
      id: 'family',
      text: `Est-ce un ${mediaLabel} familial / pour enfants ?`,
      category: 'genre',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, isTV ? [10751, 10762] : [10751]), answer)
    },
    {
      id: 'war',
      text: `Est-ce un ${mediaLabel} de guerre ?`,
      category: 'genre',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, isTV ? [10768] : [10752]), answer)
    },
    {
      id: 'western',
      text: 'Est-ce un western ?',
      category: 'genre',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [37]), answer)
    },
    {
      id: 'mystery',
      text: 'Est-ce un mystère / enquête ?',
      category: 'genre',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [9648]), answer)
    },
    {
      id: 'musical',
      text: `Est-ce un ${mediaLabel} musical ?`,
      category: 'genre',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10402]), answer)
    },
    {
      id: 'history',
      text: `Est-ce un ${mediaLabel} historique ?`,
      category: 'genre',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [36]), answer)
    },
    {
      id: 'adventure',
      text: `Est-ce un ${mediaLabel} d'aventure ?`,
      category: 'genre',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(hasGenre(item, isTV ? [10759] : [12]), answer)
    }
  );

  // ============================================================================
  // PERIOD / RELEASE YEAR (10) - High priority
  // ============================================================================
  
  questions.push(
    {
      id: 'after_2020',
      text: `Est-ce sorti après 2020 ?`,
      category: 'period',
      priority: 10,
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) > 2020, answer)
    },
    {
      id: 'after_2015',
      text: 'Est-ce sorti après 2015 ?',
      category: 'period',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) > 2015, answer)
    },
    {
      id: 'after_2010',
      text: 'Est-ce sorti après 2010 ?',
      category: 'period',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) > 2010, answer)
    },
    {
      id: 'between_2000_2009',
      text: 'Est-ce sorti dans les années 2000 (2000-2009) ?',
      category: 'period',
      priority: 6,
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2000 && year <= 2009, answer);
      }
    },
    {
      id: 'between_1990_1999',
      text: 'Est-ce sorti dans les années 90 ?',
      category: 'period',
      priority: 6,
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 1990 && year <= 1999, answer);
      }
    },
    {
      id: 'between_1980_1989',
      text: 'Est-ce sorti dans les années 80 ?',
      category: 'period',
      priority: 6,
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 1980 && year <= 1989, answer);
      }
    },
    {
      id: 'before_1980',
      text: 'Est-ce sorti avant 1980 ?',
      category: 'period',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) < 1980 && getReleaseYear(item) > 0, answer)
    },
    {
      id: 'very_recent',
      text: 'Est-ce sorti en 2023 ou 2024 ?',
      category: 'period',
      priority: 8,
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2023, answer);
      }
    },
    {
      id: '2010s',
      text: 'Est-ce sorti dans les années 2010 (2010-2019) ?',
      category: 'period',
      priority: 6,
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2010 && year <= 2019, answer);
      }
    },
    {
      id: 'classic_era',
      text: 'Est-ce un classique (avant 2000) ?',
      category: 'period',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) < 2000 && getReleaseYear(item) > 0, answer)
    }
  );

  // ============================================================================
  // LANGUAGE / ORIGIN (12) - High priority
  // ============================================================================
  
  questions.push(
    {
      id: 'english',
      text: 'Est-ce en anglais ?',
      category: 'language',
      priority: 10,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'en', answer)
    },
    {
      id: 'french',
      text: `Est-ce ${isTV ? 'une série française' : 'un film français'} ?`,
      category: 'language',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'fr', answer)
    },
    {
      id: 'korean',
      text: `Est-ce ${isTV ? 'une série coréenne (K-drama)' : 'un film coréen'} ?`,
      category: 'language',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'ko', answer)
    },
    {
      id: 'japanese',
      text: `Est-ce japonais ?`,
      category: 'language',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'ja', answer)
    },
    {
      id: 'spanish',
      text: `Est-ce espagnol ou latino-américain ?`,
      category: 'language',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'es', answer)
    },
    {
      id: 'indian',
      text: 'Est-ce indien / Bollywood ?',
      category: 'language',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(['hi', 'ta', 'te', 'ml', 'kn'].includes(item.original_language), answer)
    },
    {
      id: 'chinese',
      text: 'Est-ce chinois ?',
      category: 'language',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(['zh', 'cn'].includes(item.original_language), answer)
    },
    {
      id: 'german',
      text: 'Est-ce allemand ?',
      category: 'language',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'de', answer)
    },
    {
      id: 'italian',
      text: 'Est-ce italien ?',
      category: 'language',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(item.original_language === 'it', answer)
    },
    {
      id: 'scandinavian',
      text: 'Est-ce scandinave (suédois, danois, norvégien) ?',
      category: 'language',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(['sv', 'da', 'no', 'fi'].includes(item.original_language), answer)
    },
    {
      id: 'british',
      text: `Est-ce britannique ?`,
      category: 'language',
      priority: 6,
      filterFn: (item, answer) => {
        if (isTVShow(item)) {
          return shouldInclude(item.origin_country?.includes('GB') || false, answer);
        }
        return shouldInclude(false, answer); // Can't determine for movies without more data
      }
    },
    {
      id: 'non_english',
      text: `Est-ce ${isTV ? 'une série' : 'un film'} non-anglophone ?`,
      category: 'language',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(item.original_language !== 'en', answer)
    }
  );

  // ============================================================================
  // POPULARITY / RATINGS (8)
  // ============================================================================
  
  questions.push(
    {
      id: 'very_popular',
      text: 'Est-ce très populaire / un blockbuster ?',
      category: 'popularity',
      priority: 7,
      filterFn: (item, answer) => {
        const isVeryPopular = item.popularity > 100 || item.vote_count > 5000;
        return shouldInclude(isVeryPopular, answer);
      }
    },
    {
      id: 'highly_rated',
      text: 'Est-ce très bien noté (8+ sur TMDB) ?',
      category: 'popularity',
      priority: 6,
      filterFn: (item, answer) => {
        const isHighlyRated = item.vote_average >= 8.0 && item.vote_count > 1000;
        return shouldInclude(isHighlyRated, answer);
      }
    },
    {
      id: 'cult_classic',
      text: `Est-ce un classique culte ?`,
      category: 'popularity',
      priority: 5,
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        const isCult = (year < 2000 && item.vote_average >= 7.5 && item.vote_count > 1000);
        return shouldInclude(isCult, answer);
      }
    },
    {
      id: 'indie',
      text: `Est-ce ${isTV ? 'une série' : 'un film'} indépendant / petit budget ?`,
      category: 'popularity',
      priority: 5,
      filterFn: (item, answer) => {
        if (isMovie(item)) {
          return shouldInclude((item.budget || 0) < 20000000 && (item.budget || 0) > 0, answer);
        }
        return shouldInclude(item.popularity < 30, answer);
      }
    },
    {
      id: 'mega_blockbuster',
      text: 'Est-ce un méga-blockbuster (top films les plus vus) ?',
      category: 'popularity',
      priority: 6,
      filterFn: (item, answer) => {
        if (isMovie(item)) {
          return shouldInclude((item.revenue || 0) > 500000000, answer);
        }
        return shouldInclude(item.popularity > 200 && item.vote_count > 3000, answer);
      }
    },
    {
      id: 'underrated',
      text: `Est-ce considéré comme sous-estimé (bien noté mais peu connu) ?`,
      category: 'popularity',
      priority: 4,
      filterFn: (item, answer) => {
        const isUnderrated = item.vote_average >= 7.5 && item.vote_count < 2000 && item.popularity < 50;
        return shouldInclude(isUnderrated, answer);
      }
    },
    {
      id: 'mainstream',
      text: 'Est-ce grand public (pas un film de niche) ?',
      category: 'popularity',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(item.vote_count > 1000, answer)
    },
    {
      id: 'recently_trending',
      text: 'Est-ce actuellement tendance / sorti récemment ?',
      category: 'popularity',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(item.popularity > 80 && getReleaseYear(item) >= 2022, answer)
    }
  );

  // ============================================================================
  // THEMES & SPECIAL ELEMENTS (25)
  // ============================================================================
  
  questions.push(
    {
      id: 'superhero',
      text: `Est-ce ${isTV ? 'une série' : 'un film'} de super-héros ?`,
      category: 'theme',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, SUPERHERO_KEYWORDS) || 
        hasProductionCompany(item, PRODUCTION_COMPANIES['Marvel Studios']) ||
        hasProductionCompany(item, PRODUCTION_COMPANIES['DC Films']),
        answer
      )
    },
    {
      id: 'zombies',
      text: 'Y a-t-il des zombies ?',
      category: 'theme',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ZOMBIE_KEYWORDS), answer)
    },
    {
      id: 'vampires',
      text: 'Y a-t-il des vampires ?',
      category: 'theme',
      priority: 8,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, VAMPIRE_KEYWORDS), answer)
    },
    {
      id: 'space',
      text: `L'action se passe-t-elle dans l'espace ?`,
      category: 'theme',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, SPACE_KEYWORDS), answer)
    },
    {
      id: 'time_travel',
      text: 'Y a-t-il des voyages dans le temps ?',
      category: 'theme',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, TIME_TRAVEL_KEYWORDS), answer)
    },
    {
      id: 'heist',
      text: `Est-ce ${isTV ? 'une série' : 'un film'} de braquage ?`,
      category: 'theme',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, HEIST_KEYWORDS), answer)
    },
    {
      id: 'true_story',
      text: `Est-ce basé sur une histoire vraie ?`,
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, BASED_ON_TRUE_STORY_KEYWORDS) || hasGenre(item, [36]), 
        answer
      )
    },
    {
      id: 'christmas',
      text: `Est-ce ${isTV ? 'une série' : 'un film'} de Noël ?`,
      category: 'theme',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, CHRISTMAS_KEYWORDS), answer)
    },
    {
      id: 'anime',
      text: 'Est-ce un anime ?',
      category: 'theme',
      priority: 9,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ANIME_KEYWORDS) || 
        (hasGenre(item, [16]) && item.original_language === 'ja'),
        answer
      )
    },
    {
      id: 'dystopian',
      text: 'Est-ce dans un univers dystopique ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, DYSTOPIAN_KEYWORDS), answer)
    },
    {
      id: 'sequel_franchise',
      text: 'Est-ce une suite/partie d\'une franchise ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, FRANCHISE_KEYWORDS), answer)
    },
    {
      id: 'robots_ai',
      text: `Y a-t-il des robots ou de l'intelligence artificielle ?`,
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['robot', 'ai', 'artificial intelligence', 'android', 'cyborg', 
          'terminator', 'ex machina', 'westworld', 'i robot', 'wall-e', 'blade runner']),
        answer
      )
    },
    {
      id: 'post_apocalyptic',
      text: 'Est-ce post-apocalyptique ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['apocalypse', 'post-apocalyptic', 'end of the world', 'mad max', 
          'walking dead', 'last of us', 'fallout', 'the road', 'quiet place', 'bird box']),
        answer
      )
    },
    {
      id: 'sport',
      text: `Est-ce centré sur le sport ?`,
      category: 'theme',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['sport', 'football', 'basketball', 'baseball', 'boxing', 'rocky',
          'creed', 'ted lasso', 'friday night lights', 'moneyball', 'formula', 'f1', 'racing']),
        answer
      )
    },
    {
      id: 'legal_courtroom',
      text: 'Est-ce un drame juridique / de tribunal ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['lawyer', 'court', 'trial', 'judge', 'legal', 'attorney', 'suits',
          'better call saul', 'the good wife', 'lincoln lawyer', 'primal fear', 'a few good men']),
        answer
      )
    },
    {
      id: 'prison',
      text: `L'action se passe-t-elle en prison ?`,
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['prison', 'jail', 'inmate', 'shawshank', 'green mile', 'oz',
          'orange is the new black', 'prison break', 'escape from', 'con air']),
        answer
      )
    },
    {
      id: 'mafia_gangster',
      text: 'Est-ce sur la mafia / les gangsters ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['mafia', 'mob', 'gangster', 'godfather', 'goodfellas', 'scarface',
          'sopranos', 'peaky blinders', 'narcos', 'cartel', 'casino']),
        answer
      )
    },
    {
      id: 'serial_killer',
      text: 'Y a-t-il un tueur en série ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['serial killer', 'hannibal', 'dexter', 'mindhunter', 'se7en',
          'zodiac', 'silence of the lambs', 'dahmer', 'ted bundy', 'you']),
        answer
      )
    },
    {
      id: 'high_school',
      text: `L'action se passe-t-elle au lycée ?`,
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['high school', 'teenager', 'teen', 'prom', 'euphoria', 'riverdale',
          'mean girls', 'clueless', 'breakfast club', 'stranger things', 'never have i ever']),
        answer
      )
    },
    {
      id: 'college',
      text: `L'action se passe-t-elle à l'université ?`,
      category: 'theme',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['college', 'university', 'campus', 'frat', 'sorority', 'student',
          'social network', 'good will hunting', 'pitch perfect', 'legally blonde']),
        answer
      )
    },
    {
      id: 'medical',
      text: `Est-ce ${isTV ? 'une série médicale' : 'sur le monde médical'} ?`,
      category: 'theme',
      priority: 7,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['hospital', 'doctor', 'nurse', 'surgery', 'medical', "grey's anatomy",
          'house', 'the good doctor', 'chicago med', 'scrubs', 'er']),
        answer
      )
    },
    {
      id: 'spy_espionage',
      text: `Est-ce ${isTV ? 'une série' : 'un film'} d'espionnage ?`,
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['spy', 'espionage', 'cia', 'mi6', 'kgb', 'agent', 'james bond',
          'mission impossible', 'bourne', 'homeland', 'the americans', 'slow horses']),
        answer
      )
    },
    {
      id: 'disaster',
      text: `Est-ce un ${mediaLabel} catastrophe ?`,
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['disaster', 'earthquake', 'volcano', 'tsunami', 'hurricane',
          'armageddon', 'deep impact', '2012', 'san andreas', 'titanic', 'twister']),
        answer
      )
    },
    {
      id: 'dance_musical',
      text: 'Est-ce centré sur la danse ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['dance', 'dancing', 'ballet', 'step up', 'dirty dancing',
          'la la land', 'black swan', 'footloose', 'fame', 'billy elliot']),
        answer
      )
    },
    {
      id: 'cooking_food',
      text: 'Est-ce centré sur la cuisine / gastronomie ?',
      category: 'theme',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['chef', 'cook', 'restaurant', 'kitchen', 'food', 'ratatouille',
          'the bear', 'boiling point', 'jiro', 'julie & julia', 'masterchef']),
        answer
      )
    }
  );

  // ============================================================================
  // DIRECTORS - Using REAL TMDB IDs (25 for movies only)
  // ============================================================================
  
  if (!isTV) {
    questions.push(
      {
        id: 'director_nolan',
        text: 'Le réalisateur est-il Christopher Nolan ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Christopher Nolan']), answer)
      },
      {
        id: 'director_tarantino',
        text: 'Le réalisateur est-il Quentin Tarantino ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Quentin Tarantino']), answer)
      },
      {
        id: 'director_spielberg',
        text: 'Le réalisateur est-il Steven Spielberg ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Steven Spielberg']), answer)
      },
      {
        id: 'director_scorsese',
        text: 'Le réalisateur est-il Martin Scorsese ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Martin Scorsese']), answer)
      },
      {
        id: 'director_villeneuve',
        text: 'Le réalisateur est-il Denis Villeneuve ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Denis Villeneuve']), answer)
      },
      {
        id: 'director_ridley_scott',
        text: 'Le réalisateur est-il Ridley Scott ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Ridley Scott']), answer)
      },
      {
        id: 'director_james_cameron',
        text: 'Le réalisateur est-il James Cameron ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['James Cameron']), answer)
      },
      {
        id: 'director_wes_anderson',
        text: 'Le réalisateur est-il Wes Anderson ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Wes Anderson']), answer)
      },
      {
        id: 'director_fincher',
        text: 'Le réalisateur est-il David Fincher ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['David Fincher']), answer)
      },
      {
        id: 'director_kubrick',
        text: 'Le réalisateur est-il Stanley Kubrick ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Stanley Kubrick']), answer)
      },
      {
        id: 'director_hitchcock',
        text: 'Le réalisateur est-il Alfred Hitchcock ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Alfred Hitchcock']), answer)
      },
      {
        id: 'director_tim_burton',
        text: 'Le réalisateur est-il Tim Burton ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Tim Burton']), answer)
      },
      {
        id: 'director_peter_jackson',
        text: 'Le réalisateur est-il Peter Jackson ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Peter Jackson']), answer)
      },
      {
        id: 'director_del_toro',
        text: 'Le réalisateur est-il Guillermo del Toro ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Guillermo del Toro']), answer)
      },
      {
        id: 'director_greta_gerwig',
        text: 'Le réalisateur est-il Greta Gerwig ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Greta Gerwig']), answer)
      },
      {
        id: 'director_jordan_peele',
        text: 'Le réalisateur est-il Jordan Peele ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Jordan Peele']), answer)
      },
      {
        id: 'director_bong',
        text: 'Le réalisateur est-il Bong Joon-ho ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Bong Joon-ho']), answer)
      },
      {
        id: 'director_miyazaki',
        text: 'Le réalisateur est-il Hayao Miyazaki ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Hayao Miyazaki']), answer)
      },
      {
        id: 'director_chazelle',
        text: 'Le réalisateur est-il Damien Chazelle ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Damien Chazelle']), answer)
      },
      {
        id: 'director_ari_aster',
        text: 'Le réalisateur est-il Ari Aster ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Ari Aster']), answer)
      },
      {
        id: 'director_zack_snyder',
        text: 'Le réalisateur est-il Zack Snyder ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Zack Snyder']), answer)
      },
      {
        id: 'director_michael_bay',
        text: 'Le réalisateur est-il Michael Bay ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Michael Bay']), answer)
      },
      {
        id: 'director_guy_ritchie',
        text: 'Le réalisateur est-il Guy Ritchie ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Guy Ritchie']), answer)
      },
      {
        id: 'director_edgar_wright',
        text: 'Le réalisateur est-il Edgar Wright ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Edgar Wright']), answer)
      },
      {
        id: 'director_taika_waititi',
        text: 'Le réalisateur est-il Taika Waititi ?',
        category: 'director',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasDirector(item, FAMOUS_DIRECTORS['Taika Waititi']), answer)
      }
    );
  }

  // ============================================================================
  // ACTORS - Using REAL TMDB IDs (50 questions)
  // ============================================================================
  
  questions.push(
    {
      id: 'actor_dicaprio',
      text: 'Y a-t-il Leonardo DiCaprio ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Leonardo DiCaprio']), answer)
    },
    {
      id: 'actor_tom_hanks',
      text: 'Y a-t-il Tom Hanks ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Tom Hanks']), answer)
    },
    {
      id: 'actor_brad_pitt',
      text: 'Y a-t-il Brad Pitt ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Brad Pitt']), answer)
    },
    {
      id: 'actor_the_rock',
      text: "Y a-t-il Dwayne 'The Rock' Johnson ?",
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Dwayne Johnson']), answer)
    },
    {
      id: 'actor_timothee',
      text: 'Y a-t-il Timothée Chalamet ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Timothée Chalamet']), answer)
    },
    {
      id: 'actor_margot',
      text: 'Y a-t-il Margot Robbie ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Margot Robbie']), answer)
    },
    {
      id: 'actor_scarlett',
      text: 'Y a-t-il Scarlett Johansson ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Scarlett Johansson']), answer)
    },
    {
      id: 'actor_keanu',
      text: 'Y a-t-il Keanu Reeves ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Keanu Reeves']), answer)
    },
    {
      id: 'actor_rdj',
      text: 'Y a-t-il Robert Downey Jr. ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Robert Downey Jr.']), answer)
    },
    {
      id: 'actor_chris_evans',
      text: 'Y a-t-il Chris Evans ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Chris Evans']), answer)
    },
    {
      id: 'actor_chris_hemsworth',
      text: 'Y a-t-il Chris Hemsworth ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Chris Hemsworth']), answer)
    },
    {
      id: 'actor_tom_cruise',
      text: 'Y a-t-il Tom Cruise ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Tom Cruise']), answer)
    },
    {
      id: 'actor_will_smith',
      text: 'Y a-t-il Will Smith ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Will Smith']), answer)
    },
    {
      id: 'actor_samuel_jackson',
      text: 'Y a-t-il Samuel L. Jackson ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Samuel L. Jackson']), answer)
    },
    {
      id: 'actor_morgan_freeman',
      text: 'Y a-t-il Morgan Freeman ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Morgan Freeman']), answer)
    },
    {
      id: 'actor_denzel',
      text: 'Y a-t-il Denzel Washington ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Denzel Washington']), answer)
    },
    {
      id: 'actor_meryl',
      text: 'Y a-t-il Meryl Streep ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Meryl Streep']), answer)
    },
    {
      id: 'actor_cate',
      text: 'Y a-t-il Cate Blanchett ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Cate Blanchett']), answer)
    },
    {
      id: 'actor_emma_stone',
      text: 'Y a-t-il Emma Stone ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Emma Stone']), answer)
    },
    {
      id: 'actor_jennifer_lawrence',
      text: 'Y a-t-il Jennifer Lawrence ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Jennifer Lawrence']), answer)
    },
    {
      id: 'actor_ryan_gosling',
      text: 'Y a-t-il Ryan Gosling ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Ryan Gosling']), answer)
    },
    {
      id: 'actor_jake_gyllenhaal',
      text: 'Y a-t-il Jake Gyllenhaal ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Jake Gyllenhaal']), answer)
    },
    {
      id: 'actor_joaquin',
      text: 'Y a-t-il Joaquin Phoenix ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Joaquin Phoenix']), answer)
    },
    {
      id: 'actor_florence',
      text: 'Y a-t-il Florence Pugh ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Florence Pugh']), answer)
    },
    {
      id: 'actor_zendaya',
      text: 'Y a-t-il Zendaya ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Zendaya']), answer)
    },
    {
      id: 'actor_adam_driver',
      text: 'Y a-t-il Adam Driver ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Adam Driver']), answer)
    },
    {
      id: 'actor_oscar_isaac',
      text: 'Y a-t-il Oscar Isaac ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Oscar Isaac']), answer)
    },
    {
      id: 'actor_saoirse',
      text: 'Y a-t-il Saoirse Ronan ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Saoirse Ronan']), answer)
    },
    {
      id: 'actor_ana_de_armas',
      text: 'Y a-t-il Ana de Armas ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Ana de Armas']), answer)
    },
    {
      id: 'actor_austin_butler',
      text: 'Y a-t-il Austin Butler ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Austin Butler']), answer)
    },
    {
      id: 'actor_matt_damon',
      text: 'Y a-t-il Matt Damon ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Matt Damon']), answer)
    },
    {
      id: 'actor_christian_bale',
      text: 'Y a-t-il Christian Bale ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Christian Bale']), answer)
    },
    {
      id: 'actor_nicolas_cage',
      text: 'Y a-t-il Nicolas Cage ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Nicolas Cage']), answer)
    },
    {
      id: 'actor_harrison_ford',
      text: 'Y a-t-il Harrison Ford ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Harrison Ford']), answer)
    },
    {
      id: 'actor_al_pacino',
      text: 'Y a-t-il Al Pacino ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Al Pacino']), answer)
    },
    {
      id: 'actor_de_niro',
      text: 'Y a-t-il Robert De Niro ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Robert De Niro']), answer)
    },
    {
      id: 'actor_anthony_hopkins',
      text: 'Y a-t-il Anthony Hopkins ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Anthony Hopkins']), answer)
    },
    {
      id: 'actor_michael_caine',
      text: 'Y a-t-il Michael Caine ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Michael Caine']), answer)
    },
    {
      id: 'actor_tom_hardy',
      text: 'Y a-t-il Tom Hardy ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Tom Hardy']), answer)
    },
    {
      id: 'actor_cillian',
      text: 'Y a-t-il Cillian Murphy ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Cillian Murphy']), answer)
    },
    {
      id: 'actor_pedro_pascal',
      text: 'Y a-t-il Pedro Pascal ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Pedro Pascal']), answer)
    },
    {
      id: 'actor_jason_momoa',
      text: 'Y a-t-il Jason Momoa ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Jason Momoa']), answer)
    },
    {
      id: 'actor_gal_gadot',
      text: 'Y a-t-il Gal Gadot ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Gal Gadot']), answer)
    },
    {
      id: 'actor_henry_cavill',
      text: 'Y a-t-il Henry Cavill ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Henry Cavill']), answer)
    },
    {
      id: 'actor_anne_hathaway',
      text: 'Y a-t-il Anne Hathaway ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Anne Hathaway']), answer)
    },
    {
      id: 'actor_michelle_yeoh',
      text: 'Y a-t-il Michelle Yeoh ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Michelle Yeoh']), answer)
    },
    {
      id: 'actor_viola',
      text: 'Y a-t-il Viola Davis ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Viola Davis']), answer)
    },
    {
      id: 'actor_sandra',
      text: 'Y a-t-il Sandra Bullock ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Sandra Bullock']), answer)
    },
    {
      id: 'actor_julia',
      text: 'Y a-t-il Julia Roberts ?',
      category: 'actor',
      priority: 3,
      filterFn: (item, answer) => shouldInclude(hasActor(item, FAMOUS_ACTORS['Julia Roberts']), answer)
    }
  );

  // ============================================================================
  // STUDIOS / PRODUCTION COMPANIES - Using REAL TMDB IDs (15)
  // ============================================================================
  
  questions.push(
    {
      id: 'studio_marvel',
      text: 'Est-ce une production Marvel Studios ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Marvel Studios']), answer)
    },
    {
      id: 'studio_dc',
      text: 'Est-ce une production DC Films ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['DC Films']), answer)
    },
    {
      id: 'studio_pixar',
      text: 'Est-ce un film Pixar ?',
      category: 'studio',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Pixar']), answer)
    },
    {
      id: 'studio_disney',
      text: 'Est-ce une production Walt Disney ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Disney']), answer)
    },
    {
      id: 'studio_a24',
      text: 'Est-ce une production A24 ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['A24']), answer)
    },
    {
      id: 'studio_warner',
      text: 'Est-ce une production Warner Bros ?',
      category: 'studio',
      priority: 4,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Warner Bros']), answer)
    },
    {
      id: 'studio_universal',
      text: 'Est-ce une production Universal ?',
      category: 'studio',
      priority: 4,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Universal Pictures']), answer)
    },
    {
      id: 'studio_paramount',
      text: 'Est-ce une production Paramount ?',
      category: 'studio',
      priority: 4,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Paramount']), answer)
    },
    {
      id: 'studio_blumhouse',
      text: 'Est-ce une production Blumhouse ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Blumhouse']), answer)
    },
    {
      id: 'studio_ghibli',
      text: 'Est-ce un film du Studio Ghibli ?',
      category: 'studio',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Studio Ghibli']), answer)
    },
    {
      id: 'studio_dreamworks',
      text: 'Est-ce une production DreamWorks Animation ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['DreamWorks Animation']), answer)
    },
    {
      id: 'studio_lionsgate',
      text: 'Est-ce une production Lionsgate ?',
      category: 'studio',
      priority: 4,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Lionsgate']), answer)
    },
    {
      id: 'studio_lucasfilm',
      text: 'Est-ce une production Lucasfilm ?',
      category: 'studio',
      priority: 5,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Lucasfilm']), answer)
    },
    {
      id: 'studio_legendary',
      text: 'Est-ce une production Legendary Pictures ?',
      category: 'studio',
      priority: 4,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Legendary']), answer)
    },
    {
      id: 'studio_bad_robot',
      text: 'Est-ce une production Bad Robot (J.J. Abrams) ?',
      category: 'studio',
      priority: 4,
      filterFn: (item, answer) => shouldInclude(hasProductionCompany(item, PRODUCTION_COMPANIES['Bad Robot']), answer)
    }
  );

  // ============================================================================
  // TV NETWORKS - Using REAL TMDB IDs (TV only - 20)
  // ============================================================================
  
  if (isTV) {
    questions.push(
      {
        id: 'network_netflix',
        text: 'Est-ce une série Netflix ?',
        category: 'platform',
        priority: 6,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Netflix']), answer)
      },
      {
        id: 'network_hbo',
        text: 'Est-ce une série HBO ?',
        category: 'platform',
        priority: 6,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['HBO']), answer)
      },
      {
        id: 'network_amazon',
        text: 'Est-ce une série Amazon Prime Video ?',
        category: 'platform',
        priority: 6,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Amazon Prime Video']), answer)
      },
      {
        id: 'network_disney_plus',
        text: 'Est-ce une série Disney+ ?',
        category: 'platform',
        priority: 6,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Disney+']), answer)
      },
      {
        id: 'network_apple',
        text: 'Est-ce une série Apple TV+ ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Apple TV+']), answer)
      },
      {
        id: 'network_hulu',
        text: 'Est-ce une série Hulu ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Hulu']), answer)
      },
      {
        id: 'network_amc',
        text: 'Est-ce une série AMC ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['AMC']), answer)
      },
      {
        id: 'network_fx',
        text: 'Est-ce une série FX ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['FX']), answer)
      },
      {
        id: 'network_showtime',
        text: 'Est-ce une série Showtime ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Showtime']), answer)
      },
      {
        id: 'network_bbc',
        text: 'Est-ce une série BBC ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(
          hasNetwork(item, TV_NETWORKS['BBC']) || hasNetwork(item, TV_NETWORKS['BBC One']) || hasNetwork(item, TV_NETWORKS['BBC Two']),
          answer
        )
      },
      {
        id: 'network_nbc',
        text: 'Est-ce une série NBC ?',
        category: 'platform',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['NBC']), answer)
      },
      {
        id: 'network_cbs',
        text: 'Est-ce une série CBS ?',
        category: 'platform',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['CBS']), answer)
      },
      {
        id: 'network_abc',
        text: 'Est-ce une série ABC ?',
        category: 'platform',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['ABC']), answer)
      },
      {
        id: 'network_fox',
        text: 'Est-ce une série Fox ?',
        category: 'platform',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Fox']), answer)
      },
      {
        id: 'network_cw',
        text: 'Est-ce une série The CW ?',
        category: 'platform',
        priority: 4,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['The CW']), answer)
      },
      {
        id: 'network_canal',
        text: 'Est-ce une série Canal+ ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Canal+']), answer)
      },
      {
        id: 'network_tvn',
        text: 'Est-ce une série tvN (Corée) ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['tvN']), answer)
      },
      {
        id: 'network_adult_swim',
        text: 'Est-ce une série Adult Swim ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Adult Swim']), answer)
      },
      {
        id: 'network_cartoon_network',
        text: 'Est-ce une série Cartoon Network ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Cartoon Network']), answer)
      },
      {
        id: 'network_comedy_central',
        text: 'Est-ce une série Comedy Central ?',
        category: 'platform',
        priority: 5,
        filterFn: (item, answer) => shouldInclude(hasNetwork(item, TV_NETWORKS['Comedy Central']), answer)
      }
    );
  }

  // ============================================================================
  // TV-SPECIFIC QUESTIONS (20) - Using real data
  // ============================================================================
  
  if (isTV) {
    questions.push(
      {
        id: 'tv_many_seasons',
        text: 'Y a-t-il plus de 5 saisons ?',
        category: 'tv',
        priority: 7,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.number_of_seasons > 5, answer);
        }
      },
      {
        id: 'tv_mini_series',
        text: 'Est-ce une mini-série (1 saison) ?',
        category: 'tv',
        priority: 7,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.number_of_seasons === 1, answer);
        }
      },
      {
        id: 'tv_ended',
        text: 'Est-ce une série terminée ?',
        category: 'tv',
        priority: 6,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.status === 'Ended' || tv.status === 'Canceled', answer);
        }
      },
      {
        id: 'tv_ongoing',
        text: 'Est-ce une série toujours en cours ?',
        category: 'tv',
        priority: 6,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.status === 'Returning Series', answer);
        }
      },
      {
        id: 'tv_short_episodes',
        text: 'Les épisodes font-ils moins de 30 minutes ?',
        category: 'tv',
        priority: 5,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv || !tv.episode_run_time?.length) return shouldInclude(false, answer);
          const avgRuntime = tv.episode_run_time[0];
          return shouldInclude(avgRuntime < 30, answer);
        }
      },
      {
        id: 'tv_long_episodes',
        text: 'Les épisodes font-ils plus de 45 minutes ?',
        category: 'tv',
        priority: 5,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv || !tv.episode_run_time?.length) return shouldInclude(false, answer);
          const avgRuntime = tv.episode_run_time[0];
          return shouldInclude(avgRuntime > 45, answer);
        }
      },
      {
        id: 'tv_sitcom',
        text: 'Est-ce une sitcom ?',
        category: 'tv',
        priority: 7,
        filterFn: (item, answer) => shouldInclude(
          matchesKeywords(item, ['sitcom', 'friends', 'the office', 'brooklyn nine-nine', 
            'big bang', 'how i met your mother', 'modern family', "schitt's creek", 'ted lasso',
            'parks and recreation', 'community', 'new girl', 'superstore']),
          answer
        )
      },
      {
        id: 'tv_procedural',
        text: 'Est-ce une série procédurale (épisodes indépendants) ?',
        category: 'tv',
        priority: 6,
        filterFn: (item, answer) => shouldInclude(
          matchesKeywords(item, ['csi', 'ncis', 'law & order', 'criminal minds', 'bones',
            'castle', 'the mentalist', 'elementary', 'chicago', 'fbi', 'blue bloods']),
          answer
        )
      },
      {
        id: 'tv_anthology',
        text: 'Est-ce une série anthologie (histoire différente par saison) ?',
        category: 'tv',
        priority: 6,
        filterFn: (item, answer) => shouldInclude(
          matchesKeywords(item, ['anthology', 'black mirror', 'american horror story',
            'true detective', 'fargo', 'the sinner', 'american crime story']),
          answer
        )
      },
      {
        id: 'tv_reality',
        text: 'Est-ce de la télé-réalité ?',
        category: 'tv',
        priority: 8,
        filterFn: (item, answer) => shouldInclude(hasGenre(item, [10764, 10767]), answer)
      },
      {
        id: 'tv_talk_show',
        text: 'Est-ce un talk show ?',
        category: 'tv',
        priority: 8,
        filterFn: (item, answer) => shouldInclude(hasGenre(item, [10767]), answer)
      },
      {
        id: 'tv_many_episodes',
        text: 'Y a-t-il plus de 100 épisodes ?',
        category: 'tv',
        priority: 5,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.number_of_episodes > 100, answer);
        }
      },
      {
        id: 'tv_2_3_seasons',
        text: 'Y a-t-il entre 2 et 3 saisons ?',
        category: 'tv',
        priority: 5,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.number_of_seasons >= 2 && tv.number_of_seasons <= 3, answer);
        }
      },
      {
        id: 'tv_limited_series',
        text: 'Est-ce une série limitée (moins de 10 épisodes au total) ?',
        category: 'tv',
        priority: 6,
        filterFn: (item, answer) => {
          const tv = getTVData(item);
          if (!tv) return shouldInclude(false, answer);
          return shouldInclude(tv.number_of_episodes <= 10 && tv.number_of_seasons === 1, answer);
        }
      }
    );
  }

  // ============================================================================
  // MOVIE-SPECIFIC QUESTIONS (15) - Using real data
  // ============================================================================
  
  if (!isTV) {
    questions.push(
      {
        id: 'movie_long',
        text: 'Dure-t-il plus de 2h30 (150 minutes) ?',
        category: 'technical',
        priority: 5,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.runtime || 0) > 150, answer);
        }
      },
      {
        id: 'movie_short',
        text: 'Dure-t-il moins de 90 minutes ?',
        category: 'technical',
        priority: 5,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.runtime || 999) < 90, answer);
        }
      },
      {
        id: 'movie_big_budget',
        text: 'A-t-il un budget de plus de 100 millions $ ?',
        category: 'technical',
        priority: 5,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.budget || 0) > 100000000, answer);
        }
      },
      {
        id: 'movie_box_office_hit',
        text: 'A-t-il fait plus de 500 millions $ au box-office ?',
        category: 'technical',
        priority: 5,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.revenue || 0) > 500000000, answer);
        }
      },
      {
        id: 'movie_billion_club',
        text: 'A-t-il fait plus d\'un milliard $ au box-office ?',
        category: 'technical',
        priority: 6,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.revenue || 0) > 1000000000, answer);
        }
      },
      {
        id: 'movie_low_budget',
        text: 'Est-ce un film à petit budget (moins de 10 millions $) ?',
        category: 'technical',
        priority: 5,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.budget || 0) > 0 && (movie.budget || 0) < 10000000, answer);
        }
      },
      {
        id: 'movie_standard_length',
        text: 'Dure-t-il entre 1h30 et 2h ?',
        category: 'technical',
        priority: 4,
        filterFn: (item, answer) => {
          const movie = getMovieData(item);
          if (!movie) return shouldInclude(false, answer);
          return shouldInclude((movie.runtime || 0) >= 90 && (movie.runtime || 0) <= 120, answer);
        }
      }
    );
  }

  // ============================================================================
  // SPECIFIC FRANCHISES (15)
  // ============================================================================
  
  questions.push(
    {
      id: 'franchise_star_wars',
      text: `Est-ce de l'univers Star Wars ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['star wars', 'jedi', 'sith', 'skywalker', 'mandalorian', 
          'darth', 'yoda', 'lightsaber', 'force awakens', 'rogue one', 'andor', 'ahsoka']),
        answer
      )
    },
    {
      id: 'franchise_harry_potter',
      text: `Est-ce de l'univers Harry Potter / Fantastic Beasts ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['harry potter', 'hogwarts', 'wizard', 'voldemort', 'fantastic beasts',
          'dumbledore', 'grindelwald', 'hermione']),
        answer
      )
    },
    {
      id: 'franchise_lotr',
      text: `Est-ce de l'univers Le Seigneur des Anneaux / Hobbit ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['lord of the rings', 'hobbit', 'middle-earth', 'frodo', 'gandalf',
          'mordor', 'rings of power', 'tolkien', 'gollum']),
        answer
      )
    },
    {
      id: 'franchise_mcu',
      text: 'Est-ce du MCU (Marvel Cinematic Universe) ?',
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        hasProductionCompany(item, PRODUCTION_COMPANIES['Marvel Studios']) ||
        matchesKeywords(item, ['avengers', 'iron man', 'captain america', 'thor', 'black panther',
          'spider-man mcu', 'guardians of the galaxy', 'doctor strange', 'ant-man', 'eternals']),
        answer
      )
    },
    {
      id: 'franchise_dceu',
      text: 'Est-ce du DCEU (DC Extended Universe) ?',
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['superman', 'batman', 'wonder woman', 'aquaman', 'justice league',
          'suicide squad', 'shazam', 'black adam', 'the flash', 'blue beetle']),
        answer
      )
    },
    {
      id: 'franchise_fast_furious',
      text: `Est-ce de l'univers Fast & Furious ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['fast', 'furious', 'dom', 'toretto', 'hobbs and shaw', 'fast x']),
        answer
      )
    },
    {
      id: 'franchise_james_bond',
      text: `Est-ce de l'univers James Bond ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['james bond', 'bond', '007', 'skyfall', 'spectre', 'casino royale',
          'no time to die', 'goldeneye']),
        answer
      )
    },
    {
      id: 'franchise_jurassic',
      text: `Est-ce de l'univers Jurassic Park / World ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['jurassic park', 'jurassic world', 'dinosaur', 'velociraptor', 
          't-rex', 'dominion', 'fallen kingdom']),
        answer
      )
    },
    {
      id: 'franchise_mission_impossible',
      text: `Est-ce de l'univers Mission Impossible ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['mission impossible', 'ethan hunt', 'fallout', 'rogue nation',
          'ghost protocol', 'dead reckoning']),
        answer
      )
    },
    {
      id: 'franchise_matrix',
      text: `Est-ce de l'univers Matrix ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['matrix', 'neo', 'morpheus', 'trinity', 'reloaded', 'revolutions',
          'resurrections']),
        answer
      )
    },
    {
      id: 'franchise_pirates',
      text: `Est-ce de l'univers Pirates des Caraïbes ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['pirates of the caribbean', 'jack sparrow', 'black pearl',
          "dead man's chest", "at world's end"]),
        answer
      )
    },
    {
      id: 'franchise_john_wick',
      text: `Est-ce de l'univers John Wick ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['john wick', 'parabellum', 'continental', 'baba yaga']),
        answer
      )
    },
    {
      id: 'franchise_conjuring',
      text: `Est-ce du Conjuring Universe (horreur) ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['conjuring', 'annabelle', 'the nun', 'la llorona', 'warren']),
        answer
      )
    },
    {
      id: 'franchise_monsterverse',
      text: 'Est-ce du MonsterVerse (Godzilla, Kong) ?',
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['godzilla', 'kong', 'king kong', 'skull island', 'monarch',
          'godzilla vs kong', 'kaiju']),
        answer
      )
    },
    {
      id: 'franchise_dune',
      text: `Est-ce de l'univers Dune ?`,
      category: 'specific_franchise',
      priority: 6,
      filterFn: (item, answer) => shouldInclude(
        matchesKeywords(item, ['dune', 'arrakis', 'atreides', 'fremen', 'spice', 'paul atreides']),
        answer
      )
    }
  );

  return questions;
}

// ============================================================================
// GAME LOGIC - IMPROVED ALGORITHM
// ============================================================================

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function scoreQuestion(question: AkinatorQuestion, candidates: MediaItem[], questionsAsked: number): number {
  if (candidates.length === 0) return 0;
  
  let yesCount = 0;
  let noCount = 0;
  
  for (const candidate of candidates) {
    if (question.filterFn(candidate, 'yes')) yesCount++;
    if (question.filterFn(candidate, 'no')) noCount++;
  }
  
  const total = candidates.length;
  const yesRatio = yesCount / total;
  const noRatio = noCount / total;
  
  // Best score when 50/50 split
  const balance = 1 - Math.abs(yesRatio - noRatio);
  const filterPower = Math.min(yesRatio, noRatio) * 2;
  
  let score = balance * filterPower;
  
  // Penalize actor/director questions early in the game (before question 12)
  if (questionsAsked < 12 && ['actor', 'director'].includes(question.category)) {
    score *= 0.3;
  }
  
  // Boost priority questions
  if (question.priority) {
    score += (question.priority / 100);
  }
  
  return score;
}

const categoryPriority: Record<string, number> = {
  'genre': 1,
  'period': 2,
  'language': 3,
  'theme': 4,
  'tv': 3,
  'platform': 4,
  'studio': 5,
  'franchise': 5,
  'specific_franchise': 5,
  'subgenre': 6,
  'popularity': 6,
  'technical': 7,
  'director': 8,
  'actor': 9,
  'era': 5,
  'location': 6,
  'narrative': 7,
  'awards': 7,
  'characteristics': 6,
  'year': 4,
};

export function getNextQuestion(
  questions: AkinatorQuestion[],
  askedQuestionIds: string[],
  candidates: MediaItem[]
): AkinatorQuestion | null {
  const remainingQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
  
  if (remainingQuestions.length === 0 || candidates.length <= 1) {
    return null;
  }

  const questionsAsked = askedQuestionIds.length;
  
  const scoredQuestions = remainingQuestions.map(question => ({
    question,
    score: scoreQuestion(question, candidates, questionsAsked),
    priority: categoryPriority[question.category] || 5,
  }));

  scoredQuestions.sort((a, b) => {
    // Primary: score
    if (Math.abs(a.score - b.score) < 0.08) {
      // Secondary: category priority (lower = earlier)
      return a.priority - b.priority;
    }
    return b.score - a.score;
  });

  // Filter to only good questions (threshold 0.15 instead of 0.1)
  const goodQuestions = scoredQuestions.filter(sq => sq.score > 0.15);
  
  if (goodQuestions.length === 0) {
    // Fallback: pick best available
    return scoredQuestions[0]?.question || remainingQuestions[0];
  }

  // Pick randomly from top 3 to add variety
  const topQuestions = goodQuestions.slice(0, Math.min(3, goodQuestions.length));
  const randomIndex = Math.floor(Math.random() * topQuestions.length);
  
  return topQuestions[randomIndex].question;
}

export function filterCandidates(
  candidates: MediaItem[],
  question: AkinatorQuestion,
  answer: AnswerType
): MediaItem[] {
  if (answer === 'unknown') return candidates;
  
  const filtered = candidates.filter(candidate => question.filterFn(candidate, answer));
  
  // Never eliminate ALL candidates
  if (filtered.length === 0) {
    console.warn(`[Akinator] Filter "${question.id}" with answer "${answer}" would eliminate all ${candidates.length} candidates - keeping original pool`);
    return candidates;
  }
  
  // For "probably" / "probably_not", be more lenient
  if (answer === 'probably' || answer === 'probably_not') {
    const minToKeep = Math.max(1, Math.floor(candidates.length * 0.4));
    if (filtered.length < minToKeep) {
      const eliminated = candidates.filter(c => !filtered.includes(c));
      const toAdd = shuffleArray(eliminated).slice(0, minToKeep - filtered.length);
      return [...filtered, ...toAdd];
    }
  }
  
  console.log(`[Akinator] Question "${question.id}" (${answer}): ${candidates.length} → ${filtered.length} candidates`);
  
  return filtered;
}

export function pickGuess(candidates: MediaItem[]): MediaItem | null {
  if (candidates.length === 0) return null;
  
  // Score by popularity + rating
  const scored = candidates.map(c => ({
    item: c,
    score: (c.popularity * 0.6) + (c.vote_average * c.vote_count * 0.00005),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  // Weight random selection toward top candidates
  const topCount = Math.min(3, scored.length);
  const topCandidates = scored.slice(0, topCount);
  
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

export function getInitialQuestions(mediaType: MediaType): AkinatorQuestion[] {
  const allQuestions = getQuestions(mediaType);
  
  // Early priority questions - genres and period first
  const earlyPriorityIds = [
    'animation',
    'horror', 
    'comedy',
    'science_fiction',
    'after_2020',
    'english',
    'very_popular',
    'drama',
    'french',
    'action',
    'romance',
    'documentary',
    'fantasy'
  ];
  
  const prioritized: AkinatorQuestion[] = [];
  for (const id of earlyPriorityIds) {
    const q = allQuestions.find(q => q.id === id);
    if (q) prioritized.push(q);
  }
  
  const remaining = allQuestions.filter(q => !earlyPriorityIds.includes(q.id));
  
  return [...prioritized, ...shuffleArray(remaining)];
}
