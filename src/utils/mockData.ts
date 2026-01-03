import { Recipe } from '../types/recipe';

// 模拟两个用户
export const mockUsers = [
  { id: 'user1', name: '小厨张' },
  { id: 'user2', name: '美食李' },
];

// 模拟菜谱（关联用户）
export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    userId: 'user1',
    title: '番茄炒蛋',
    description: '酸甜开胃，家常必备',
    imageUrl: 'https://via.placeholder.com/300x200?text=Tomato+Egg',
    videoUrl: '#',
  },
  {
    id: 'r2',
    userId: 'user1',
    title: '红烧排骨',
    description: '色泽红亮，软烂入味',
    imageUrl: 'https://via.placeholder.com/300x200?text=Braised+Ribs',
    videoUrl: '#',
  },
  {
    id: 'r3',
    userId: 'user2',
    title: '凉拌黄瓜',
    description: '清爽解腻',
    imageUrl: 'https://via.placeholder.com/300x200?text=Cucumber',
    videoUrl: '#',
  },
];
