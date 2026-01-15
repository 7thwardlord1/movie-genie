import { AkinatorQuestion, AnswerType, TMDBMovie, TMDBTVShow, MediaType } from '@/types/tmdb';
import { isMovie, getReleaseYear } from './tmdb';

type MediaItem = TMDBMovie | TMDBTVShow;

// ============================================================================
// KEYWORD DATABASES
// ============================================================================

const SUPERHERO_KEYWORDS = [
  'marvel', 'avengers', 'spider-man', 'spiderman', 'batman', 'superman', 'dc',
  'iron man', 'captain america', 'thor', 'hulk', 'x-men', 'xmen', 'deadpool',
  'wonder woman', 'justice league', 'aquaman', 'flash', 'black panther',
  'guardians of the galaxy', 'ant-man', 'doctor strange', 'black widow',
  'shazam', 'joker', 'suicide squad', 'watchmen', 'daredevil', 'punisher',
  'fantastic four', 'venom', 'morbius', 'eternals', 'moon knight', 'she-hulk',
  'ms marvel', 'loki', 'hawkeye', 'falcon', 'winter soldier', 'wanda', 'vision'
];

const DISNEY_PIXAR_KEYWORDS = [
  'disney', 'pixar', 'frozen', 'toy story', 'finding nemo', 'finding dory',
  'monsters inc', 'monsters university', 'incredibles', 'up', 'inside out',
  'coco', 'soul', 'luca', 'turning red', 'encanto', 'ratatouille', 'wall-e',
  'brave', 'cars', 'tangled', 'moana', 'zootopia', 'big hero', 'wreck-it ralph',
  'ralph breaks', 'princess', 'lion king', 'little mermaid', 'beauty and the beast',
  'aladdin', 'mulan', 'pocahontas', 'hercules', 'tarzan', 'lilo', 'stitch',
  'bolt', 'onward', 'elemental', 'lightyear', 'strange world'
];

const GHIBLI_KEYWORDS = [
  'ghibli', 'miyazaki', 'totoro', 'spirited away', 'howl', 'mononoke', 'kiki',
  'ponyo', 'arrietty', 'wind rises', 'marnie', 'nausicaa', 'laputa', 'castle in the sky',
  'porco rosso', 'whisper of the heart', 'grave of the fireflies', 'pom poko',
  'tale of princess kaguya', 'when marnie was there', 'from up on poppy hill'
];

const A24_KEYWORDS = [
  'a24', 'hereditary', 'midsommar', 'uncut gems', 'moonlight', 'lady bird',
  'everything everywhere', 'ex machina', 'the witch', 'lighthouse', 'green knight',
  'room', 'eighth grade', 'mid90s', 'good time', 'killing of a sacred deer',
  'lobster', 'florida project', 'spring breakers', 'under the skin', 'enemy',
  'it comes at night', 'first reformed', 'minari', 'past lives', 'talk to me',
  'bodies bodies bodies', 'x', 'pearl', 'men', 'marcel the shell', 'aftersun'
];

const CHRISTMAS_KEYWORDS = [
  'christmas', 'noel', 'noël', 'santa', 'holiday', 'xmas', 'miracle on',
  'home alone', 'elf', 'grinch', 'nightmare before christmas', 'polar express',
  'die hard', 'love actually', 'carol', 'scrooge', 'snow', 'winter', 'rudolph',
  'nutcracker', 'klaus', 'jingle', 'frosty', 'white christmas'
];

const ZOMBIE_KEYWORDS = [
  'zombie', 'zombies', 'undead', 'walking dead', 'dead', 'outbreak', 'infected',
  'apocalypse', 'world war z', 'train to busan', 'resident evil', '28 days',
  '28 weeks', 'dawn of the dead', 'shaun of the dead', 'warm bodies', 'zombieland',
  'i am legend', 'army of the dead', 'all of us are dead', 'kingdom', 'alive',
  'cargo', 'peninsula', 'girl with all the gifts', 'night of the living'
];

const VAMPIRE_KEYWORDS = [
  'vampire', 'vampires', 'dracula', 'nosferatu', 'blood', 'twilight', 'blade',
  'underworld', 'interview with the vampire', 'true blood', 'what we do in the shadows',
  'buffy', 'from dusk till dawn', 'let the right one in', 'only lovers left alive',
  'fright night', '30 days of night', 'daybreakers', 'hotel transylvania', 'morbius',
  'van helsing', 'castlevania', 'first kill', 'abraham lincoln vampire'
];

