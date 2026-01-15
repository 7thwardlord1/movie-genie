import { motion } from 'framer-motion';
import { Film, Tv, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaType } from '@/types/tmdb';

interface LandingScreenProps {
  onStart: (mediaType: MediaType) => void;
  isLoading: boolean;
}

export function LandingScreen({ onStart, isLoading }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Lignes decoratives cinema */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-primary/30 bg-primary/5">
            <Clapperboard className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold mb-4 tracking-tight flex items-center justify-center gap-3"
        >
          <span className="text-foreground">Ciné</span>
          <span className="text-primary">mator</span>
          <span className="text-4xl md:text-5xl">🧞</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed"
        >
          Pensez à un film ou une série.
          <br />
          Je vais essayer de le deviner.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => onStart('movie')}
            disabled={isLoading}
            size="lg"
            className="h-14 px-8 text-base font-medium gradient-cinema text-white border-0 shadow-glow hover:opacity-90 transition-opacity"
          >
            <Film className="w-5 h-5 mr-3" />
            Je pense à un Film
          </Button>

          <Button
            onClick={() => onStart('tv')}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="h-14 px-8 text-base font-medium border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
          >
            <Tv className="w-5 h-5 mr-3" />
            Je pense à une Série
          </Button>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-muted-foreground text-sm"
          >
            Chargement de la base de données...
          </motion.p>
        )}

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 text-xs text-muted-foreground/60"
        >
          Plus de 600 films et séries • 120+ questions intelligentes
        </motion.p>
      </motion.div>
    </div>
  );
}
