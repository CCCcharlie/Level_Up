import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Target, Briefcase, GraduationCap, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface GoalSettingProps {
  onGoalChange: (goal: string) => void;
}

export function GoalSetting({ onGoalChange }: GoalSettingProps) {
  const [selectedCareer, setSelectedCareer] = useState('frontend');
  const [customGoal, setCustomGoal] = useState('');
  const [timeframe, setTimeframe] = useState('6months');

  const careerPaths = [
    {
      id: 'frontend',
      title: '前端开发工程师',
      icon: '💻',
      description: '专注于用户界面和交互体验的开发',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Vue.js'],
      salary: '15-30K',
    },
    {
      id: 'fullstack',
      title: '全栈开发工程师',
      icon: '🚀',
      description: '掌握前后端开发的全能型人才',
      skills: ['前端框架', 'Node.js', '数据库', 'DevOps'],
      salary: '20-40K',
    },
    {
      id: 'backend',
      title: '后端开发工程师',
      icon: '⚙️',
      description: '负责服务器端逻辑和数据库设计',
      skills: ['Java/Python', '数据库', 'API设计', '微服务'],
      salary: '18-35K',
    },
    {
      id: 'mobile',
      title: '移动开发工程师',
      icon: '📱',
      description: '开发iOS和Android移动应用',
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      salary: '18-35K',
    },
    {
      id: 'ai',
      title: 'AI/机器学习工程师',
      icon: '🤖',
      description: '研究和实现人工智能解决方案',
      skills: ['Python', 'TensorFlow', '深度学习', '数据分析'],
      salary: '25-50K',
    },
    {
      id: 'data',
      title: '数据科学家',
      icon: '📊',
      description: '从数据中提取洞察和价值',
      skills: ['统计学', 'Python/R', '数据可视化', '机器学习'],
      salary: '20-40K',
    },
  ];

  const selectedPath = careerPaths.find((path) => path.id === selectedCareer);

  const handleSubmit = () => {
    const goal = customGoal || selectedPath?.title || '前端开发工程师';
    onGoalChange(goal);
    // Show success feedback
    alert(`目标已设定: ${goal}`);
  };

  return (
    <div className="space-y-6">
      {/* Career Path Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          选择职业方向
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerPaths.map((path) => (
            <motion.div
              key={path.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedCareer === path.id
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCareer(path.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{path.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {path.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {path.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {path.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-green-600 font-semibold">
                        薪资范围: {path.salary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Path Details */}
      {selectedPath && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                当前选择: {selectedPath.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    核心技能
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.skills.map((skill) => (
                      <Badge key={skill} className="bg-indigo-600">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeframe Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          学习时间规划
        </h3>
        <RadioGroup value={timeframe} onValueChange={setTimeframe}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { value: '3months', label: '3个月', desc: '快速入门' },
              { value: '6months', label: '6个月', desc: '系统学习' },
              { value: '1year', label: '1年', desc: '深度掌握' },
              { value: '2years', label: '2年', desc: '精通专家' },
            ].map((option) => (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  timeframe === option.value
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setTimeframe(option.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div>
                      <Label
                        htmlFor={option.value}
                        className="font-semibold text-gray-900 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-xs text-gray-600">{option.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Custom Goal */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          自定义学习目标 (可选)
        </h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="custom-goal">具体目标描述</Label>
              <Input
                id="custom-goal"
                placeholder="例如：成为一名优秀的React开发者"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="motivation">学习动机</Label>
              <Textarea
                id="motivation"
                placeholder="为什么想要学习这个方向？这将帮助AI为您定制更好的学习计划..."
                className="mt-2 resize-none"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-600" />
            AI推荐建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  基于您选择的{selectedPath?.title}方向
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  建议从HTML/CSS基础开始，逐步学习JavaScript和React框架
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  推荐每日学习2-3小时
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  保持持续学习，配合实战项目效果更佳
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  加入社区交流
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  与其他学习者互动，分享经验，获得反馈
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6"
        size="lg"
      >
        <Target className="w-5 h-5 mr-2" />
        确认并生成学习路径
      </Button>
    </div>
  );
}
