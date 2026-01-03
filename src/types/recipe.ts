export interface Recipe {
  id: string;
  userId: string; // 关联用户
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
}
