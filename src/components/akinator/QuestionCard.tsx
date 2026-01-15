import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AkinatorQuestion, AnswerType } from '@/types/tmdb';
import { Check, X, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface QuestionCardProps {
  question: AkinatorQuestion;
  questionsAsked: number;
  candidatesCount: number;
  onAnswer: (answer: AnswerType) => void;
}

const answerButtons: { type: AnswerType; label: string; icon: React.ReactNode; className: string }[] = [
  { 
    type: 'yes', 
    label: 'Oui', 
    icon: <Check className="w-4 h-4" />, 
    className: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600' 
  },
  { 
    type: 'probably', 
    label: 'Probablement', 
    icon: <ChevronUp className="w-4 h-4" />, 
    className: 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-400 border-emerald-600/50' 
  },
  { 
    type: 'unknown', 
    label: 'Je ne sais pas', 
    icon: <HelpCircle className="w-4 h-4" />, 
    className: 'bg-muted hover:bg-muted/80 text-muted-foreground border-border' 
  },
  { 
    type: 'probably_not', 
    label: 'Prob. pas', 
    icon: <ChevronDown className="w-4 h-4" />, 
    className: 'bg-red-600/30 hover:bg-red-600/40 text-red-400 border-red-600/50' 
  },
  { 
    type: 'no', 
    label: 'Non', 
    icon: <X className="w-4 h-4" />, 
    className: 'bg-red-600 hover:bg-red-500 text-white border-red-600' 
  },
];

export function QuestionCard({ question, questionsAsked, candidatesCount, onAnswer }: QuestionCardProps) {
  const progress = Math.min((questionsAsked / 25) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="p-6 md:p-8 bg-card/90 backdrop-blur border-border/50 shadow-card">
        {/* Progress section */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span className="font-medium">Question {questionsAsked + 1}</span>
            <span>{candidatesCount} possibilités</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>

        {/* Question */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-center leading-relaxed text-foreground">
            {question.text}
          </h2>
        </motion.div>

        {/* Answer buttons */}
        <div className="grid grid-cols-5 gap-2">
          {answerButtons.map((btn) => (
            <motion.div
              key={btn.type}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant="outline"
                onClick={() => onAnswer(btn.type)}
                className={`w-full h-auto py-3 flex flex-col gap-1.5 border ${btn.className} transition-all`}
              >
                {btn.icon}
                <span className="text-xs font-medium">{btn.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
