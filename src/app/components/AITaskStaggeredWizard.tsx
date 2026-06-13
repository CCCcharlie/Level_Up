import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { OnboardingChecklistResponse, OnboardingChecklistStep } from '../../lib/aiService';

interface AITaskStaggeredWizardProps {
  onCommit?: (data: OnboardingChecklistResponse) => void;
}

// Mock Data for demonstration
const MOCK_RESPONSE: OnboardingChecklistResponse = {
  inferredLevel: 'Beginner',
  detectedDirection: 'Frontend Development',
  headline: 'React Foundation',
  steps: [
    { title: 'Understand React Lifecycle', summary: 'Learn how components mount, update, and unmount.', type: 'concept', estimatedXP: 50 },
    { title: 'Build a Simple Counter', summary: 'Use useState to manage state.', type: 'project', estimatedXP: 100 },
    { title: 'Learn useEffect', summary: 'Handle side effects like data fetching.', type: 'concept', estimatedXP: 75 },
  ],
  followUpQuestion: 'I assumed you are a beginner. Is this level appropriate for you?',
  quickReplies: ['Yes, I am a beginner', 'No, adjust to intermediate', 'I have other needs'],
};

export const AITaskStaggeredWizard: React.FC<AITaskStaggeredWizardProps> = ({ onCommit }) => {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<OnboardingChecklistResponse & { quickReplies?: string[] } | null>(null);
  
  // Using a local flag to prevent scrolling conflicts if user is manually scrolling
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const userIsScrolling = useRef(false);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    setResult(null);
    userIsScrolling.current = false; // Reset scrolling lock on new generation

    // Simulate AI network delay
    setTimeout(() => {
      setResult(MOCK_RESPONSE as OnboardingChecklistResponse & { quickReplies?: string[] });
      setIsGenerating(false);
    }, 1500);
  };

  // Listen for manual scroll events to apply scroll lock
  useEffect(() => {
    const handleUserScroll = () => {
      userIsScrolling.current = true;
    };

    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, []);

  // Auto-scroll to the follow-up section when result is rendered
  useEffect(() => {
    if (result && scrollAnchorRef.current && !userIsScrolling.current) {
      // Small timeout to ensure DOM is fully painted and framer-motion stagger has started
      const timer = setTimeout(() => {
        if (!userIsScrolling.current) {
          scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Input Area */}
      <div className="relative w-full rounded-2xl border border-gray-700 bg-gray-800/50 p-4 shadow-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Set Your Next Goal</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-500"
            placeholder="e.g., Master React Fundamentals..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !goal.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Staggered Reveal Area */}
      {result && (
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {result.steps.map((step, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              className="group relative flex items-start gap-4 rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-lg transition-colors hover:border-gray-600 hover:bg-gray-800/80"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-medium text-gray-100">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.summary}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-600">
                    {step.type}
                  </span>
                  {step.estimatedXP && (
                    <span className="text-xs text-blue-400 font-medium">+{step.estimatedXP} XP</span>
                  )}
                </div>
              </div>
            </motion.li>
          ))}

          {/* Follow-up Question Block - Act as the last child in the stagger container */}
          <motion.li
            variants={itemVariants}
            className="mt-4 rounded-xl border border-blue-900/50 bg-blue-950/20 p-5 shadow-inner"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-blue-300">
                <span className="text-xl leading-none">💡</span>
                <p className="text-sm leading-relaxed">{result.followUpQuestion}</p>
              </div>

              {/* Dynamic Quick Replies */}
              {result.quickReplies && result.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-700/50 bg-blue-900/30 px-3 py-1.5 text-sm text-blue-200 transition-colors hover:bg-blue-800/50 hover:text-white"
                      onClick={() => {
                        // Logic to send quick reply back to AI or update goal
                        setGoal(reply);
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Commit Action */}
              <div className="mt-4 flex justify-end border-t border-blue-900/50 pt-4">
                <button
                  onClick={() => onCommit?.(result)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 active:scale-95"
                >
                  Generate Tasks
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Scroll Anchor to ensure this block stays in view */}
            <div ref={scrollAnchorRef} className="h-1 w-full" />
          </motion.li>
        </motion.ul>
      )}
    </div>
  );
};

export default AITaskStaggeredWizard;
