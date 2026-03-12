import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Sword,
  Shield,
  Sparkles,
  Star,
  Award,
  TrendingUp,
  Zap,
  Code,
  Database,
  Server,
  Cloud,
  Palette,
  Brain,
  ChevronRight,
  PackageOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  description: string;
  stats: {
    frontend?: number;
    backend?: number;
    design?: number;
    database?: number;
    devops?: number;
    ai?: number;
  };
  sourceProject: {
    title: string;
    aiScore: number;
    difficulty: string;
  };
  icon: React.ReactNode;
  equippedSlot: 'weapon' | 'helmet' | 'chest' | 'accessory1' | 'accessory2' | null;
}

interface EquipmentSystemProps {
  equipment: Equipment[];
  onEquip: (equipmentId: string, slot: Equipment['equippedSlot']) => void;
  onUnequip: (equipmentId: string) => void;
}

export function EquipmentSystem({ equipment, onEquip, onUnequip }: EquipmentSystemProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [filterRarity, setFilterRarity] = useState<'all' | Equipment['rarity']>('all');

  const equippedItems = equipment.filter(e => e.equippedSlot !== null);
  const unequippedItems = equipment.filter(e => e.equippedSlot === null);

  const getRarityColor = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'common': return { bg: 'from-gray-500 to-gray-600', border: 'border-gray-500', text: 'text-gray-300' };
      case 'uncommon': return { bg: 'from-green-500 to-green-600', border: 'border-green-500', text: 'text-green-400' };
      case 'rare': return { bg: 'from-blue-500 to-blue-600', border: 'border-blue-500', text: 'text-blue-400' };
      case 'epic': return { bg: 'from-purple-500 to-purple-600', border: 'border-purple-500', text: 'text-purple-400' };
      case 'legendary': return { bg: 'from-orange-500 to-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' };
    }
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

  const getTypeIcon = (type: Equipment['type']) => {
    switch (type) {
      case 'weapon': return <Sword className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'accessory': return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeText = (type: Equipment['type']) => {
    switch (type) {
      case 'weapon': return '武器';
      case 'armor': return '防具';
      case 'accessory': return '饰品';
    }
  };

  const getSlotText = (slot: Equipment['equippedSlot']) => {
    switch (slot) {
      case 'weapon': return '主手武器';
      case 'helmet': return '头盔';
      case 'chest': return '胸甲';
      case 'accessory1': return '饰品1';
      case 'accessory2': return '饰品2';
      default: return '未装备';
    }
  };

  const getTotalStats = () => {
    const total = {
      frontend: 0,
      backend: 0,
      design: 0,
      database: 0,
      devops: 0,
      ai: 0,
    };

    equippedItems.forEach(item => {
      Object.entries(item.stats).forEach(([key, value]) => {
        if (value && key in total) {
          total[key as keyof typeof total] += value;
        }
      });
    });

    return total;
  };

  const handleEquip = (item: Equipment) => {
    let slot: Equipment['equippedSlot'] = null;

    if (item.type === 'weapon') {
      slot = 'weapon';
    } else if (item.type === 'armor') {
      // Check if helmet is free, otherwise chest
      const hasHelmet = equippedItems.some(e => e.equippedSlot === 'helmet');
      slot = hasHelmet ? 'chest' : 'helmet';
    } else if (item.type === 'accessory') {
      // Check accessory slots
      const hasAccessory1 = equippedItems.some(e => e.equippedSlot === 'accessory1');
      slot = hasAccessory1 ? 'accessory2' : 'accessory1';
    }

    // Check if slot is already occupied
    const occupiedItem = equippedItems.find(e => e.equippedSlot === slot);
    if (occupiedItem) {
      onUnequip(occupiedItem.id);
    }

    onEquip(item.id, slot);
    toast.success(`装备 ${item.name} 到 ${getSlotText(slot)}`, { icon: '⚔️' });
  };

  const handleUnequip = (item: Equipment) => {
    onUnequip(item.id);
    toast.success(`卸下 ${item.name}`, { icon: '📦' });
  };

  const filteredEquipment = filterRarity === 'all' 
    ? equipment 
    : equipment.filter(e => e.rarity === filterRarity);

  const totalStats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">装备库</h2>
                <p className="text-gray-300 mb-4">
                  完成的项目将转化为强大的装备，提升你的技能属性
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">
                    总装备: <span className="text-yellow-400 font-bold">{equipment.length}</span>
                  </span>
                  <span className="text-gray-400">
                    已装备: <span className="text-green-400 font-bold">{equippedItems.length}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Total Stats Display */}
            <div className="bg-black/30 rounded-lg p-4 min-w-[300px]">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                装备加成
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(totalStats).map(([key, value]) => {
                  if (value === 0) return null;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{key}:</span>
                      <span className="text-green-400 font-bold">+{value}</span>
                    </div>
                  );
                })}
                {Object.values(totalStats).every(v => v === 0) && (
                  <p className="text-gray-500 col-span-2 text-center">暂无装备加成</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rarity Filter */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">稀有度筛选:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterRarity === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterRarity('all')}
            className={filterRarity === 'all' ? 'bg-purple-600' : ''}
          >
            全部
          </Button>
          {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map(rarity => (
            <Button
              key={rarity}
              size="sm"
              variant={filterRarity === rarity ? 'default' : 'outline'}
              onClick={() => setFilterRarity(rarity)}
              className={filterRarity === rarity ? `bg-gradient-to-r ${getRarityColor(rarity).bg}` : getRarityColor(rarity).text}
            >
              {getRarityText(rarity)}
            </Button>
          ))}
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item, index) => {
            const colors = getRarityColor(item.rarity);
            const isEquipped = item.equippedSlot !== null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`bg-slate-800/50 border-2 ${colors.border} hover:shadow-lg hover:shadow-${item.rarity === 'legendary' ? 'yellow' : item.rarity === 'epic' ? 'purple' : 'blue'}-500/20 transition-all cursor-pointer ${
                    isEquipped ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setSelectedEquipment(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-3 bg-gradient-to-br ${colors.bg} rounded-xl text-white`}>
                        {item.icon}
                      </div>
                      <div className="text-right">
                        <Badge className={`${colors.bg} text-white border-0 mb-1`}>
                          {getRarityText(item.rarity)}
                        </Badge>
                        <p className="text-gray-400 text-xs">{getTypeText(item.type)}</p>
                      </div>
                    </div>
                    <CardTitle className={`${colors.text} text-lg`}>{item.name}</CardTitle>
                    {isEquipped && (
                      <Badge className="bg-green-600 text-white w-fit">
                        已装备 - {getSlotText(item.equippedSlot)}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-400 text-sm mb-3">{item.description}</p>

                    {/* Stats */}
                    <div className="bg-black/30 rounded-lg p-3 mb-3">
                      <h4 className="text-white text-xs font-semibold mb-2">属性加成</h4>
                      <div className="space-y-1">
                        {Object.entries(item.stats).map(([key, value]) => {
                          if (!value) return null;
                          return (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 capitalize">{key}</span>
                              <span className="text-green-400 font-bold">+{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Source Project */}
                    <div className="text-xs text-gray-500 mb-3">
                      <p>来源: {item.sourceProject.title}</p>
                      <p>评分: {item.sourceProject.aiScore}/100</p>
                    </div>

                    {/* Action Button */}
                    {isEquipped ? (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequip(item);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        卸下装备
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(item);
                        }}
                        className={`w-full bg-gradient-to-r ${colors.bg}`}
                      >
                        <Sword className="w-3 h-3 mr-2" />
                        装备
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <PackageOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {filterRarity === 'all' ? '装备库空空如也' : `暂无${getRarityText(filterRarity)}装备`}
            </p>
            <p className="text-gray-500 text-sm">
              完成项目后将获得装备奖励
            </p>
          </CardContent>
        </Card>
      )}

      {/* Equipment Detail Modal */}
      <AnimatePresence>
        {selectedEquipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEquipment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <Card className={`bg-slate-800 border-2 ${getRarityColor(selectedEquipment.rarity).border}`}>
                <CardHeader>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-4 bg-gradient-to-br ${getRarityColor(selectedEquipment.rarity).bg} rounded-xl text-white`}>
                      {selectedEquipment.icon}
                    </div>
                    <div className="flex-1">
                      <Badge className={`${getRarityColor(selectedEquipment.rarity).bg} text-white border-0 mb-2`}>
                        {getRarityText(selectedEquipment.rarity)} {getTypeText(selectedEquipment.type)}
                      </Badge>
                      <CardTitle className={`${getRarityColor(selectedEquipment.rarity).text} text-2xl`}>
                        {selectedEquipment.name}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-300">{selectedEquipment.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Detailed Stats */}
                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      装备属性
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEquipment.stats).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-400 capitalize">{key}</span>
                              <span className="text-green-400 font-bold">+{value}</span>
                            </div>
                            <Progress value={value * 10} className="h-1" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Source Info */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-purple-400 font-semibold mb-2">项目信息</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-500">项目名称:</span> {selectedEquipment.sourceProject.title}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">AI评分:</span> {selectedEquipment.sourceProject.aiScore}/100
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">难度:</span> {selectedEquipment.sourceProject.difficulty}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {selectedEquipment.equippedSlot ? (
                      <Button
                        onClick={() => {
                          handleUnequip(selectedEquipment);
                          setSelectedEquipment(null);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        卸下装备
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handleEquip(selectedEquipment);
                          setSelectedEquipment(null);
                        }}
                        className={`flex-1 bg-gradient-to-r ${getRarityColor(selectedEquipment.rarity).bg}`}
                      >
                        <Sword className="w-4 h-4 mr-2" />
                        装备
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedEquipment(null)}
                      variant="outline"
                      className="border-gray-500 text-gray-400"
                    >
                      关闭
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