const SPACE_KEYWORDS = [
  'space', 'star wars', 'star trek', 'galaxy', 'mars', 'moon', 'astronaut',
  'alien', 'aliens', 'interstellar', 'gravity', 'martian', 'arrival', 'cosmos',
  'planet', 'nasa', 'rocket', 'spaceship', 'starship', 'universe', 'solar',
  'asteroid', 'comet', 'orbit', 'apollo', 'dune', 'foundation', 'expanse',
  'battlestar', 'firefly', 'mandalorian', 'guardians', 'lightyear', 'ad astra',
  'first man', 'europa report', 'passengers', 'life', 'event horizon', 'sunshine',
  'silent running', '2001', 'prometheus', 'covenant'
];

const UNDERWATER_KEYWORDS = [
  'underwater', 'ocean', 'sea', 'submarine', 'shark', 'jaws', 'deep', 'dive',
  'aquatic', 'mermaid', 'atlantis', 'abyss', 'titanic', 'meg', 'megalodon',
  'finding nemo', 'finding dory', 'little mermaid', 'aquaman', 'the deep',
  'leviathan', 'sphere', 'pacific rim', 'hunt for red october',
  'das boot', 'crimson tide', 'u-571', 'greyhound', 'poseidon'
];

const DINOSAUR_KEYWORDS = [
  'dinosaur', 'dinosaurs', 'jurassic', 'rex', 'raptor', 'prehistoric', 'dino',
  'land before time', 'good dinosaur', 'walking with dinosaurs', 'primal',
  'king kong', 'lost world', 'dinotopia'
];

const PRISON_KEYWORDS = [
  'prison', 'jail', 'inmate', 'escape', 'shawshank', 'green mile', 'convict',
  'cell', 'alcatraz', 'prisoner', 'penitentiary', 'warden', 'sentenced',
  'death row', 'lockup', 'correctional', 'behind bars', 'el chapo', 'narcos',
  'orange is the new black', 'oz', 'prison break', 'escape from', 'con air',
  'papillon', 'midnight express', 'cool hand luke', 'american history x'
];

const HEIST_KEYWORDS = [
  'heist', 'robbery', 'rob', 'theft', 'steal', 'bank', 'casino', 'vault',
  'safe', 'caper', 'con', 'hustle', 'score', 'payday',
  "ocean's", 'oceans', 'italian job', 'heat', 'inside man', 'money heist',
  'casa de papel', 'now you see me', 'baby driver', 'logan lucky', 'the town',
  'point break', 'fast five', 'army of thieves', 'lupin', 'red notice',
  'thomas crown', 'snatch', 'lock stock', 'reservoir dogs', 'american animals'
];

const MARTIAL_ARTS_KEYWORDS = [
  'martial arts', 'kung fu', 'karate', 'judo', 'taekwondo', 'mma', 'fighting',
  'fighter', 'bruce lee', 'jackie chan', 'jet li', 'tony jaa', 'ip man',
  'crouching tiger', 'hidden dragon', 'kill bill', 'matrix', 'raid', 'ong-bak',
  'rush hour', 'shanghai', 'drunken master', 'fist of fury', 'enter the dragon',
  'warrior', 'bloodsport', 'kickboxer', 'mortal kombat', 'tekken', 'cobra kai',
  'karate kid', 'ninja', 'samurai', 'shinobi', 'shang-chi', 'john wick',
  'atomic blonde', 'nobody', 'oldboy', 'the night comes for us'
];

const SPORT_KEYWORDS = [
  'sport', 'football', 'soccer', 'basketball', 'baseball', 'hockey', 'tennis',
  'golf', 'boxing', 'wrestling', 'rugby', 'cricket', 'olympics', 'athlete',
  'coach', 'team', 'championship', 'match', 'player', 'draft',
  'rocky', 'creed', 'remember the titans', 'friday night lights', 'moneyball',
  'blind side', 'hoosiers', 'rudy', 'mighty ducks', 'cool runnings', 'talladega',
  'rush', 'ford v ferrari', 'days of thunder', 'senna', 'ted lasso', 'drive to survive',
  'last dance', 'formula 1', 'f1', 'nba', 'nfl', 'mlb', 'fifa', 'world cup',
  'wimbledon', 'surf', 'skateboard', 'snowboard', 'ski'
];

const DANCE_KEYWORDS = [
  'dance', 'dancing', 'dancer', 'ballet', 'ballroom', 'step up', 'footloose',
  'dirty dancing', 'flashdance', 'black swan', 'billy elliot', 'chicago',
  'cabaret', 'moulin rouge', 'la la land', 'greatest showman', 'fame',
  'center stage', 'honey', 'stomp the yard', 'you got served', 'save the last dance',
  'strictly', 'dancing with', 'dance academy', 'bunheads', 'flesh and bone'
];

const ROAD_MOVIE_KEYWORDS = [
  'road', 'trip', 'journey', 'highway', 'travel', 'cross country', 'driving',
  'thelma', 'louise', 'easy rider', 'fear and loathing', 'little miss sunshine',
  'into the wild', 'green book', 'rain man', 'dumb and dumber', 'sideways',
  'nebraska', 'the way', 'wild', 'nomadland', 'y tu mama tambien', 'motorcycle diaries',
  'paris texas', 'mad max', 'fury road', 'the road', 'zombieland', 'vacation'
];

