import { useState } from 'react';
import { StarConstellationSkillTree } from './StarConstellationSkillTree';
import EnhancedTaskCenter from './EnhancedTaskCenter';
import CustomProjectSystem from './CustomProjectSystem';
import { EquipmentSystem, Equipment } from './EquipmentSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Star, Target, FolderKanban, Award, Code, Server, Database, Brain, Cloud, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface IntegratedSkillSystemProps {
  skillPoints: number;
  onSkillPointsChange: (points: number) => void;
  onSkillsDataChange: (data: any) => void;
  selectedCareers?: string[];
}

export function IntegratedSkillSystem({
  skillPoints,
  onSkillPointsChange,
  onSkillsDataChange,
  selectedCareers = []
}: IntegratedSkillSystemProps) {
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    name: string;
    category: string;
    currentLevel: number;
  } | null>(null);

  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const allSkills = [
    { id: 'core', name: '编程基础', currentLevel: 5 },
    { id: 'html', name: 'HTML', currentLevel: 5 },
    { id: 'css', name: 'CSS', currentLevel: 5 },
    { id: 'javascript', name: 'JavaScript', currentLevel: 4 },
    { id: 'sql', name: 'SQL', currentLevel: 3 },
    { id: 'git', name: 'Git', currentLevel: 4 },
    { id: 'nodejs-basic', name: 'Node基础', currentLevel: 2 },
    { id: 'react', name: 'React', currentLevel: 3 },
    { id: 'vue', name: 'Vue.js', currentLevel: 0 },
    { id: 'typescript', name: 'TypeScript', currentLevel: 2 },
    { id: 'mongodb', name: 'MongoDB', currentLevel: 2 },
    { id: 'docker', name: 'Docker', currentLevel: 1 },
    { id: 'react-native', name: 'React Native', currentLevel: 0 },
    { id: 'nextjs', name: 'Next.js', currentLevel: 1 },
    { id: 'graphql', name: 'GraphQL', currentLevel: 0 },
    { id: 'kubernetes', name: 'Kubernetes', currentLevel: 0 },
    { id: 'ai-ml', name: 'AI/ML', currentLevel: 0 },
    { id: 'security', name: '网络安全', currentLevel: 0 },
    { id: 'microservices', name: '微服务', currentLevel: 0 },
  ];

  const generateEquipment = (projectTitle: string, category: string, aiScore: number, difficulty: string, skillsUsed: string[]): Equipment => {
    // Determine rarity based on AI score
    let rarity: Equipment['rarity'];
    if (aiScore >= 90) rarity = 'legendary';
    else if (aiScore >= 80) rarity = 'epic';
    else if (aiScore >= 70) rarity = 'rare';
    else if (aiScore >= 60) rarity = 'uncommon';
    else rarity = 'common';

    // Determine type based on category
    let type: Equipment['type'];
    let icon: React.ReactNode;
    if (category.includes('前端') || category.includes('UI')) {
      type = 'weapon';
      icon = <Code className="w-6 h-6" />;
    } else if (category.includes('后端') || category.includes('全栈')) {
      type = 'armor';
      icon = <Server className="w-6 h-6" />;
    } else {
      type = 'accessory';
      icon = <Shield className="w-6 h-6" />;
    }

    // Generate stats based on skills used and rarity
    const baseStatValue = rarity === 'legendary' ? 15 : rarity === 'epic' ? 12 : rarity === 'rare' ? 10 : rarity === 'uncommon' ? 7 : 5;
    const stats: Equipment['stats'] = {};

    skillsUsed.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('html') || skillLower.includes('css')) {
        stats.frontend = (stats.frontend || 0) + baseStatValue;
      }
      if (skillLower.includes('node') || skillLower.includes('express') || skillLower.includes('api')) {
        stats.backend = (stats.backend || 0) + baseStatValue;
      }
      if (skillLower.includes('design') || skillLower.includes('figma') || skillLower.includes('ui')) {
        stats.design = (stats.design || 0) + baseStatValue;
      }
      if (skillLower.includes('mongo') || skillLower.includes('sql') || skillLower.includes('database') || skillLower.includes('postgres')) {
        stats.database = (stats.database || 0) + baseStatValue;
      }
      if (skillLower.includes('docker') || skillLower.includes('kubernetes') || skillLower.includes('devops') || skillLower.includes('ci/cd')) {
        stats.devops = (stats.devops || 0) + baseStatValue;
      }
      if (skillLower.includes('ai') || skillLower.includes('ml') || skillLower.includes('machine')) {
        stats.ai = (stats.ai || 0) + baseStatValue;
      }
    });

    // If no stats assigned, give default frontend stat
    if (Object.keys(stats).length === 0) {
      stats.frontend = baseStatValue;
    }

    return {
      id: `equip-${Date.now()}`,
      name: projectTitle,
      type,
      rarity,
      category,
      description: `完成项目 "${projectTitle}" 后获得的${type === 'weapon' ? '武器' : type === 'armor' ? '防具' : '饰品'}`,
      stats,
      sourceProject: {
        title: projectTitle,
        aiScore,
        difficulty,
      },
      icon,
      equippedSlot: null,
    };
  };

  const handleProjectComplete = (projectTitle: string, category: string, aiScore: number, difficulty: string, xp: number, sp: number, skillsUsed: string[]) => {
    onSkillPointsChange(skillPoints + sp);
    
    // Generate equipment from completed project
    const newEquipment = generateEquipment(projectTitle, category, aiScore, difficulty, skillsUsed);
    setEquipment(prev => [...prev, newEquipment]);
    
    // Show equipment获得 notification
    toast.success(
      `获得${getRarityText(newEquipment.rarity)}装备: ${newEquipment.name}！`,
      { 
        icon: '⚔️',
        duration: 5000
      }
    );
  };

  const handleTaskComplete = (taskId: string, rewards: { xp: number; skillPoints: number }) => {
    onSkillPointsChange(skillPoints + rewards.skillPoints);
  };

  const handleEquip = (equipmentId: string, slot: Equipment['equippedSlot']) => {
    setEquipment(prev => prev.map(e =>
      e.id === equipmentId ? { ...e, equippedSlot: slot } : e
    ));
  };

  const handleUnequip = (equipmentId: string) => {
    setEquipment(prev => prev.map(e =>
      e.id === equipmentId ? { ...e, equippedSlot: null } : e
    ));
  };

  const getRarityText = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'common': return '普通';
      case 'uncommon': return '精良';
      case 'rare': return '稀有';
      case 'epic': return '史诗';
      case 'legendary': return '传说';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="constellation" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="constellation" className="data-[state=active]:bg-purple-600">
            <Star className="w-4 h-4 mr-2" />
            星盘技能树
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-green-600">
            <Target className="w-4 h-4 mr-2" />
            任务中心
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-blue-600">
            <FolderKanban className="w-4 h-4 mr-2" />
            项目系统
          </TabsTrigger>
          <TabsTrigger value="equipment" className="data-[state=active]:bg-yellow-600">
            <Award className="w-4 h-4 mr-2" />
            装备库 ({equipment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="constellation" className="mt-6">
          <StarConstellationSkillTree
            skillPoints={skillPoints}
            onSkillPointsChange={onSkillPointsChange}
            onSkillsDataChange={onSkillsDataChange}
            selectedCareers={selectedCareers}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <EnhancedTaskCenter
            selectedSkill={selectedSkill}
            allSkills={allSkills}
            onTaskComplete={handleTaskComplete}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <CustomProjectSystem
            selectedSkill={selectedSkill}
            allSkills={allSkills}
            onProjectComplete={handleProjectComplete}
          />
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <EquipmentSystem
            equipment={equipment}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IntegratedSkillSystem;