import { useState, useCallback } from 'react';
import { GameState, MediaType, AnswerType, AkinatorQuestion, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { getMediaPool } from '@/lib/tmdb';
import { getInitialQuestions, getNextQuestion, filterCandidates, pickGuess } from '@/lib/akinator-questions';

// Tuning constants for better precision
const MIN_CANDIDATES_TO_GUESS = 3; // Only guess when we're confident
const MAX_QUESTIONS_BEFORE_GUESS = 25; // Ask more questions for precision
const HIGH_CONFIDENCE_THRESHOLD = 2; // If only 2 candidates, we're very confident
const MIN_QUESTIONS_BEFORE_EARLY_GUESS = 8; // Don't guess too early

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

  const startGame = useCallback(async (mediaType: MediaType) => {
    setIsLoading(true);
    
    try {
      const pool = await getMediaPool(mediaType);
      const gameQuestions = getInitialQuestions(mediaType);
      
      setQuestions(gameQuestions);
      
      const firstQuestion = getNextQuestion(gameQuestions, [], pool);
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
    }
  }, []);

  const answerQuestion = useCallback((answer: AnswerType) => {
    if (!currentQuestion || isGuessing) return;

    setGameState(prev => {
      const newAnswers = { ...prev.answers, [currentQuestion.id]: answer };
      const newCandidates = filterCandidates(prev.candidates, currentQuestion, answer);
      const newQuestionsAsked = prev.questionsAsked + 1;

      // Improved guessing logic - be more patient
      const shouldGuess = 
        // Very confident: only 2 candidates left
        newCandidates.length <= HIGH_CONFIDENCE_THRESHOLD ||
        // Max questions reached
        newQuestionsAsked >= MAX_QUESTIONS_BEFORE_GUESS ||
        // Good confidence: few candidates after enough questions
        (newQuestionsAsked >= MIN_QUESTIONS_BEFORE_EARLY_GUESS && newCandidates.length <= MIN_CANDIDATES_TO_GUESS);

      if (shouldGuess) {
        setIsGuessing(true);
        const guess = pickGuess(newCandidates);
        return {
          ...prev,
          answers: newAnswers,
          candidates: newCandidates,
          questionsAsked: newQuestionsAsked,
          currentGuess: guess,
        };
      }

      // Get next question
      const askedIds = Object.keys(newAnswers);
      const nextQuestion = getNextQuestion(questions, askedIds, newCandidates);
      
      if (!nextQuestion) {
        // No more questions, make a guess
        setIsGuessing(true);
        const guess = pickGuess(newCandidates);
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
  }, [currentQuestion, questions, isGuessing]);

  const confirmGuess = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setGameState(prev => ({
        ...prev,
        isFinished: true,
        hasWon: true,
      }));
    } else {
      // Remove the wrong guess and continue
      setGameState(prev => {
        const newCandidates = prev.candidates.filter(c => c.id !== prev.currentGuess?.id);
        
        // Check if we have more candidates or reached question limit
        if (newCandidates.length === 0 || prev.questionsAsked >= MAX_QUESTIONS_BEFORE_GUESS + 5) {
          return {
            ...prev,
            isFinished: true,
            hasWon: false,
            candidates: newCandidates,
          };
        }

        // If still very few candidates, try another guess
        if (newCandidates.length <= MIN_CANDIDATES_TO_GUESS) {
          const newGuess = pickGuess(newCandidates);
          return {
            ...prev,
            candidates: newCandidates,
            currentGuess: newGuess,
          };
        }

        // Continue with questions
        const askedIds = Object.keys(prev.answers);
        const nextQuestion = getNextQuestion(questions, askedIds, newCandidates);
        
        if (!nextQuestion) {
          const newGuess = pickGuess(newCandidates);
          return {
            ...prev,
            candidates: newCandidates,
            currentGuess: newGuess,
          };
        }

        setCurrentQuestion(nextQuestion);
        setIsGuessing(false);

        return {
          ...prev,
          candidates: newCandidates,
          currentGuess: null,
        };
      });
    }
  }, [questions]);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setQuestions([]);
    setCurrentQuestion(null);
    setIsGuessing(false);
    setIsLoading(false);
  }, []);

  return {
    gameState,
    currentQuestion,
    isLoading,
    isGuessing,
    startGame,
    answerQuestion,
    confirmGuess,
    resetGame,
  };
}