const POST_APOCALYPTIC_KEYWORDS = [
  'apocalypse', 'apocalyptic', 'post-apocalyptic', 'end of the world', 'wasteland',
  'survivor', 'fallout', 'mad max', 'fury road', 'the road', 'book of eli',
  'i am legend', 'zombieland', 'waterworld', 'quiet place', 'bird box',
  'the 100', 'walking dead', 'last of us', 'station eleven', 'jericho',
  'snowpiercer', 'into the badlands', 'defiance', 'revolution', 'dawn of the dead',
  'children of men', 'oblivion', 'edge of tomorrow', '12 monkeys', 'terminator',
  'matrix', 'hunger games', 'maze runner', 'divergent', 'planet of the apes'
];

const ROBOT_AI_KEYWORDS = [
  'robot', 'robots', 'ai', 'artificial intelligence', 'android', 'cyborg', 'machine',
  'ex machina', 'terminator', 'blade runner', 'i robot', 'wall-e', 'big hero',
  'transformers', 'iron giant', 'short circuit', 'bicentennial man', 'a.i.',
  'her', 'westworld', 'humans', 'battlestar', 'real steel', 'chappie', 'finch',
  'archive', 'tau', 'upgrade', 'alita', 'ghost in the shell',
  'automata', 'transcendence', 'black mirror', 'love death robots', 'next gen',
  'mitchells vs the machines'
];

const TIME_TRAVEL_KEYWORDS = [
  'time travel', 'time machine', 'back to the future', 'looper', 'terminator',
  '12 monkeys', 'primer', 'predestination', 'interstellar', 'tenet', 'arrival',
  'about time', 'edge of tomorrow', 'groundhog day', 'palm springs', 'hot tub',
  'bill and ted', 'doctor who', 'dark', 'loki', 'umbrella academy', 'travelers',
  'timeless', 'outlander', 'quantum leap', 'flashpoint',
  'butterfly effect', 'midnight in paris', 'timeline', 'source code', 'deja vu'
];

const TRUE_STORY_KEYWORDS = [
  'true story', 'based on', 'inspired by', 'real', 'biopic', 'biography',
  'historical', 'true events', 'dramatization', 'memoir', 'adapted from',
  'bohemian rhapsody', 'social network', 'wolf of wall street', 'schindler',
  'imitation game', 'theory of everything', 'hidden figures', 'spotlight',
  'the big short', 'catch me if you can', 'erin brockovich', 'lincoln',
  '12 years a slave', 'selma', 'hacksaw ridge', 'darkest hour', 'the favourite'
];

const BOOK_ADAPTATION_KEYWORDS = [
  'adaptation', 'novel', 'book', 'stephen king', 'j.k. rowling', 'tolkien',
  'harry potter', 'lord of the rings', 'hobbit', 'game of thrones', 'hunger games',
  'twilight', 'maze runner', 'divergent', 'dune', 'the shining', 'it',
  'jurassic', 'bourne', 'da vinci code', 'gone girl', 'girl with the dragon',
  'ready player', 'percy jackson', 'narnia', 'chronicles of narnia',
  'eragon', 'golden compass', 'mortal instruments', 'witcher', 'foundation',
  "handmaid's tale", 'outlander', 'big little lies', 'sharp objects'
];

const SLASHER_KEYWORDS = [
  'slasher', 'scream', 'halloween', 'friday the 13th', 'nightmare on elm street',
  'texas chainsaw', "child's play", 'chucky', 'i know what you did', 'urban legend',
  'final destination', 'saw', 'hostel', 'the purge', "you're next", 'hush',
  'happy death day', 'freaky', 'fear street', 'black christmas', 'prom night',
  'terror train', 'my bloody valentine', 'candyman', 'wrong turn', 'the strangers'
];

const PSYCHOLOGICAL_HORROR_KEYWORDS = [
  'psychological', 'suspense', 'mind', 'paranoid', 'disturbing',
  'hereditary', 'midsommar', 'the witch', 'it follows', 'get out', 'us',
  'babadook', 'lighthouse', 'black swan', 'shutter island', 'silence of the lambs',
  'psycho', "rosemary's baby", 'the shining', 'misery', 'gone girl', 'se7en',
  'zodiac', 'prisoners', 'nightcrawler', 'enemy', 'mulholland drive', 'mother!',
  'the killing of a sacred deer', 'suspiria', 'talk to me', 'pearl', 'smile'
];

