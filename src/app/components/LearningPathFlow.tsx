import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, ArrowDown, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

interface PathNode {
  id: string;
  title: string;
  subtitle?: string;
  status: 'completed' | 'current' | 'locked';
  position: { x: number; y: number };
  connections: string[];
}

interface LearningPathFlowProps {
  currentGoal: string;
}

export function LearningPathFlow({ currentGoal }: LearningPathFlowProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [likedNodes, setLikedNodes] = useState<Set<string>>(new Set(['ai-recommend']));

  const nodes: PathNode[] = [
    {
      id: 'breakdown',
      title: '细分步骤',
      subtitle: 'Brando Dio',
      status: 'completed',
      position: { x: 0, y: 0 },
      connections: ['task-recommend'],
    },
    {
      id: 'task-recommend',
      title: '根据发展方向推荐任务项目去做',
      subtitle: 'Brando Dio',
      status: 'completed',
      position: { x: 1, y: 0 },
      connections: ['ai-skills'],
    },
    {
      id: 'ai-skills',
      title: 'AI个人技能发展过道 / 游戏技能点 / AI随身个人发展方向',
      subtitle: 'Brando Dio',
      status: 'current',
      position: { x: 2, y: 0 },
      connections: ['learning-app'],
    },
    {
      id: 'career-goal',
      title: '上传职业网站/ 或者个人目标作为发展方向',
      subtitle: 'Brando Dio',
      status: 'completed',
      position: { x: 1, y: 1 },
      connections: ['task-recommend', 'learning-app'],
    },
    {
      id: 'learning-app',
      title: '学习应用 / 类似duolinguo?',
      subtitle: 'Brando Dio',
      status: 'current',
      position: { x: 2, y: 1 },
      connections: ['ai-recommend', 'visualization'],
    },
    {
      id: 'visualization',
      title: '可视化',
      subtitle: 'Brando Dio',
      status: 'locked',
      position: { x: 3, y: 1 },
      connections: [],
    },
    {
      id: 'ai-recommend',
      title: 'AI推荐发展方向 / 技能点',
      subtitle: 'Brando Dio',
      status: 'current',
      position: { x: 2, y: 2 },
      connections: [],
    },
  ];

  const toggleLike = (nodeId: string) => {
    setLikedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'current':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'locked':
        return 'bg-gray-100 border-gray-300 text-gray-600';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-200 to-green-300';
      case 'current':
        return 'from-pink-200 to-pink-300';
      case 'locked':
        return 'from-gray-200 to-gray-300';
      default:
        return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[900px] h-[600px] relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-8">
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
            </marker>
          </defs>
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const target = nodes.find((n) => n.id === targetId);
              if (!target) return null;

              const startX = (node.position.x + 0.5) * 240 + 80;
              const startY = (node.position.y + 0.5) * 180 + 80;
              const endX = (target.position.x + 0.5) * 240 + 80;
              const endY = (target.position.y + 0.5) * 180 + 80;

              // Create curved path
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;
              const curve = node.position.y === target.position.y ? 0 : 30;

              return (
                <path
                  key={`${node.id}-${targetId}`}
                  d={`M ${startX} ${startY} Q ${midX} ${midY + curve}, ${endX} ${endY}`}
                  stroke="#64748b"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  strokeDasharray="5,5"
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute"
            style={{
              left: `${node.position.x * 240 + 40}px`,
              top: `${node.position.y * 180 + 40}px`,
              zIndex: 2,
            }}
          >
            <Card
              className={`w-48 cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br ${getNodeColor(
                node.status
              )} border-2 ${
                selectedNode === node.id ? 'ring-4 ring-indigo-400' : ''
              }`}
              onClick={() => setSelectedNode(node.id)}
            >
              <CardContent className="p-4 relative">
                <div className="mb-2">
                  <Badge variant="secondary" className={getStatusColor(node.status)}>
                    {node.status === 'completed' && '✓ 已完成'}
                    {node.status === 'current' && '进行中'}
                    {node.status === 'locked' && '🔒 未解锁'}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-tight">
                  {node.title}
                </h3>
                <p className="text-xs text-gray-600">{node.subtitle}</p>
                
                {likedNodes.has(node.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2"
                  >
                    <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-green-200 to-green-300 rounded border-2 border-green-300" />
          <span className="text-sm text-gray-700">已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-pink-200 to-pink-300 rounded border-2 border-blue-300" />
          <span className="text-sm text-gray-700">进行中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded border-2 border-gray-300" />
          <span className="text-sm text-gray-700">未解锁</span>
        </div>
      </div>
    </div>
  );
}
