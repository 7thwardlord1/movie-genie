import { motion, AnimatePresence } from 'framer-motion';
import { useAkinatorGame } from '@/hooks/useAkinatorGame';
import { LandingScreen } from './LandingScreen';
import { QuestionCard } from './QuestionCard';
import { GuessCard } from './GuessCard';
import { VictoryScreen } from './VictoryScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export function GameScreen() {
  const {
    gameState,
    currentQuestion,
    isLoading,
    isGuessing,
    loadingProgress,
    startGame,
    answerQuestion,
    confirmGuess,
    resetGame,
  } = useAkinatorGame();

  const { mediaType, questionsAsked, candidates, currentGuess, isFinished, hasWon } = gameState;

  // Landing screen - no media type selected
  if (!mediaType) {
    return <LandingScreen onStart={startGame} isLoading={isLoading} loadingProgress={loadingProgress} />;
  }

  // Victory/Defeat screen
  if (isFinished) {
    return (
      <VictoryScreen
        hasWon={hasWon || false}
        guess={currentGuess}
        questionsAsked={questionsAsked}
        onPlayAgain={resetGame}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-4 flex items-center justify-between"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={resetGame}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {mediaType === 'movie' ? '🎬 Film' : '📺 Série'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetGame}
          className="text-muted-foreground hover:text-foreground"
        >
          <Home className="w-4 h-4" />
        </Button>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des données...</p>
            </motion.div>
          ) : isGuessing && currentGuess ? (
            <GuessCard
              key="guess"
              guess={currentGuess}
              questionsAsked={questionsAsked}
              onConfirm={confirmGuess}
            />
          ) : currentQuestion ? (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionsAsked={questionsAsked}
              candidatesCount={candidates.length}
              onAnswer={answerQuestion}
            />
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