const ROM_COM_KEYWORDS = [
  'romantic comedy', 'rom-com', 'wedding', 'marry', 'date', 'dating',
  'boyfriend', 'girlfriend', 'when harry met sally', "you've got mail",
  'notting hill', 'bridget jones', 'how to lose a guy', '10 things i hate',
  'pretty woman', 'sleepless in seattle', 'the proposal', 'crazy rich asians',
  'to all the boys', 'set it up', 'always be my maybe', 'plus one', 'long shot',
  'palm springs', 'ticket to paradise', 'shotgun wedding', 'no hard feelings',
  'anyone but you', 'emily in paris', 'sex and the city', 'friends'
];

const DARK_COMEDY_KEYWORDS = [
  'dark comedy', 'black comedy', 'satire', 'sardonic', 'ironic', 'cynical',
  'fargo', 'burn after reading', 'in bruges', 'seven psychopaths', 'big lebowski',
  'dr. strangelove', 'american psycho', 'fight club', 'thank you for smoking',
  'jojo rabbit', 'the death of stalin', 'four lions', 'vice', "don't look up",
  'the menu', 'triangle of sadness', 'parasite', 'sorry to bother you',
  'get out', 'ready or not', 'knives out', 'glass onion', 'beef', 'barry',
  'succession', 'veep', 'arrested development', 'always sunny', 'fleabag'
];

const POLITICAL_THRILLER_KEYWORDS = [
  'political', 'government', 'president', 'senator', 'congress', 'election',
  'conspiracy', 'spy', 'cia', 'fbi', 'nsa', 'intelligence', 'corruption',
  "all the president's men", 'the post', 'frost nixon', 'the ides of march',
  'primary colors', 'wag the dog', 'manchurian candidate', 'seven days in may',
  'state of play', 'no way out', 'clear and present danger', 'patriot games',
  'jack ryan', 'homeland', 'designated survivor', 'house of cards', 'scandal',
  'the west wing', 'madam secretary', 'the diplomat', 'slow horses'
];

const DISASTER_KEYWORDS = [
  'disaster', 'catastrophe', 'earthquake', 'volcano', 'tsunami', 'hurricane',
  'tornado', 'flood', 'fire', 'explosion', 'meteor', 'asteroid', 'impact',
  'the day after tomorrow', 'independence day', 'armageddon', 'deep impact',
  '2012', 'san andreas', 'twister', 'into the storm', 'geostorm', 'greenland',
  'moonfall', "don't look up", 'this is the end', 'seeking a friend',
  'poseidon', 'titanic', "dante's peak", 'the core', 'knowing'
];

const NETFLIX_KEYWORDS = [
  'netflix', 'stranger things', 'squid game', 'money heist', 'casa de papel',
  'bridgerton', 'the crown', 'ozark', 'narcos', 'dark', 'lupin', '3 body problem',
  'wednesday', 'dahmer', "queen's gambit", 'witcher', 'umbrella academy',
  'cobra kai', 'you', 'emily in paris', 'outer banks', 'ginny & georgia',
  'never have i ever', 'heartstopper', 'sex education', 'the society',
  'all of us are dead', 'alice in borderland', 'black mirror', 'mindhunter'
];

const HBO_KEYWORDS = [
  'hbo', 'game of thrones', 'house of the dragon', 'the last of us', 'succession',
  'euphoria', 'white lotus', 'barry', 'true detective', 'the wire', 'sopranos',
  'westworld', 'chernobyl', 'band of brothers', 'the pacific', 'rome',
  'deadwood', 'boardwalk empire', 'veep', 'silicon valley', 'curb your enthusiasm',
  'entourage', 'sex and the city', 'and just like that', 'hacks', 'winning time',
  'the gilded age', 'perry mason', 'mare of easttown', 'the undoing', 'sharp objects',
  'big little lies', 'lovecraft country', 'watchmen', 'the outsider'
];

const AMAZON_KEYWORDS = [
  'amazon', 'prime video', 'the boys', 'invincible', 'the marvelous mrs. maisel',
  'fleabag', 'jack ryan', 'reacher', 'the expanse', 'wheel of time', 'lord of the rings',
  'rings of power', 'the peripheral', 'upload', 'undone', 'tales from the loop',
  'goliath', 'bosch', 'hunters', 'homecoming', 'hanna', 'patriot', 'sneaky pete',
  'transparent', 'good omens', 'the underground railroad', 'them', 'outer range'
];

const ANIME_KEYWORDS = [
  'anime', 'manga', 'naruto', 'one piece', 'attack on titan', 'demon slayer',
  'my hero academia', 'dragon ball', 'death note', 'fullmetal alchemist',
  'jujutsu kaisen', 'spy x family', 'chainsaw man', 'tokyo ghoul', 'hunter x hunter',
  'bleach', 'one punch man', 'mob psycho', 'cowboy bebop', 'evangelion',
  'sword art online', 'steins;gate', 'code geass', 'tokyo revengers', 'haikyuu',
  'your name', 'weathering with you', 'akira', 'perfect blue', 'paprika',
  'ghost in the shell', 'studio ghibli', 'ghibli', 'crunchyroll', 'funimation'
];

