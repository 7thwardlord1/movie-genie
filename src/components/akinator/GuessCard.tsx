import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnrichedMedia } from '@/types/tmdb';
import { getImageUrl, getTitle, getReleaseYear, isMovie } from '@/lib/tmdb';
import { Star, Check, X, HelpCircle } from 'lucide-react';

interface GuessCardProps {
  guess: EnrichedMedia;
  questionsAsked: number;
  onConfirm: (isCorrect: boolean) => void;
}

export function GuessCard({ guess, questionsAsked, onConfirm }: GuessCardProps) {
  const title = getTitle(guess);
  const year = getReleaseYear(guess);
  const posterUrl = getImageUrl(guess.poster_path, 'w500');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-card">
        {/* Header */}
        <div className="p-6 text-center border-b border-border/50">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-cinema-gold" />
            <h2 className="text-2xl font-bold mb-2">Je pense que c'est...</h2>
            <p className="text-muted-foreground">
              Après {questionsAsked} questions
            </p>
          </motion.div>
        </div>

        {/* Poster and info */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Poster */}
            <div className="relative mb-6 group">
              <div className="absolute inset-0 gradient-cinema rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <img
                src={posterUrl}
                alt={title}
                className="relative w-48 h-72 object-cover rounded-xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Title and info */}
            <h3 className="text-3xl font-bold text-center mb-2 text-gradient">
              {title}
            </h3>
            
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <span className="text-lg">{year || 'N/A'}</span>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-cinema-gold fill-cinema-gold" />
                <span className="text-lg font-medium">{guess.vote_average.toFixed(1)}</span>
              </div>
              <span className="px-2 py-1 bg-secondary rounded-full text-sm">
                {isMovie(guess) ? 'Film' : 'Série'}
              </span>
            </div>

            {/* Synopsis */}
            {guess.overview && (
              <p className="text-sm text-muted-foreground text-center line-clamp-3 mb-6">
                {guess.overview}
              </p>
            )}
          </motion.div>

          {/* Confirmation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <Button
              size="lg"
              onClick={() => onConfirm(true)}
              className="flex-1 gradient-cinema text-primary-foreground shadow-glow hover:shadow-[0_0_80px_-10px_hsl(var(--primary)/0.6)] py-6 text-lg font-semibold"
            >
              <Check className="w-6 h-6 mr-2" />
              C'est ça !
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onConfirm(false)}
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 py-6 text-lg font-semibold"
            >
              <X className="w-6 h-6 mr-2" />
              Non, continue
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
