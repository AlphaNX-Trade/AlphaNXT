import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, XCircle, Award, Loader2 } from 'lucide-react';
import { getTopicById } from '@/data/learnContent';
import { submitQuizAttempt, type SubmitQuizResult } from '@/lib/learnService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface QuizPageProps {
  topicId: string;
}

type QuizStep = 'question' | 'submitting' | 'result';

export default function QuizPage({ topicId }: QuizPageProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const topic = getTopicById(topicId);

  const [step, setStep] = useState<QuizStep>('question');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<SubmitQuizResult | null>(null);

  if (!topic) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center max-w-[480px] mx-auto px-4 text-center">
        <p className="text-foreground font-medium">Topic not found</p>
        <button onClick={() => setLocation('/learn')} className="mt-3 text-primary text-sm font-medium">
          Back to Learning Academy
        </button>
      </div>
    );
  }

  const totalQuestions = topic.quiz.length;
  const question = topic.quiz[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelect = (optionIndex: number) => {
    if (answered) return;
    setSelectedIndex(optionIndex);
    setAnswered(true);
    if (optionIndex === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setAnswered(false);
      return;
    }

    // Last question — submit the attempt
    if (!user) return;
    setStep('submitting');
    try {
      const finalResult = await submitQuizAttempt(user.uid, topic.id, correctCount, totalQuestions);
      setResult(finalResult);
      setStep('result');
      if (finalResult.newlyEarnedBadges.length > 0) {
        finalResult.newlyEarnedBadges.forEach((badge) => {
          toast({ title: `🏆 Badge earned: ${badge.title}`, description: badge.description });
        });
      }
    } catch (err) {
      setStep('question');
      toast({
        title: 'Could not submit quiz',
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  if (step === 'submitting') {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center max-w-[480px] mx-auto">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto px-4 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
          </div>

          <div>
            <p className="text-xl font-bold text-foreground">{result.scorePercent}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {correctCount} of {totalQuestions} correct
            </p>
          </div>

          {result.passed ? (
            <p className="text-sm text-green-400 font-medium">
              {result.xpAwarded > 0 ? `+${result.xpAwarded} XP earned!` : 'Passed — already completed before'}
            </p>
          ) : (
            <p className="text-sm text-red-400 font-medium">
              Score 70% or higher to pass. Review the lesson and try again.
            </p>
          )}

          {result.newlyEarnedBadges.length > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <Award className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-medium">
                New badge: {result.newlyEarnedBadges.map((b) => b.title).join(', ')}
              </span>
            </div>
          )}

          <div className="w-full flex flex-col gap-2 pt-4">
            <button
              onClick={() => setLocation('/learn')}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Back to Learning Academy
            </button>
            {!result.passed && (
              <button
                onClick={() => setLocation(`/learn/${topic.id}`)}
                className="w-full bg-card border border-border text-foreground font-medium text-sm py-3.5 rounded-xl hover:border-primary/30 transition-colors"
              >
                Review Lesson
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto pb-6">
      {/* Fixed header with progress */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation(`/learn/${topic.id}`)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Exit quiz"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-mono text-xs text-muted-foreground">
          {currentIndex + 1} / {totalQuestions}
        </span>
        <div className="w-6" aria-hidden />
      </header>

      <main className="flex-1 px-4 pt-[72px] space-y-5">
        <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-4"
          >
            <p className="text-base font-medium text-foreground leading-snug">{question.question}</p>

            <div className="space-y-2">
              {question.options.map((option, i) => {
                const isSelected = selectedIndex === i;
                const isCorrectOption = i === question.correctIndex;
                let stateClasses = 'border-border hover:border-primary/30';
                if (answered) {
                  if (isCorrectOption) {
                    stateClasses = 'border-green-500/50 bg-green-500/5';
                  } else if (isSelected) {
                    stateClasses = 'border-red-500/50 bg-red-500/5';
                  } else {
                    stateClasses = 'border-border opacity-50';
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3.5 bg-card border rounded-xl text-left text-sm text-foreground transition-colors ${stateClasses}`}
                  >
                    <span>{option}</span>
                    {answered && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                    {answered && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-secondary/30 border border-border rounded-xl p-4"
              >
                <p className="text-xs text-muted-foreground leading-relaxed">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {answered && (
        <div className="px-4 pt-4">
          <button
            onClick={handleNext}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