const SITCOM_KEYWORDS = [
  'sitcom', 'friends', 'the office', 'parks and recreation', 'brooklyn nine-nine',
  'how i met your mother', 'big bang theory', 'modern family', "schitt's creek",
  'ted lasso', 'abbott elementary', 'young sheldon', 'superstore', 'the good place',
  'new girl', 'community', 'arrested development', 'scrubs', 'malcolm in the middle',
  'everybody loves raymond', 'seinfeld', 'frasier', 'cheers', 'will & grace',
  'mom', 'mike & molly', 'two and a half men', 'the goldbergs', 'fresh off the boat',
  'blackish', 'grown-ish', 'ghosts', 'only murders in the building'
];

const MEDICAL_KEYWORDS = [
  'medical', 'hospital', 'doctor', 'nurse', 'surgery', 'patient', 'er', 'emergency',
  "grey's anatomy", 'house', 'the good doctor', 'chicago med', 'new amsterdam',
  'the resident', 'scrubs', 'nip/tuck', 'royal pains', 'doogie howser',
  'nurse jackie', 'the knick', 'mercy street', 'call the midwife', 'transplant',
  'monday mornings', 'code black'
];

const PROCEDURAL_KEYWORDS = [
  'procedural', 'detective', 'investigation', 'crime', 'forensic', 'fbi',
  'csi', 'ncis', 'law & order', 'criminal minds', 'bones', 'castle', 'the mentalist',
  'elementary', 'sherlock', 'luther', 'true detective', 'mindhunter', 'hannibal',
  'dexter', 'the blacklist', 'the following', 'prodigal son', 'clarice',
  'fbi: most wanted', 'fbi: international', 'chicago pd', 'blue bloods',
  'swat', 'seal team', 'the rookie', 'station 19', 'nypd blue', 'cold case'
];

const EPIC_FANTASY_KEYWORDS = [
  'fantasy', 'epic', 'dragon', 'magic', 'kingdom', 'sword', 'quest', 'prophecy',
  'game of thrones', 'house of the dragon', 'lord of the rings', 'rings of power',
  'the witcher', 'wheel of time', 'shadow and bone', 'the shannara chronicles',
  'legend of the seeker', 'merlin', 'once upon a time', 'outlander', 'vikings',
  'the last kingdom', 'britannia', 'cursed', 'carnival row', 'his dark materials',
  'the dark crystal', 'willow', 'dungeons & dragons', 'eragon', 'narnia'
];

