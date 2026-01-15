import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EnrichedMedia } from '@/types/tmdb';
import { getImageUrl, getTitle, getReleaseYear, isMovie } from '@/lib/tmdb';
import { Trophy, RotateCcw, Star, PartyPopper, Frown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VictoryScreenProps {
  hasWon: boolean;
  guess: EnrichedMedia | null;
  questionsAsked: number;
  onPlayAgain: () => void;
}

// Simple confetti component
function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const colors = ['#e11d48', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: 360 }}
          transition={{ duration: 3 + Math.random() * 2, delay: particle.delay, ease: 'linear' }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}

export function VictoryScreen({ hasWon, guess, questionsAsked, onPlayAgain }: VictoryScreenProps) {
  const title = guess ? getTitle(guess) : '';
  const year = guess ? getReleaseYear(guess) : 0;
  const posterUrl = guess ? getImageUrl(guess.poster_path, 'w500') : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {hasWon && <Confetti />}
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      {hasWon && (
        <>
          <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 -right-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-3xl animate-pulse" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center max-w-lg mx-auto"
      >
        {hasWon ? (
          <>
            {/* Victory icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-cinema shadow-glow">
                <Trophy className="w-12 h-12 text-primary-foreground" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-gradient"
            >
              J'ai deviné !
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-8 text-cinema-gold"
            >
              <PartyPopper className="w-6 h-6" />
              <span className="text-xl">En seulement {questionsAsked} questions</span>
              <PartyPopper className="w-6 h-6" />
            </motion.div>
          </>
        ) : (
          <>
            {/* Defeat icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                <Frown className="w-12 h-12 text-muted-foreground" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Tu m'as battu !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Je n'ai pas réussi à deviner après {questionsAsked} questions
            </motion.p>
          </>
        )}

        {/* Show the guessed movie/show if won */}
        {hasWon && guess && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="relative inline-block group">
              <div className="absolute inset-0 gradient-cinema rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <img
                src={posterUrl}
                alt={title}
                className="relative w-40 h-60 object-cover rounded-xl shadow-2xl mx-auto"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <h3 className="text-2xl font-bold mt-4">{title}</h3>
            <div className="flex items-center justify-center gap-3 text-muted-foreground mt-2">
              <span>{year}</span>
              {guess.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                  <span>{guess.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Play again button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="gradient-cinema text-primary-foreground shadow-glow hover:shadow-[0_0_80px_-10px_hsl(var(--primary)/0.6)] px-8 py-6 text-lg font-semibold"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Rejouer
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
