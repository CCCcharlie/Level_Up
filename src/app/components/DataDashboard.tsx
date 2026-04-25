'use client';

import { useTranslation } from 'react-i18next';
import LearningPathFlow from './LearningPathFlow';
import EnhancedTaskCenter from './EnhancedTaskCenter';
import CustomProjectSystem from './CustomProjectSystem';

export default function DataDashboard() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">{t('dataDashboard.title')}</h1>
          <p className="text-slate-400 mt-3 text-lg">{t('dataDashboard.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧：路线图导航中枢（视觉核心，占据较宽空间） */}
          <div className="lg:col-span-5 xl:col-span-6">
            <div className="sticky top-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                <h2 className="text-2xl font-semibold text-orange-400">{t('dataDashboard.trajectory')}</h2>
              </div>
              <LearningPathFlow />
            </div>
          </div>

          {/* 右侧：联动内容区 */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-10">
            {/* 任务中心 */}
            <div>
              <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-3">
                <span className="text-green-400">✅</span>
                {t('dataDashboard.taskCenter')}
              </h3>
              <EnhancedTaskCenter />
            </div>

            {/* 实战项目推荐 */}
            <div>
              <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-3">
                <span className="text-emerald-400">🚀</span>
                {t('dataDashboard.projectRecommendations')}
              </h3>
              <CustomProjectSystem />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}