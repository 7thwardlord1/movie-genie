import { useState, useCallback } from 'react';
import { GameState, MediaType, AnswerType, AkinatorQuestion, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { getMediaPool } from '@/lib/tmdb';
import { getQuestions, getNextQuestion, filterCandidates, pickGuess, shuffleArray } from '@/lib/akinator-questions';

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
      const shuffledPool = shuffleArray(pool);
      const gameQuestions = getQuestions(mediaType);
      
      setQuestions(gameQuestions);
      
      const firstQuestion = getNextQuestion(gameQuestions, [], shuffledPool);
      setCurrentQuestion(firstQuestion);
      
      setGameState({
        ...initialGameState,
        mediaType,
        candidates: shuffledPool,
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

      // Check if we should make a guess
      const shouldGuess = 
        newCandidates.length <= 5 || 
        newQuestionsAsked >= 15 ||
        (newQuestionsAsked >= 10 && newCandidates.length <= 10);

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
        
        // Check if we have more candidates
        if (newCandidates.length === 0 || prev.questionsAsked >= 20) {
          return {
            ...prev,
            isFinished: true,
            hasWon: false,
            candidates: newCandidates,
          };
        }

        // Try another guess or continue questions
        if (newCandidates.length <= 3) {
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
