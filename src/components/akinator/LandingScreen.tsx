import { motion } from 'framer-motion';
import { Film, Tv, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaType } from '@/types/tmdb';

interface LandingScreenProps {
  onStart: (mediaType: MediaType) => void;
  isLoading: boolean;
}

export function LandingScreen({ onStart, isLoading }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-cinema-gold animate-pulse-glow" />
            <h1 className="text-5xl md:text-7xl font-bold text-gradient">
              CinéGuess
            </h1>
            <Sparkles className="w-8 h-8 text-cinema-gold animate-pulse-glow" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Je devine le film ou la série auquel tu penses
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-muted-foreground mb-12 text-lg"
        >
          Pense à un film ou une série, réponds à mes questions, 
          et je tenterai de deviner !
        </motion.p>

        {/* Media Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => onStart('movie')}
            disabled={isLoading}
            className="group relative overflow-hidden gradient-cinema text-primary-foreground px-8 py-6 text-lg font-semibold shadow-glow hover:shadow-[0_0_80px_-10px_hsl(var(--primary)/0.6)] transition-all duration-300"
          >
            <Film className="w-6 h-6 mr-3" />
            Je pense à un Film
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </Button>

          <Button
            size="lg"
            onClick={() => onStart('tv')}
            disabled={isLoading}
            variant="outline"
            className="group relative overflow-hidden border-2 border-accent bg-accent/10 text-accent-foreground hover:bg-accent/20 px-8 py-6 text-lg font-semibold transition-all duration-300"
          >
            <Tv className="w-6 h-6 mr-3" />
            Je pense à une Série
            <motion.div
              className="absolute inset-0 bg-accent/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </Button>
        </motion.div>

        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-muted-foreground"
          >
            Chargement de la base de données...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