const FRANCHISE_KEYWORDS = [
  '2', '3', '4', '5', 'ii', 'iii', 'iv', 'v', 'part', 'chapter', 'vol', 'episode',
  'return', 'revenge', 'rises', 'reloaded', 'awakens', 'resurrection', 'sequel',
  'remake', 'reboot', 'origins', 'legacy', 'genesis', 'chronicles'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function matchesKeywords(item: MediaItem, keywords: string[]): boolean {
  const title = (isMovie(item) ? item.title : item.name).toLowerCase();
  const originalTitle = (isMovie(item) ? item.original_title : item.original_name).toLowerCase();
  const overview = (item.overview || '').toLowerCase();
  const text = `${title} ${originalTitle} ${overview}`;
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

function hasGenre(item: MediaItem, genreIds: number[]): boolean {
  return item.genre_ids?.some(id => genreIds.includes(id)) || false;
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

// ============================================================================
// QUESTION DEFINITIONS - 80+ QUESTIONS
// ============================================================================

export function getQuestions(mediaType: MediaType): AkinatorQuestion[] {
  const questions: AkinatorQuestion[] = [
    // ========== POPULARITY (3) ==========
    {
      id: 'very_popular',
      text: 'Est-ce très populaire / un blockbuster ?',
      category: 'popularity',
      filterFn: (item, answer) => {
        const isVeryPopular = item.popularity > 100 || item.vote_count > 5000;
        return shouldInclude(isVeryPopular, answer);
      }
    },
    {
      id: 'highly_rated',
      text: 'Est-ce très bien noté par les critiques ?',
      category: 'popularity',
      filterFn: (item, answer) => {
        const isHighlyRated = item.vote_average >= 7.5 && item.vote_count > 500;
        return shouldInclude(isHighlyRated, answer);
      }
    },
    {
      id: 'cult_classic',
      text: 'Est-ce considéré comme un classique ou film culte ?',
      category: 'popularity',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        const isCult = (year < 2000 && item.vote_average >= 7.0 && item.vote_count > 1000) ||
                       (item.vote_average >= 8.0 && item.vote_count > 2000);
        return shouldInclude(isCult, answer);
      }
    },

    // ========== RELEASE PERIOD (7) ==========
    {
      id: 'after_2020',
      text: 'Est-ce sorti après 2020 ?',
      category: 'period',
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) > 2020, answer)
    },
    {
      id: 'between_2015_2020',
      text: 'Est-ce sorti entre 2015 et 2020 ?',
      category: 'period',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2015 && year <= 2020, answer);
      }
    },
    {
      id: 'between_2010_2014',
      text: 'Est-ce sorti entre 2010 et 2014 ?',
      category: 'period',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2010 && year <= 2014, answer);
      }
    },
    {
      id: 'between_2000_2009',
      text: 'Est-ce sorti dans les années 2000 ?',
      category: 'period',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 2000 && year <= 2009, answer);
      }
    },
    {
      id: 'between_1990_1999',
      text: 'Est-ce sorti dans les années 90 ?',
      category: 'period',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 1990 && year <= 1999, answer);
      }
    },
    {
      id: 'between_1980_1989',
      text: 'Est-ce sorti dans les années 80 ?',
      category: 'period',
      filterFn: (item, answer) => {
        const year = getReleaseYear(item);
        return shouldInclude(year >= 1980 && year <= 1989, answer);
      }
    },
    {
      id: 'before_1980',
      text: 'Est-ce sorti avant 1980 ?',
      category: 'period',
      filterFn: (item, answer) => shouldInclude(getReleaseYear(item) < 1980 && getReleaseYear(item) > 0, answer)
    },

    // ========== LANGUAGE / ORIGIN (8) ==========
    {
      id: 'english',
      text: 'Est-ce en anglais ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'en', answer)
    },
    {
      id: 'french',
      text: 'Est-ce français ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'fr', answer)
    },
    {
      id: 'korean',
      text: 'Est-ce coréen ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'ko', answer)
    },
    {
      id: 'japanese',
      text: 'Est-ce japonais ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'ja', answer)
    },
    {
      id: 'spanish',
      text: 'Est-ce espagnol ou latino-américain ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(item.original_language === 'es', answer)
    },
    {
      id: 'indian',
      text: 'Est-ce indien / Bollywood ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(['hi', 'ta', 'te', 'ml'].includes(item.original_language), answer)
    },
    {
      id: 'chinese',
      text: 'Est-ce chinois ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(['zh', 'cn'].includes(item.original_language), answer)
    },
    {
      id: 'european',
      text: 'Est-ce européen (hors France/UK) ?',
      category: 'language',
      filterFn: (item, answer) => shouldInclude(['de', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'pl', 'pt', 'ru'].includes(item.original_language), answer)
    },

    // ========== STUDIOS & FRANCHISES (5) ==========
    {
      id: 'superhero',
      text: 'Est-ce un film de super-héros (Marvel, DC) ?',
      category: 'franchise',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, SUPERHERO_KEYWORDS), answer)
    },
    {
      id: 'disney_pixar',
      text: 'Est-ce un Disney ou Pixar ?',
      category: 'franchise',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, DISNEY_PIXAR_KEYWORDS), answer)
    },
    {
      id: 'ghibli',
      text: 'Est-ce un film du studio Ghibli ?',
      category: 'franchise',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, GHIBLI_KEYWORDS), answer)
    },
    {
      id: 'a24',
      text: 'Est-ce une production A24 ou film indépendant ?',
      category: 'franchise',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, A24_KEYWORDS), answer)
    },
    {
      id: 'sequel_remake',
      text: 'Est-ce une suite, un remake ou un reboot ?',
      category: 'franchise',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, FRANCHISE_KEYWORDS), answer)
    },

    // ========== THEMES & ELEMENTS (20) ==========
    {
      id: 'christmas',
      text: 'Est-ce un film de Noël ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, CHRISTMAS_KEYWORDS), answer)
    },
    {
      id: 'zombies',
      text: 'Y a-t-il des zombies ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ZOMBIE_KEYWORDS), answer)
    },
    {
      id: 'vampires',
      text: 'Y a-t-il des vampires ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, VAMPIRE_KEYWORDS), answer)
    },
    {
      id: 'space',
      text: "L'histoire se passe-t-elle dans l'espace ?",
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, SPACE_KEYWORDS), answer)
    },
    {
      id: 'underwater',
      text: "L'histoire se passe-t-elle sous l'eau / dans l'océan ?",
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, UNDERWATER_KEYWORDS), answer)
    },
    {
      id: 'dinosaurs',
      text: 'Y a-t-il des dinosaures ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, DINOSAUR_KEYWORDS), answer)
    },
    {
      id: 'prison',
      text: "L'histoire se passe-t-elle en prison ?",
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, PRISON_KEYWORDS), answer)
    },
    {
      id: 'heist',
      text: 'Est-ce un film de braquage / cambriolage ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, HEIST_KEYWORDS), answer)
    },
    {
      id: 'martial_arts',
      text: 'Y a-t-il des arts martiaux ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, MARTIAL_ARTS_KEYWORDS), answer)
    },
    {
      id: 'sport',
      text: 'Est-ce centré sur le sport ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, SPORT_KEYWORDS), answer)
    },
    {
      id: 'dance',
      text: 'Est-ce centré sur la danse ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, DANCE_KEYWORDS), answer)
    },
    {
      id: 'road_movie',
      text: 'Est-ce un road movie / voyage ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ROAD_MOVIE_KEYWORDS), answer)
    },
    {
      id: 'post_apocalyptic',
      text: 'Est-ce post-apocalyptique ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, POST_APOCALYPTIC_KEYWORDS), answer)
    },
    {
      id: 'robots_ai',
      text: "Y a-t-il des robots ou de l'IA ?",
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ROBOT_AI_KEYWORDS), answer)
    },
    {
      id: 'time_travel',
      text: 'Y a-t-il des voyages dans le temps ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, TIME_TRAVEL_KEYWORDS), answer)
    },
    {
      id: 'true_story',
      text: "Est-ce basé sur une histoire vraie ?",
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, TRUE_STORY_KEYWORDS) || hasGenre(item, [36]), answer)
    },
    {
      id: 'book_adaptation',
      text: "Est-ce adapté d'un livre ?",
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, BOOK_ADAPTATION_KEYWORDS), answer)
    },
    {
      id: 'disaster',
      text: 'Est-ce un film catastrophe ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, DISASTER_KEYWORDS), answer)
    },
    {
      id: 'family_friendly',
      text: 'Est-ce adapté aux enfants/familles ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10751, 16]) && !hasGenre(item, [27, 53]), answer)
    },
    {
      id: 'adult_content',
      text: 'Est-ce réservé à un public adulte (violent, mature) ?',
      category: 'theme',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [27, 53, 80]) || (isMovie(item) && item.adult), answer)
    },

    // ========== MAIN GENRES (18) ==========
    {
      id: 'action',
      text: "Est-ce un film d'action ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [28, 10759]), answer)
    },
    {
      id: 'adventure',
      text: "Est-ce un film d'aventure ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [12, 10759]), answer)
    },
    {
      id: 'animation',
      text: "Est-ce un film d'animation ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [16]), answer)
    },
    {
      id: 'comedy',
      text: 'Est-ce une comédie ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [35]), answer)
    },
    {
      id: 'crime',
      text: 'Est-ce un film policier / crime ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [80]), answer)
    },
    {
      id: 'documentary',
      text: 'Est-ce un documentaire ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [99]), answer)
    },
    {
      id: 'drama',
      text: 'Est-ce un drame ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [18]), answer)
    },
    {
      id: 'family',
      text: 'Est-ce un film familial ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10751]), answer)
    },
    {
      id: 'fantasy',
      text: 'Est-ce fantastique (magie, créatures) ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [14, 10765]), answer)
    },
    {
      id: 'history',
      text: 'Est-ce un film historique ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [36]), answer)
    },
    {
      id: 'horror',
      text: "Est-ce un film d'horreur ?",
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [27]), answer)
    },
    {
      id: 'music',
      text: 'Est-ce un film musical ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10402]), answer)
    },
    {
      id: 'mystery',
      text: 'Est-ce un film à mystère / enquête ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [9648]), answer)
    },
    {
      id: 'romance',
      text: 'Est-ce romantique ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10749]), answer)
    },
    {
      id: 'science_fiction',
      text: 'Est-ce de la science-fiction ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [878, 10765]), answer)
    },
    {
      id: 'thriller',
      text: 'Est-ce un thriller ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [53]), answer)
    },
    {
      id: 'war',
      text: 'Est-ce un film de guerre ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [10752, 10768]), answer)
    },
    {
      id: 'western',
      text: 'Est-ce un western ?',
      category: 'genre',
      filterFn: (item, answer) => shouldInclude(hasGenre(item, [37]), answer)
    },

    // ========== SUB-GENRES (6) ==========
    {
      id: 'slasher',
      text: 'Est-ce un slasher / horreur gore ?',
      category: 'subgenre',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, SLASHER_KEYWORDS), answer)
    },
    {
      id: 'psychological_horror',
      text: "Est-ce de l'horreur psychologique ?",
      category: 'subgenre',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, PSYCHOLOGICAL_HORROR_KEYWORDS), answer)
    },
    {
      id: 'rom_com',
      text: 'Est-ce une comédie romantique ?',
      category: 'subgenre',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ROM_COM_KEYWORDS) || (hasGenre(item, [35]) && hasGenre(item, [10749])), answer)
    },
    {
      id: 'dark_comedy',
      text: 'Est-ce une comédie noire / satirique ?',
      category: 'subgenre',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, DARK_COMEDY_KEYWORDS), answer)
    },
    {
      id: 'political_thriller',
      text: 'Est-ce un thriller politique ?',
      category: 'subgenre',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, POLITICAL_THRILLER_KEYWORDS), answer)
    },
    {
      id: 'anime_movie',
      text: 'Est-ce un anime ?',
      category: 'subgenre',
      filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ANIME_KEYWORDS) || (hasGenre(item, [16]) && item.original_language === 'ja'), answer)
    },
  ];

  // ========== TV-SPECIFIC QUESTIONS (12) ==========
  if (mediaType === 'tv') {
    questions.push(
      {
        id: 'many_seasons',
        text: 'Y a-t-il plus de 5 saisons ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(item.vote_count > 5000 || item.popularity > 200, answer)
      },
      {
        id: 'mini_series',
        text: 'Est-ce une mini-série (1 saison) ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(item.vote_count < 2000 && item.vote_average >= 7, answer)
      },
      {
        id: 'netflix_original',
        text: 'Est-ce une série Netflix Original ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, NETFLIX_KEYWORDS), answer)
      },
      {
        id: 'hbo_series',
        text: 'Est-ce une série HBO ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, HBO_KEYWORDS), answer)
      },
      {
        id: 'amazon_series',
        text: 'Est-ce une série Amazon Prime ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, AMAZON_KEYWORDS), answer)
      },
      {
        id: 'anime_series',
        text: 'Est-ce un anime ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, ANIME_KEYWORDS) || (hasGenre(item, [16]) && item.original_language === 'ja'), answer)
      },
      {
        id: 'sitcom',
        text: 'Est-ce une sitcom ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, SITCOM_KEYWORDS), answer)
      },
      {
        id: 'medical_series',
        text: 'Est-ce une série médicale ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, MEDICAL_KEYWORDS), answer)
      },
      {
        id: 'procedural',
        text: 'Est-ce une série policière procédurale ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, PROCEDURAL_KEYWORDS), answer)
      },
      {
        id: 'epic_fantasy_series',
        text: 'Est-ce une série de fantasy épique ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(matchesKeywords(item, EPIC_FANTASY_KEYWORDS), answer)
      },
      {
        id: 'reality_tv',
        text: 'Est-ce de la télé-réalité ?',
        category: 'tv',
        filterFn: (item, answer) => shouldInclude(hasGenre(item, [10764, 10767]), answer)
      },
      {
        id: 'ongoing_series',
        text: 'Est-ce une série toujours en cours ?',
        category: 'tv',
        filterFn: (item, answer) => {
          const year = getReleaseYear(item);
          return shouldInclude(year >= 2020 && item.popularity > 50, answer);
        }
      }
    );
  }

  return questions;
}

