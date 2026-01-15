import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AkinatorQuestion, AnswerType } from '@/types/tmdb';
import { HelpCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface QuestionCardProps {
  question: AkinatorQuestion;
  questionsAsked: number;
  candidatesCount: number;
  onAnswer: (answer: AnswerType) => void;
}

const answerButtons: { type: AnswerType; label: string; icon: React.ReactNode; variant: 'default' | 'outline' | 'secondary' | 'ghost' }[] = [
  { type: 'yes', label: 'Oui', icon: <ThumbsUp className="w-5 h-5" />, variant: 'default' },
  { type: 'probably', label: 'Probablement', icon: <ThumbsUp className="w-4 h-4 opacity-70" />, variant: 'secondary' },
  { type: 'unknown', label: 'Je ne sais pas', icon: <HelpCircle className="w-5 h-5" />, variant: 'ghost' },
  { type: 'probably_not', label: 'Probablement pas', icon: <ThumbsDown className="w-4 h-4 opacity-70" />, variant: 'secondary' },
  { type: 'no', label: 'Non', icon: <ThumbsDown className="w-5 h-5" />, variant: 'outline' },
];

export function QuestionCard({ question, questionsAsked, candidatesCount, onAnswer }: QuestionCardProps) {
  const progress = Math.min((questionsAsked / 20) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="p-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-card">
        {/* Progress section */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {questionsAsked + 1}</span>
            <span>{candidatesCount} possibilités restantes</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-center leading-relaxed">
            {question.text}
          </h2>
        </motion.div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {answerButtons.map((btn) => (
            <motion.div
              key={btn.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={btn.variant}
                onClick={() => onAnswer(btn.type)}
                className={`w-full h-auto py-4 flex flex-col gap-2 ${
                  btn.type === 'yes' ? 'gradient-cinema text-primary-foreground shadow-glow' : ''
                } ${
                  btn.type === 'no' ? 'border-destructive/50 text-destructive hover:bg-destructive/10' : ''
                }`}
              >
                {btn.icon}
                <span className="text-sm font-medium">{btn.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
