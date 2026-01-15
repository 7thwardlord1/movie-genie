import { useState, useCallback } from 'react';
import { GameState, MediaType, AnswerType, AkinatorQuestion, EnrichedMedia } from '@/types/tmdb';
import { getMediaPool } from '@/lib/tmdb';
import { getInitialQuestions, getNextQuestion, filterCandidates, pickGuess } from '@/lib/akinator-questions';

// Tuning constants for better precision
const MIN_CANDIDATES_TO_GUESS = 2;
const MAX_QUESTIONS_BEFORE_GUESS = 40;
const HIGH_CONFIDENCE_THRESHOLD = 2;
const MIN_QUESTIONS_BEFORE_EARLY_GUESS = 15;

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

  const startGame = useCallback(async (mediaType: MediaType) => {
    setIsLoading(true);
    setLoadingProgress({ step: 'Initialisation...', progress: 0 });
    
    try {
      const pool = await getMediaPool(mediaType, (step, progress) => {
        setLoadingProgress({ step, progress });
      });
      
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
      setLoadingProgress(null);
    }
  }, []);

  const answerQuestion = useCallback((answer: AnswerType) => {
    if (!currentQuestion || isGuessing) return;

    setGameState(prev => {
      const newAnswers = { ...prev.answers, [currentQuestion.id]: answer };
      const newCandidates = filterCandidates(prev.candidates, currentQuestion, answer);
      const newQuestionsAsked = prev.questionsAsked + 1;

      const shouldGuess = 
        newCandidates.length <= HIGH_CONFIDENCE_THRESHOLD ||
        newQuestionsAsked >= MAX_QUESTIONS_BEFORE_GUESS ||
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

      const askedIds = Object.keys(newAnswers);
      const nextQuestion = getNextQuestion(questions, askedIds, newCandidates);
      
      if (!nextQuestion) {
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
      setGameState(prev => {
        const newCandidates = prev.candidates.filter(c => c.id !== prev.currentGuess?.id);
        
        if (newCandidates.length === 0 || prev.questionsAsked >= MAX_QUESTIONS_BEFORE_GUESS + 5) {
          return {
            ...prev,
            isFinished: true,
            hasWon: false,
            candidates: newCandidates,
          };
        }

        if (newCandidates.length <= MIN_CANDIDATES_TO_GUESS) {
          const newGuess = pickGuess(newCandidates);
          return {
            ...prev,
            candidates: newCandidates,
            currentGuess: newGuess,
          };
        }

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
    setLoadingProgress(null);
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