// ============================================================================
// GAME LOGIC
// ============================================================================

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function scoreQuestion(question: AkinatorQuestion, candidates: MediaItem[]): number {
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
  
  // Best score when both are around 0.5
  const balance = 1 - Math.abs(yesRatio - noRatio);
  const filterPower = Math.min(yesRatio, noRatio) * 2;
  
  return balance * filterPower;
}

const categoryPriority: Record<string, number> = {
  'genre': 1,
  'period': 2,
  'language': 3,
  'theme': 4,
  'franchise': 5,
  'subgenre': 6,
  'popularity': 7,
  'tv': 3,
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

  const scoredQuestions = remainingQuestions.map(question => ({
    question,
    score: scoreQuestion(question, candidates),
    priority: categoryPriority[question.category] || 5,
  }));

  scoredQuestions.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.1) {
      return a.priority - b.priority;
    }
    return b.score - a.score;
  });

  const goodQuestions = scoredQuestions.filter(sq => sq.score > 0.1);
  
  if (goodQuestions.length === 0) {
    return remainingQuestions[0];
  }

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
  
  if (filtered.length === 0) {
    console.warn('Filter would eliminate all candidates, keeping original pool');
    return candidates;
  }
  
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

export function pickGuess(candidates: MediaItem[]): MediaItem | null {
  if (candidates.length === 0) return null;
  
  const scored = candidates.map(c => ({
    item: c,
    score: (c.popularity * 0.7) + (c.vote_average * c.vote_count * 0.0001),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
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
  
  // Priority questions for good discrimination
  const priorityOrder = [
    'animation',
    'english',
    'after_2020',
    'very_popular',
    'horror',
    'comedy',
    'superhero',
    'science_fiction',
    'french',
    'drama'
  ];
  
  const prioritized: AkinatorQuestion[] = [];
  for (const id of priorityOrder) {
    const q = allQuestions.find(q => q.id === id);
    if (q) prioritized.push(q);
  }
  
  const remaining = allQuestions.filter(q => !priorityOrder.includes(q.id));
  
  return [...prioritized, ...shuffleArray(remaining)];
}
