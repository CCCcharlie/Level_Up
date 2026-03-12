import { useState } from 'react';
import { GameSkillTree } from './components/GameSkillTree';
import { IntegratedSkillSystem } from './components/IntegratedSkillSystem';
import { DataDashboard } from './components/DataDashboard';
import { CareerOnboarding } from './components/CareerOnboarding';
import { ExplorePage } from './components/ExplorePage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Sparkles, BarChart3, Zap, Trophy, Coins, Compass, RefreshCcw } from 'lucide-react';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [skillPoints, setSkillPoints] = useState(15);
  const [totalXP, setTotalXP] = useState(3250);
  const [level, setLevel] = useState(8);
  const [skillsData, setSkillsData] = useState({
    frontend: 75,
    backend: 45,
    design: 60,
    database: 50,
    devops: 30,
  });

  const handleOnboardingComplete = (careers: string[]) => {
    setSelectedCareers(careers);
    setShowOnboarding(false);
  };

  // Show onboarding if not completed
  if (showOnboarding) {
    return <CareerOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 flex items-center gap-3">
                <Sparkles className="w-12 h-12 text-yellow-400" />
                技能树加点系统
              </h1>
              <p className="text-gray-300 text-lg">像游戏一样提升你的技能等级</p>
              <div className="flex flex-wrap gap-2 mt-3 items-center">
                <span className="text-gray-400 text-sm">已选择职业方向:</span>
                {selectedCareers.map(career => (
                  <Badge key={career} className="bg-purple-600 text-white">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowOnboarding(true)}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              重选职业
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm mb-1">等级</p>
                  <p className="text-4xl font-bold text-purple-100">LV {level}</p>
                </div>
                <Trophy className="w-10 h-10 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm mb-1">总经验</p>
                  <p className="text-4xl font-bold text-blue-100">{totalXP}</p>
                </div>
                <Zap className="w-10 h-10 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border-yellow-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm mb-1">可用技能点</p>
                  <p className="text-4xl font-bold text-yellow-100">{skillPoints}</p>
                </div>
                <Coins className="w-10 h-10 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-pink-700/20 border-pink-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-300 text-sm mb-1">已掌握技能</p>
                  <p className="text-4xl font-bold text-pink-100">24</p>
                </div>
                <Sparkles className="w-10 h-10 text-pink-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="skill-tree" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <TabsTrigger 
              value="skill-tree" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              技能树
            </TabsTrigger>
            <TabsTrigger 
              value="explore"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Compass className="w-4 h-4 mr-2" />
              职业探索
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              数据大屏
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skill-tree">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  星盘技能树 & 任务中心
                </CardTitle>
                <CardDescription className="text-gray-400">
                  点击技能查看相关任务，完成任务获得技能点和经验值
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegratedSkillSystem 
                  skillPoints={skillPoints}
                  onSkillPointsChange={setSkillPoints}
                  onSkillsDataChange={setSkillsData}
                  selectedCareers={selectedCareers}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explore">
            <ExplorePage selectedCareers={selectedCareers} skillsData={skillsData} />
          </TabsContent>

          <TabsContent value="dashboard">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  数据可视化大屏
                </CardTitle>
                <CardDescription className="text-gray-400">
                  查看你的技能成长数据和学习统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataDashboard 
                  skillsData={skillsData}
                  totalXP={totalXP}
                  level={level}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}