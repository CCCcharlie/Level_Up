import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Code2, Database, Layout, Loader2, Chrome } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useGameStore, TargetLevel } from '../../store/useGameStore'; // 引入重构后的 Store
import { signInWithGoogle } from '../../lib/supabase';

export function CareerOnboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<string | null>(null);
  const [level, setLevel] = useState<TargetLevel | null>(null);
  const [isAwakening, setIsAwakening] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { setTargetLevel } = useGameStore();

  const careerDirections = [
    { id: 'frontend', title: t('onboarding.careerDirections.frontend'), icon: <Layout />, desc: t('onboarding.careerDirections.frontendDesc') },
    { id: 'backend', title: t('onboarding.careerDirections.backend'), icon: <Database />, desc: t('onboarding.careerDirections.backendDesc') },
    { id: 'fullstack', title: t('onboarding.careerDirections.fullstack'), icon: <Terminal />, desc: t('onboarding.careerDirections.fullstackDesc') },
  ];

  const targetLevels: { id: TargetLevel; title: string; desc: string }[] = [
    { id: 'Junior', title: t('onboarding.targetLevels.junior'), desc: t('onboarding.targetLevels.juniorDesc') },
    { id: 'Mid', title: t('onboarding.targetLevels.mid'), desc: t('onboarding.targetLevels.midDesc') },
    { id: 'Senior', title: t('onboarding.targetLevels.senior'), desc: t('onboarding.targetLevels.seniorDesc') },
  ];

  // 最终确认：触发 AI 觉醒动效 (PRD 1.5s 延迟)
  const handleFinalConfirm = (selectedLevel: TargetLevel) => {
    setLevel(selectedLevel);
    setIsAwakening(true);

    setTimeout(() => {
      if (direction) {
        setTargetLevel(direction, selectedLevel);
        // Store 内部会自动设置 isOnboarded: true
      }
    }, 1500);
  };

  // 处理 Google 登录
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* 背景动态光晕 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <AnimatePresence mode="wait">
        {/* Step 1: 职业方向选择 */}
        {step === 1 && !isAwakening && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl text-center z-10"
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 tracking-wider">
              {t('onboarding.step1Title')}
            </h2>

            {/* Google OAuth 登录按钮 */}
            <div className="mb-12 flex flex-col items-center">
              <p className="text-slate-400 text-sm mb-4">{t('onboarding.step1Desc')}</p>
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 py-3 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {/* 背景渐变 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* 边框微光效果 */}
                <div className="absolute inset-0 rounded-xl border border-blue-400/0 group-hover:border-blue-300/60 transition-colors duration-300 shadow-[0_0_20px_rgba(59,130,246,0)_inset,0_0_20px_rgba(59,130,246,0)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)_inset,0_0_20px_rgba(59,130,246,0.2)]" />

                {/* 内容 */}
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('auth.signInConnecting')}</span>
                    </>
                  ) : (
                    <>
                      <Chrome className="w-5 h-5" />
                      <span>{t('auth.signIn')}</span>
                    </>
                  )}
                </div>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {careerDirections.map((item) => (
                <Card 
                  key={item.id}
                  onClick={() => { setDirection(item.id); setStep(2); }}
                  className="group bg-slate-900/50 border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  <CardContent className="p-8 flex flex-col items-center">
                    <div className="p-4 rounded-2xl bg-slate-800 text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: 目标段位确认 */}
        {step === 2 && !isAwakening && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-4xl text-center z-10"
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8 tracking-wider">
              {t('onboarding.step2Title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {targetLevels.map((item) => (
                <Card 
                  key={item.id}
                  onClick={() => handleFinalConfirm(item.id)}
                  className="group bg-slate-900/50 border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all duration-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                >
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{item.desc}</p>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-pink-500 transition-all ${item.id === 'Junior' ? 'w-1/3' : item.id === 'Mid' ? 'w-2/3' : 'w-full'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-500 hover:text-white">
              {t('onboarding.backButton')}
            </Button>
          </motion.div>
        )}

        {/* AI 觉醒 Loading (PRD 核心动效) */}
        {isAwakening && (
          <motion.div
            key="awakening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full" />
              <Sparkles className="w-24 h-24 text-blue-400 relative z-10" />
            </motion.div>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
            />
            
            <p className="text-xl text-blue-100 font-medium tracking-widest animate-pulse">{t('onboarding.step2Desc')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default CareerOnboarding;