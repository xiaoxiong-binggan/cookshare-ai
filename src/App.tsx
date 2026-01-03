import React, { useState, useEffect, useRef } from 'react';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  description: string;
  image: string | null;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  cookingVideo: string | null; // ✅ 新增：用户上传的做饭视频
  style: string;
  duration: string;
  views: number;
  createdAt: string;
  steps: Step[];
  likes: number;
  favorites: number;
  comments: Comment[];
  ingredients: Ingredient[]; // ✅ 新增：食材信息
  likedBy: string[]; // 记录点赞用户ID
  favoritedBy: string[]; // 记录收藏用户ID
}

interface Comment {
  id: string;
  user: string;
  content: string;
  time: string;
}

interface UserStats {
  followers: number;
  following: number;
  likes: number;
  favorites: number;
  recipes: Recipe[];
}

const App = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [cookingVideo, setCookingVideo] = useState<string | null>(null); // ✅ 新增状态
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '', unit: 'g' }]);
  const [steps, setSteps] = useState<Step[]>([{ description: '', image: null }]);
  const [isPublished, setIsPublished] = useState(false);
  // 删除 generating 和 videoGenerated 状态
  const [sharedRecipes, setSharedRecipes] = useState<Recipe[]>([]);
  const [viewCommunity, setViewCommunity] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentTab, setCurrentTab] = useState<'my' | 'community'>('my');
  const [userStats, setUserStats] = useState<UserStats>({
    followers: 0,
    following: 0,
    likes: 0,
    favorites: 0,
    recipes: []
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // 轮播图相关
  const [currentSlide, setCurrentSlide] = useState(0);

  // AI 视频播放逻辑（现在已移除，保留是为了兼容）
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [userFavorited, setUserFavorited] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null); // 修复：NodeJS.Timeout -> number

  // 用户ID（模拟登录状态）
  const userId = "current_user"; // 模拟当前用户ID

  // 加载本地数据
  useEffect(() => {
    const saved = localStorage.getItem('sharedRecipes');
    if (saved) {
      try {
        const recipes: Recipe[] = JSON.parse(saved);
        setSharedRecipes(recipes);
        setUserStats({
          followers: 5,
          following: 3,
          likes: 12,
          favorites: 8,
          recipes: recipes
        });
      } catch (e) {
        console.error('Failed to parse shared recipes', e);
      }
    }
  }, []);

  // 每次切换到详情页时，检查当前用户是否已点赞/收藏
  useEffect(() => {
    if (selectedRecipe) {
      const liked = selectedRecipe.likedBy.includes(userId);
      const favorited = selectedRecipe.favoritedBy.includes(userId);
      setUserLiked(liked);
      setUserFavorited(favorited);
    } else {
      setUserLiked(false);
      setUserFavorited(false);
    }
  }, [selectedRecipe, userId]);

  // 每次切换到详情页时，从 localStorage 重新加载数据（防止丢失评论）
  useEffect(() => {
    if (selectedRecipe && !isPublishing) {
      const saved = localStorage.getItem('sharedRecipes');
      if (saved) {
        const allRecipes: Recipe[] = JSON.parse(saved);
        const updatedRecipe = allRecipes.find((r: Recipe) => r.id === selectedRecipe.id);
        if (updatedRecipe) {
          setSelectedRecipe(updatedRecipe);
        }
      }
    }
  }, [selectedRecipe, isPublishing]);

  // 保存到 localStorage
  const saveToStorage = (recipes: Recipe[]) => {
    localStorage.setItem('sharedRecipes', JSON.stringify(recipes));
    setSharedRecipes(recipes);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ 新增：处理做饭视频上传
  const handleCookingVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        alert('请上传视频文件（如 MP4）');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCookingVideo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: 'g' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { description: '', image: null }]);
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleStepImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSteps = [...steps];
        newSteps[index].image = event.target?.result as string;
        setSteps(newSteps);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !description.trim()) {
      alert('请填写菜谱标题和描述');
      return;
    }
    setIsPublished(true);
    // 不再设置 videoGenerated，直接发布
  };

  // 删除 generateVideo 函数

  const shareToCommunity = () => {
    const recipe: Recipe = {
      id: Date.now().toString(),
      title,
      description,
      coverImage: coverImage || '',
      cookingVideo: cookingVideo, // ✅ 保存用户上传的视频
      style: '动漫风',
      duration: '1分23秒',
      views: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
      steps: [...steps],
      likes: 0,
      favorites: 0,
      comments: [],
      ingredients: [...ingredients], // ✅ 添加食材
      likedBy: [], // 初始化点赞用户列表
      favoritedBy: [] // 初始化收藏用户列表
    };

    const current = [...sharedRecipes, recipe];
    saveToStorage(current);

    setUserStats(prev => ({
      ...prev,
      recipes: [...prev.recipes, recipe],
      // 删除点赞收藏统计增加
    }));

    alert('🎉 已成功分享到厨友圈！');
    backToMain(); // 重置所有状态
  };

  const backToMain = () => {
    setIsPublishing(false);
    setViewCommunity(false);
    setSelectedRecipe(null);
    setIsPublished(false);
    setTitle('');
    setDescription('');
    setCoverImage(null);
    setCookingVideo(null); // ✅ 清空视频
    setIngredients([{ name: '', amount: '', unit: 'g' }]);
    setSteps([{ description: '', image: null }]);
  };

  const viewRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    speechSynthesis.cancel();
  };

  const likeRecipe = (id: string) => {
    // 检查是否已经点赞
    if (userLiked) {
      alert('您已经点过赞了！');
      return;
    }

    // 更新全局列表
    const updated = sharedRecipes.map((r: Recipe) => {
      if (r.id === id) {
        const alreadyLiked = r.likedBy.includes(userId);
        if (!alreadyLiked) {
          return { 
            ...r, 
            likes: r.likes + 1,
            likedBy: [...r.likedBy, userId] // 添加当前用户ID到点赞列表
          };
        }
      }
      return r;
    });
    saveToStorage(updated);
    
    // 同时更新当前选中的菜谱
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe({ 
        ...selectedRecipe, 
        likes: selectedRecipe.likes + 1,
        likedBy: [...selectedRecipe.likedBy, userId]
      });
      setUserLiked(true); // 更新本地状态
    }
  };

  const favoriteRecipe = (id: string) => {
    // 检查是否已经收藏
    if (userFavorited) {
      alert('您已经收藏过了！');
      return;
    }

    // 更新全局列表
    const updated = sharedRecipes.map((r: Recipe) => {
      if (r.id === id) {
        const alreadyFavorited = r.favoritedBy.includes(userId);
        if (!alreadyFavorited) {
          return { 
            ...r, 
            favorites: r.favorites + 1,
            favoritedBy: [...r.favoritedBy, userId] // 添加当前用户ID到收藏列表
          };
        }
      }
      return r;
    });
    saveToStorage(updated);
    
    // 同时更新当前选中的菜谱
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe({ 
        ...selectedRecipe, 
        favorites: selectedRecipe.favorites + 1,
        favoritedBy: [...selectedRecipe.favoritedBy, userId]
      });
      setUserFavorited(true); // 更新本地状态
    }
  };

  const addComment = (id: string, content: string) => {
    if (!content.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      user: '我',
      content,
      time: new Date().toLocaleTimeString('zh-CN')
    };
    const updated = sharedRecipes.map((r: Recipe) => {
      if (r.id === id) {
        return { ...r, comments: [...r.comments, comment] };
      }
      return r;
    });
    saveToStorage(updated);
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe({ ...selectedRecipe, comments: [...selectedRecipe.comments, comment] });
    }
  };

  // 开始自动播放（已移除，保留是为了兼容）
  const startAutoPlay = () => {
    if (!selectedRecipe) return;
    
    setIsPlaying(true);
    let currentIndex = 0;
    const totalSteps = selectedRecipe.steps.length;

    // 清除之前的定时器
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }

    // 创建新的定时器
    const interval = setInterval(() => {
      setCurrentStepIndex(currentIndex);
      
      // 播放当前步骤的语音
      const step = selectedRecipe.steps[currentIndex];
      const utterance = new SpeechSynthesisUtterance(step.description);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);

      currentIndex++;
      
      // 如果到达最后一个步骤，停止播放
      if (currentIndex >= totalSteps) {
        clearInterval(interval);
        setIsPlaying(false);
        setAutoPlayInterval(null);
      }
    }, 3000); // 每3秒切换到下一步

    setAutoPlayInterval(interval);
  };

  // 停止自动播放
  const stopAutoPlay = () => {
    setIsPlaying(false);
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
    speechSynthesis.cancel();
  };

  // 切换播放/停止
  const toggleAutoPlay = () => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  };

  const deleteRecipe = (id: string) => {
    if (window.confirm('确定要删除这个菜谱吗？')) {
      const updated = sharedRecipes.filter((r: Recipe) => r.id !== id);
      saveToStorage(updated);
      setUserStats(prev => ({
        ...prev,
        recipes: prev.recipes.filter((r: Recipe) => r.id !== id)
      }));
      if (selectedRecipe && selectedRecipe.id === id) {
        setSelectedRecipe(null);
      }
      alert('删除成功！');
    }
  };

  // 轮播图自动播放
  useEffect(() => {
    if (sharedRecipes.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sharedRecipes.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [sharedRecipes]);

  // 渲染轮播图（全屏填充）
  const renderCarousel = () => {
    if (sharedRecipes.length === 0) return null;
    return (
      <div style={{ 
        position: 'relative', 
        height: '300px', 
        width: '100%', 
        marginBottom: '1rem',
        overflow: 'hidden',
        borderRadius: '8px'
      }}>
        <div
          style={{
            display: 'flex',
            width: `${sharedRecipes.length * 100}%`,
            height: '100%',
            transform: `translateX(-${currentSlide * (100 / sharedRecipes.length)}%)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          {sharedRecipes.map((recipe, idx) => (
            <div
              key={recipe.id}
              style={{
                width: `${100 / sharedRecipes.length}%`,
                height: '100%',
                backgroundImage: `url(${recipe.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          {sharedRecipes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: idx === currentSlide ? '#fff' : '#ccc',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderHomeButtons = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
    }}>
      <button
        onClick={() => {
          setCurrentTab('my');
          setViewCommunity(true);
        }}
        style={{
          padding: '0.75rem',
          background: currentTab === 'my' ? '#3b82f6' : '#e2e8f0',
          color: currentTab === 'my' ? 'white' : '#334155',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        我的厨友圈
      </button>
      <button
        onClick={() => {
          setCurrentTab('community');
          setViewCommunity(true);
        }}
        style={{
          padding: '0.75rem',
          background: currentTab === 'community' ? '#3b82f6' : '#e2e8f0',
          color: currentTab === 'community' ? 'white' : '#334155',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        厨友社区
      </button>
      <button
        onClick={() => {
          setIsPublishing(true);
          setViewCommunity(false);
        }}
        style={{
          padding: '0.75rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        发布菜谱
      </button>
    </div>
  );

  const renderMyPage = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2>👤 我的主页</h2>
        <p>欢迎回来！这里是你的个人空间</p>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#3b82f6' }}>{userStats.followers}</div>
          <div>粉丝</div>
        </div>
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#3b82f6' }}>{userStats.following}</div>
          <div>关注</div>
        </div>
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#3b82f6' }}>{userStats.likes}</div>
          <div>点赞</div>
        </div>
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: '#3b82f6' }}>{userStats.favorites}</div>
          <div>收藏</div>
        </div>
      </div>

      <h3>✨ 我的作品</h3>
      {userStats.recipes.length === 0 ? (
        <p>暂无作品，快去发布吧！</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {userStats.recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => viewRecipeDetail(recipe)}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {recipe.coverImage && (
                <img
                  src={recipe.coverImage}
                  alt="封面"
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{recipe.title}</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {recipe.description.slice(0, 50)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>{recipe.style}</span>
                  <span>{recipe.duration}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRecipe(recipe.id);
                }}
                style={{
                  width: '100%',
                  padding: '0.3rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  marginTop: '0.5rem',
                }}
              >
                🗑 删除
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={backToMain}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#f1f5f9',
          color: '#334155',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          marginTop: '2rem'
        }}
      >
        ← 返回主页
      </button>
    </div>
  );

  const renderCommunityPage = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2>🌍 厨友社区</h2>
        <p>发现更多美味菜谱</p>
      </div>

      {sharedRecipes.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>暂无菜谱，快去发布吧！</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {sharedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => viewRecipeDetail(recipe)}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {recipe.coverImage && (
                <img
                  src={recipe.coverImage}
                  alt="封面"
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{recipe.title}</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {recipe.description.slice(0, 50)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>{recipe.style}</span>
                  <span>{recipe.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={backToMain}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#f1f5f9',
          color: '#334155',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          marginTop: '2rem'
        }}
      >
        ← 返回主页
      </button>
    </div>
  );

  const renderRecipeDetail = () => {
    if (!selectedRecipe) return null;

    return (
      <div className="app-container">
        <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1>{selectedRecipe.title}</h1>
          <button
            onClick={() => {
              setSelectedRecipe(null);
              setIsPlaying(false);
              speechSynthesis.cancel();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ← 返回列表
          </button>
        </header>

        {selectedRecipe.coverImage && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img
              src={selectedRecipe.coverImage}
              alt="封面"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
            />
          </div>
        )}

        {/* ✅ 显示用户上传的做饭视频 */}
        {selectedRecipe.cookingVideo && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <video
              src={selectedRecipe.cookingVideo}
              controls
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
            />
          </div>
        )}

        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedRecipe.description}</p>

        {/* 食材用料 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>🛒 食材用料</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {selectedRecipe.ingredients.map((ing, i) => (
              <div key={i} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                <strong>{ing.name}</strong>：{ing.amount} {ing.unit}
              </div>
            ))}
          </div>
        </div>

        {/* 烹饪步骤 */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>🔥 烹饪步骤</h3>
          {selectedRecipe.steps.map((step, i) => (
            <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <strong>第 {i + 1} 步：</strong>
              <p>{step.description}</p>
              {step.image && (
                <img
                  src={step.image}
                  alt={`步骤 ${i + 1}`}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px', marginTop: '0.5rem' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* AI 视频功能预告 */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>🎬 AI 教学视频（即将上线）</h3>
          <p style={{ color: '#166534', marginBottom: '0.5rem' }}>
            点击下方按钮，即可自动生成带语音讲解的动漫风教学视频！
          </p>
          <button
            onClick={() => alert('该功能即将上线！\n我们将接入阿里云官方 AI 视频生成模型，自动将菜谱转为高质量教学视频。')}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ▶ 生成 AI 教学视频（预览）
          </button>
          <p style={{ fontSize: '0.85rem', color: '#65a30d', marginTop: '0.5rem' }}>
            * 基于阿里云 AI 视频生成技术，支持自动配音、步骤动画、风格切换
          </p>
        </div>

        {/* 互动区 */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => likeRecipe(selectedRecipe!.id)}
            style={{
              padding: '0.5rem 1rem',
              background: userLiked ? '#f97316' : '#f8fafc',
              color: userLiked ? 'white' : '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ❤️ 点赞 ({selectedRecipe.likes})
          </button>
          <button
            onClick={() => favoriteRecipe(selectedRecipe!.id)}
            style={{
              padding: '0.5rem 1rem',
              background: userFavorited ? '#f59e0b' : '#f8fafc',
              color: userFavorited ? 'white' : '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⭐ 收藏 ({selectedRecipe.favorites})
          </button>
        </div>

        {/* 评论区 */}
        <div style={{ marginTop: '2rem' }}>
          <h3>💬 评论</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="写下你的评论..."
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addComment(selectedRecipe.id, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input?.value) addComment(selectedRecipe.id, input.value);
                if (input) input.value = '';
              }}
              style={{
                padding: '0.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              发送
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {selectedRecipe.comments.length === 0 ? (
              <p style={{ color: '#64748b' }}>暂无评论</p>
            ) : (
              selectedRecipe.comments.map(comment => (
                <div key={comment.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <strong>{comment.user}</strong> • {comment.time}
                  <p>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <footer style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
          <p>© 2026 味享厨 CookShare</p>
        </footer>
      </div>
    );
  };

  const renderHomePage = () => (
    <div>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>味享厨 CookShare</h1>
        <p>发布菜谱，一键生成 AI 教学视频</p>
      </header>
      {renderCarousel()}
      {renderHomeButtons()}
      <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
        <p>© 2026 味享厨 CookShare · 阿里云天池大赛参赛作品</p>
        <p>GitHub: xiaoxiong-binggan / cookshare-ai</p>
      </footer>
    </div>
  );

  return (
    <div className="app-container" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      {selectedRecipe ? (
        renderRecipeDetail()
      ) : isPublishing ? (
        <>
          {!isPublished ? (
            <form>
              <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1>味享厨 CookShare</h1>
                <p>发布菜谱，一键生成 AI 教学视频</p>
              </header>
              <div className="form-group">
                <label>菜谱标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：番茄炒蛋"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group">
                <label>菜谱描述 *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简单介绍这道菜的特点、口味等"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group">
                <label>封面图片</label>
                <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'block', marginBottom: '0.5rem' }} />
                {coverImage && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={coverImage}
                      alt="封面预览"
                      style={{ maxWidth: '200px', borderRadius: '4px', maxHeight: '150px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              {/* ✅ 新增：做饭视频上传 */}
              <div className="form-group">
                <label>做饭过程视频（可选）</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleCookingVideoChange} 
                  style={{ display: 'block', marginBottom: '0.5rem' }} 
                />
                {cookingVideo && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <video
                      src={cookingVideo}
                      controls
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>食材用料</label>
                <div className="ingredients-list">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="ingredient-item" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="食材名"
                        value={ing.name}
                        onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                        style={{ flex: 2, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="数量"
                        value={ing.amount}
                        onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      >
                        <option value="g">克</option>
                        <option value="kg">千克</option>
                        <option value="ml">毫升</option>
                        <option value="L">升</option>
                        <option value="个">个</option>
                        <option value="勺">勺</option>
                        <option value="适量">适量</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button type="button" className="add-btn" onClick={addIngredient} style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  + 添加食材
                </button>
              </div>

              <div className="form-group">
                <label>烹饪步骤</label>
                <div className="steps-list">
                  {steps.map((step, i) => (
                    <div key={i} className="step-item" style={{ marginBottom: '1rem' }}>
                      <textarea
                        rows={2}
                        placeholder={`第 ${i + 1} 步`}
                        value={step.description}
                        onChange={(e) => updateStep(i, 'description', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '0.5rem' }}
                      />
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStepImageChange(i, e)}
                          style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}
                        />
                        {step.image && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <img
                              src={step.image}
                              alt={`步骤 ${i + 1} 预览`}
                              style={{
                                maxWidth: '120px',
                                maxHeight: '100px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="add-btn" onClick={addStep} style={{ padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  + 添加步骤
                </button>
              </div>

              <button
                type="button"
                onClick={handlePublish}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem' }}
              >
                📤 发布菜谱
              </button>

              <button
                type="button"
                onClick={backToMain}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '1rem'
                }}
              >
                ← 返回主页
              </button>
            </form>
          ) : (
            // ✅ 修改：发布后直接显示分享按钮，无需生成视频
            <div>
              <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1>味享厨 CookShare</h1>
                <p>发布菜谱，一键生成 AI 教学视频</p>
              </header>
              <h2>✅ 菜谱已发布！</h2>
              <p>你的菜谱已准备就绪，可以直接分享到社区。</p>

              {/* 提示：AI 视频功能即将上线 */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#fffbeb',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                color: '#92400e'
              }}>
                <strong>💡 提示：</strong>AI 自动教学视频生成功能正在开发中，后续将接入 <strong>阿里云官方 AI 视频生成模型</strong>，敬请期待！
              </div>

              <button
                onClick={shareToCommunity}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1.1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📤 立即分享到社区
              </button>

              <button
                type="button"
                onClick={backToMain}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '1rem'
                }}
              >
                ← 返回主页
              </button>
            </div>
          )}
        </>
      ) : viewCommunity ? (
        currentTab === 'my' ? renderMyPage() : renderCommunityPage()
      ) : (
        renderHomePage()
      )}
    </div>
  );
};

export default App;



