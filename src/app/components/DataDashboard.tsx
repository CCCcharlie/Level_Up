import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, Zap, Award, Clock, Target, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface DataDashboardProps {
  skillsData: {
    frontend: number;
    backend: number;
    design: number;
    database: number;
    devops: number;
  };
  totalXP: number;
  level: number;
}

export function DataDashboard({ skillsData, totalXP, level }: DataDashboardProps) {

  const activityLogs = [
    { id: 1, timestamp: '2024-03-29 14:30', type: '技能升级', content: 'React Hooks 熟练度提升至 LV.5', xp: 500 },
    { id: 2, timestamp: '2024-03-29 10:15', type: '任务完成', content: '完成“手写一个 Promise”挑战', xp: 300 },
    { id: 3, timestamp: '2024-03-28 22:00', type: '日常练习', content: '连续登录第 42 天奖励', xp: 100 },
    { id: 4, timestamp: '2024-03-28 15:45', type: '项目里程碑', content: '星盘技能树组件初版上线', xp: 1200 },
  ];


  // 在 DataDashboard.tsx 内部新增或作为独立文件
const LearningTimeline = ({ logs }: { logs: any[] }) => {
  return (
    <div className="relative pl-6 border-l-2 border-slate-700 space-y-8 py-2">
      {logs.map((log, index) => (
        <motion.div 
          key={log.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* 时间轴小圆点 */}
          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-mono mb-1">{log.timestamp}</span>
            <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-400">
                  {log.type}
                </Badge>
                <h4 className="text-sm font-medium text-slate-200">{log.content}</h4>
              </div>
              <p className="text-xs text-slate-400">获得经验: <span className="text-green-400">+{log.xp} XP</span></p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};


  // Prepare radar chart data
  const radarData = [
    { subject: '前端开发', value: skillsData.frontend, fullMark: 100 },
    { subject: '后端开发', value: skillsData.backend, fullMark: 100 },
    { subject: 'UI设计', value: skillsData.design, fullMark: 100 },
    { subject: '数据库', value: skillsData.database, fullMark: 100 },
    { subject: 'DevOps', value: skillsData.devops, fullMark: 100 },
  ];

  // Weekly progress data
  const weeklyData = [
    { day: '周一', xp: 320, hours: 2.5 },
    { day: '周二', xp: 450, hours: 3.2 },
    { day: '周三', xp: 280, hours: 2.0 },
    { day: '周四', xp: 520, hours: 4.0 },
    { day: '周五', xp: 410, hours: 3.5 },
    { day: '周六', xp: 680, hours: 5.5 },
    { day: '周日', xp: 590, hours: 4.8 },
  ];

  // Monthly XP growth
  const monthlyData = [
    { month: '1月', xp: 2800 },
    { month: '2月', xp: 3200 },
    { month: '3月', xp: 4100 },
    { month: '4月', xp: 3900 },
    { month: '5月', xp: 4800 },
    { month: '6月', xp: 5500 },
  ];

  // Skill categories distribution
  const categoryData = [
    { name: '前端开发', value: skillsData.frontend, color: '#3b82f6' },
    { name: '后端开发', value: skillsData.backend, color: '#10b981' },
    { name: 'UI设计', value: skillsData.design, color: '#ec4899' },
    { name: '数据库', value: skillsData.database, color: '#8b5cf6' },
    { name: 'DevOps', value: skillsData.devops, color: '#f59e0b' },
  ];

  // Achievements data
  const achievements = [
    { title: '初学者', description: '完成第一个技能升级', earned: true, icon: '🎯' },
    { title: '全栈之路', description: '前端和后端技能都达到LV3', earned: true, icon: '🚀' },
    { title: '数据专家', description: '掌握3种数据库技术', earned: true, icon: '💾' },
    { title: '工具大师', description: 'Git达到满级', earned: true, icon: '🔧' },
    { title: '框架精通', description: 'React或Vue达到LV5', earned: false, icon: '⭐' },
    { title: '全能战士', description: '所有类别技能平均LV4+', earned: false, icon: '👑' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}\



      {/* 新增的 LearningTimeline 区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              成长足迹 (Learning Timeline)
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <LearningTimeline logs={activityLogs} />
          </CardContent>
        </Card>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm mb-1">本周学习时长</p>
                  <p className="text-3xl font-bold text-white">25.5h</p>
                  <p className="text-xs text-blue-300 mt-1">↑ 12% vs 上周</p>
                </div>
                <Clock className="w-12 h-12 text-blue-400 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-green-700/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm mb-1">本周获得XP</p>
                  <p className="text-3xl font-bold text-white">3,250</p>
                  <p className="text-xs text-green-300 mt-1">平均 464 XP/天</p>
                </div>
                <Zap className="w-12 h-12 text-green-400 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm mb-1">连续学习天数</p>
                  <p className="text-3xl font-bold text-white">42天</p>
                  <p className="text-xs text-purple-300 mt-1">🔥 保持连续！</p>
                </div>
                <Activity className="w-12 h-12 text-purple-400 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm mb-1">完成目标</p>
                  <p className="text-3xl font-bold text-white">18/25</p>
                  <p className="text-xs text-yellow-300 mt-1">72% 完成率</p>
                </div>
                <Target className="w-12 h-12 text-yellow-400 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart - Skills Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                技能雷达图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Radar
                    name="技能等级"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  综合评分: <span className="text-purple-400 font-bold text-lg">
                    {Math.round((skillsData.frontend + skillsData.backend + skillsData.design + skillsData.database + skillsData.devops) / 5)}
                  </span>/100
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart - Weekly XP */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                本周学习数据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="day" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                  <Bar dataKey="xp" name="经验值" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="hours" name="学习时长(h)" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Line Chart - Monthly Growth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-800/50 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                月度成长曲线
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorXp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  半年总经验: <span className="text-green-400 font-bold text-lg">24,300 XP</span>
                  <span className="text-green-400 ml-2">↑ 96%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Skills Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-slate-800/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-400" />
                技能分布占比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {categoryData.map((item) => (
                  <Badge 
                    key={item.name}
                    style={{ backgroundColor: `${item.color}40`, color: item.color }}
                    className="border-0"
                  >
                    {item.name}: {item.value}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-slate-800/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              成就徽章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`text-center p-4 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 hover:scale-105'
                      : 'bg-gray-800/50 border-gray-700 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-400 text-xs">{achievement.description}</p>
                  {achievement.earned && (
                    <Badge className="mt-2 bg-yellow-500 text-black border-0">
                      已获得
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}