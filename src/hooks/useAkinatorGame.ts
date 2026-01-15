import { useState, useCallback } from 'react';
import { GameState, MediaType, AnswerType, AkinatorQuestion, EnrichedMedia } from '@/types/tmdb';
import { getMediaPool } from '@/lib/tmdb';
import { getInitialQuestions, getNextQuestion, initializePriors, updatePriorsWithAnswer } from '@/lib/akinator-questions';

// Tuning constants for better precision
const MIN_CANDIDATES_TO_GUESS = 1; // only guess when a single candidate remains
const MAX_QUESTIONS_BEFORE_GUESS = 40;
const MIN_QUESTIONS_BEFORE_GUESS = 5; // require a few questions before any guess

const initialGameState: GameState = {
  mediaType: null,
  currentQuestionIndex: 0,
  answers: {},
  candidates: [],
  currentGuess: null,
  questionsAsked: 0,
  isFinished: false,
  hasWon: null,
};

export function useAkinatorGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [questions, setQuestions] = useState<AkinatorQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AkinatorQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuessing, setIsGuessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{ step: string; progress: number } | null>(null);
  const [priors, setPriors] = useState<Record<number, number> | null>(null);

  const startGame = useCallback(async (mediaType: MediaType) => {
    setIsLoading(true);
    setLoadingProgress({ step: 'Initialisation...', progress: 0 });
    try {
      const pool = await getMediaPool(mediaType, (step, progress) => {
        setLoadingProgress({ step, progress });
      });
      // Correction : utilise bien la génération initiale des questions
      const gameQuestions = getInitialQuestions(mediaType);
      setQuestions(gameQuestions);
      const initialPriors = initializePriors(pool);
      setPriors(initialPriors);
      const firstQuestion = getNextQuestion(gameQuestions, [], pool, initialPriors);
      setCurrentQuestion(firstQuestion);
      setGameState({
        ...initialGameState,
        mediaType,
        candidates: pool,
      });
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setIsLoading(false);
      setLoadingProgress(null);
    }
  }, []);

  const answerQuestion = useCallback((answer: AnswerType) => {
    if (!currentQuestion || isGuessing) return;

    setGameState(prev => {
      const newAnswers = { ...prev.answers, [currentQuestion.id]: answer };
      // Update priors (Bayesian update) instead of hard filtering
      const currentPriors = priors ?? initializePriors(prev.candidates);
      const newPriors = updatePriorsWithAnswer(currentPriors, prev.candidates, currentQuestion, answer);
      setPriors(newPriors);

      // Derive an active candidate set from priors (keep those with non-trivial mass)
      let newCandidates = prev.candidates.filter(c => (newPriors[c.id] || 0) > 1e-4);
      if (newCandidates.length === 0) {
        // Avoid empty pool: fallback to full set
        newCandidates = prev.candidates;
      }
      const newQuestionsAsked = prev.questionsAsked + 1;

      // Only guess when there is a single candidate, we reached a hard question limit,
      // or when the player is fatigued (few candidates left after many questions)
      const shouldGuess =
        (newCandidates.length === 1) ||
        (newQuestionsAsked >= MAX_QUESTIONS_BEFORE_GUESS) ||
        (newCandidates.length <= 5 && newQuestionsAsked >= 20);

      if (shouldGuess) {
        setIsGuessing(true);
        const guess = pickGuess(newCandidates, newPriors);
        return {
          ...prev,
          answers: newAnswers,
          candidates: newCandidates,
          questionsAsked: newQuestionsAsked,
          currentGuess: guess,
        };
      }

      const askedIds = Object.keys(newAnswers);
      const nextQuestion = getNextQuestion(questions, askedIds, newCandidates, newPriors, newAnswers);
      
      if (!nextQuestion) {
        setIsGuessing(true);
        const guess = pickGuess(newCandidates, newPriors);
        return {
          ...prev,
          answers: newAnswers,
          candidates: newCandidates,
          questionsAsked: newQuestionsAsked,
          currentGuess: guess,
        };
      }

      setCurrentQuestion(nextQuestion);

      return {
        ...prev,
        answers: newAnswers,
        candidates: newCandidates,
        questionsAsked: newQuestionsAsked,
      };
    });
  }, [currentQuestion, questions, isGuessing, priors]);

  const confirmGuess = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        isFinished: true,
        hasWon: true,
      }));
    } else {
      setGameState(prev => {
        const removedId = prev.currentGuess?.id;
        const newCandidates = prev.candidates.filter(c => c.id !== removedId);
        
        if (newCandidates.length === 0 || prev.questionsAsked >= MAX_QUESTIONS_BEFORE_GUESS + 5) {
          return {
            ...prev,
            isFinished: true,
            hasWon: false,
            candidates: newCandidates,
          };
        }

        // Update priors to remove guessed candidate and renormalize
        let newPriors: Record<number, number> = {};
        if (priors) {
          const tmp: Record<number, number> = { ...priors };
          if (removedId) delete tmp[removedId];
          const total = Object.keys(tmp).reduce((s, k) => s + (tmp[Number(k)] || 0), 0) || 1;
          for (const k of Object.keys(tmp)) newPriors[Number(k)] = (tmp[Number(k)] || 0) / total;
        } else {
          newPriors = initializePriors(newCandidates);
        }
        setPriors(newPriors);

        // Try to continue asking questions to further disambiguate instead of immediately guessing
        const askedIds = Object.keys(prev.answers);
        const nextQuestion = getNextQuestion(questions, askedIds, newCandidates, newPriors, prev.answers);
        
        if (nextQuestion) {
          // Ask another question to avoid immediate retries and reduce frustration
          setCurrentQuestion(nextQuestion);
          setIsGuessing(false);
          return {
            ...prev,
            candidates: newCandidates,
            currentGuess: null,
          };
        }

        // No useful question left -> fallback to another guess
        const newGuess = pickGuess(newCandidates, newPriors);
        return {
          ...prev,
          candidates: newCandidates,
          currentGuess: newGuess,
        };
       });
    }
  }, [questions, priors]);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setQuestions([]);
    setCurrentQuestion(null);
    setIsGuessing(false);
    setIsLoading(false);
    setLoadingProgress(null);
    setPriors(null);
  }, []);

  return {
    gameState,
    currentQuestion,
    isLoading,
    isGuessing,
    loadingProgress,
    startGame,
    answerQuestion,
    confirmGuess,
    resetGame,
  };
}
function pickGuess(newCandidates: EnrichedMedia[], newPriors: { [id: number]: number; }) {
  if (newCandidates.length === 0) return null;
  // Pick the candidate with the highest prior probability
  let bestCandidate = newCandidates[0];
  let bestScore = newPriors[bestCandidate.id] ?? 0;
  for (const candidate of newCandidates) {
    const score = newPriors[candidate.id] ?? 0;
    if (score > bestScore) {
      bestCandidate = candidate;
      bestScore = score;
    }
  }
  return bestCandidate;
}

