// src/pages/MyCircle.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Recipe } from '../types/recipe';
import RecipeCard from '../components/RecipeCard';
import { mockRecipes } from '../utils/mockData';

const MyCircle = () => {
  const { currentUser } = useAuth();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (currentUser) {
      // 过滤出当前用户的菜谱
      const filtered = mockRecipes.filter(r => r.userId === currentUser.id);
      setMyRecipes(filtered);
    }
  }, [currentUser]);

  const handleDelete = (id: string) => {
    if (confirm('确定删除这个作品？')) {
      // 从模拟数据中移除（实际项目应调用 API）
      setMyRecipes(myRecipes.filter(r => r.id !== id));
      alert('已删除（模拟）');
    }
  };

  if (!currentUser) {
    return <div className="empty">请先登录</div>;
  }

  return (
    <div className="my-circle">
      <h2>我的厨友圈</h2>
      {myRecipes.length === 0 ? (
        <p className="empty">你还没有发布任何菜谱，快去 <a href="/publish">发布</a> 吧！</p>
      ) : (
        <div className="recipes-grid">
          {myRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-with-delete">
              <RecipeCard recipe={recipe} />
              <button
                className="delete-btn"
                onClick={() => handleDelete(recipe.id)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCircle;
