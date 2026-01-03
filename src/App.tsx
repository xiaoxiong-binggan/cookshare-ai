import React, { useState, useEffect } from 'react';

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
  style: string;
  duration: string;
  views: number;
  createdAt: string;
  steps: Step[];
  likes: number;
  favorites: number;
  comments: Comment[];
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '', unit: 'g' }]);
  const [steps, setSteps] = useState<Step[]>([{ description: '', image: null }]);
  const [isPublished, setIsPublished] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);
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

  // ===== 新增状态：用于模拟视频播放 =====
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 加载本地数据
  useEffect(() => {
    const saved = localStorage.getItem('sharedRecipes');
    if (saved) {
      try {
        const recipes = JSON.parse(saved);
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
    setVideoGenerated(false);
  };

  const generateVideo = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setVideoGenerated(true);
    }, 2000);
  };

  const shareToCommunity = () => {
    const recipe: Recipe = {
      id: Date.now().toString(),
      title,
      description,
      coverImage: coverImage || '',
      style: '动漫风',
      duration: '1分23秒',
      views: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
      steps: [...steps],
      likes: 0,
      favorites: 0,
      comments: []
    };

    const current = [...sharedRecipes, recipe];
    saveToStorage(current);

    setUserStats(prev => ({
      ...prev,
      recipes: [...prev.recipes, recipe],
      likes: prev.likes + 1,
      favorites: prev.favorites + 1
    }));

    alert('🎉 已成功分享到厨友圈！');
    setViewCommunity(true);
    setSelectedRecipe(null);
  };

  const backToMain = () => {
    setViewCommunity(false);
    setSelectedRecipe(null);
  };

  const viewRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    speechSynthesis.cancel(); // 停止可能正在播放的语音
  };

  const likeRecipe = (id: string) => {
    const updated = sharedRecipes.map(r => {
      if (r.id === id) {
        return { ...r, likes: r.likes + 1 };
      }
      return r;
    });
    saveToStorage(updated);
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe({ ...selectedRecipe, likes: selectedRecipe.likes + 1 });
    }
  };

  const favoriteRecipe = (id: string) => {
    const updated = sharedRecipes.map(r => {
      if (r.id === id) {
        return { ...r, favorites: r.favorites + 1 };
      }
      return r;
    });
    saveToStorage(updated);
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe({ ...selectedRecipe, favorites: selectedRecipe.favorites + 1 });
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
    const updated = sharedRecipes.map(r => {
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

  // ===== 新增：自动播放 AI 视频逻辑 =====
  const startAutoPlay = () => {
    if (!selectedRecipe) return;
    setIsPlaying(true);
    let index = 0;
    const total = selectedRecipe.steps.length;

    const playNextStep = () => {
      if (index >= total || !isPlaying) {
        setIsPlaying(false);
        return;
      }

      setCurrentStepIndex(index);

      // 朗读当前步骤
      const step = selectedRecipe.steps[index];
      const utterance = new SpeechSynthesisUtterance(`第${index + 1}步：${step.description}`);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.onend = () => {
        index++;
        if (index < total) {
          setTimeout(playNextStep, 1000); // 延迟1秒进入下一步
        } else {
          setIsPlaying(false);
        }
      };
      speechSynthesis.speak(utterance);
    };

    playNextStep();
  };

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

        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedRecipe.description}</p>

        {/* ===== 替换为 AI 视频模拟播放器 ===== */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#000',
          borderRadius: '8px',
          color: 'white',
          position: 'relative',
          minHeight: '250px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* 步骤内容展示 */}
          {selectedRecipe.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: idx === currentStepIndex ? 'block' : 'none',
                textAlign: 'center',
                width: '100%',
                maxWidth: '600px'
              }}
            >
              {step.image ? (
                <img
                  src={step.image}
                  alt={`步骤 ${idx + 1}`}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  📝 {step.description.slice(0, 30)}...
                </div>
              )}
              <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
                第 {idx + 1} 步：{step.description}
              </p>
            </div>
          ))}

          {/* 控制按钮 */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  speechSynthesis.cancel();
                } else {
                  startAutoPlay();
                }
              }}
              style={{
                padding: '0.4rem 0.8rem',
                background: isPlaying ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? '⏹ 停止' : '▶ 播放 AI 视频'}
            </button>
            <button
              onClick={() => {
                const text = `大家好，今天教大家做${selectedRecipe.title}。${selectedRecipe.description}。接下来是详细步骤：`;
                const stepTexts = selectedRecipe.steps.map((s, i) => `第${i + 1}步：${s.description}`).join('。');
                const fullText = text + stepTexts;
                const utterance = new SpeechSynthesisUtterance(fullText);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.9;
                speechSynthesis.speak(utterance);
              }}
              style={{
                padding: '0.4rem 0.8rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔊 试听讲解
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
            AI 动漫风 · {selectedRecipe.duration} · 自动配音
          </p>
        </div>

        {/* 互动区 */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => likeRecipe(selectedRecipe.id)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ❤️ 点赞 ({selectedRecipe.likes})
          </button>
          <button
            onClick={() => favoriteRecipe(selectedRecipe.id)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f8fafc',
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
                if (input.value) addComment(selectedRecipe.id, input.value);
                input.value = '';
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

  return (
    <div className="app-container">
      {!viewCommunity ? (
        <>
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1>味享厨 CookShare</h1>
            <p>发布菜谱，一键生成 AI 教学视频</p>
          </header>

          {!isPublished ? (
            <form>
              <div className="form-group">
                <label>菜谱标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：番茄炒蛋"
                />
              </div>

              <div className="form-group">
                <label>菜谱描述 *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简单介绍这道菜的特点、口味等"
                />
              </div>

              <div className="form-group">
                <label>封面图片</label>
                <input type="file" accept="image/*" onChange={handleCoverChange} />
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

              <div className="form-group">
                <label>食材用料</label>
                <div className="ingredients-list">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="ingredient-item">
                      <input
                        type="text"
                        placeholder="食材名"
                        value={ing.name}
                        onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                        style={{ width: '40%' }}
                      />
                      <input
                        type="text"
                        placeholder="数量"
                        value={ing.amount}
                        onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                        style={{ width: '30%' }}
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                        style={{ width: '30%' }}
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
                <button type="button" className="add-btn" onClick={addIngredient}>
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
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStepImageChange(i, e)}
                          style={{ fontSize: '0.9rem' }}
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
                <button type="button" className="add-btn" onClick={addStep}>
                  + 添加步骤
                </button>
              </div>

              <button
                type="button"
                onClick={handlePublish}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}
              >
                📤 发布菜谱
              </button>
            </form>
          ) : (
            <div>
              <h2>✅ 菜谱已发布！</h2>
              <p>现在可以生成你的专属 AI 教学视频了。</p>

              <button
                onClick={generateVideo}
                disabled={generating}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1.1rem',
                  opacity: generating ? 0.8 : 1,
                }}
              >
                {generating ? (
                  <>
                    <span className="loading"></span> 生成中...
                  </>
                ) : (
                  '✨ 一键生成 AI 教学视频'
                )}
              </button>

              {videoGenerated && (
                <div className="video-result">
                  <h3>🎉 视频已生成！</h3>
                  <p><strong>视频风格：</strong>动漫风</p>
                  <p><strong>时长：</strong>1分23秒</p>
                  <p><strong>播放次数：</strong>0</p>
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => alert('视频已下载到本地！')}
                      style={{ marginRight: '0.5rem' }}
                    >
                      📥 下载视频
                    </button>
                    <button
                      className="secondary"
                      onClick={shareToCommunity}
                    >
                      📤 分享到社区
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
            <p>© 2026 味享厨 CookShare · 阿里云天池大赛参赛作品</p>
            <p>GitHub: xiaoxiong-binggan / cookshare-ai</p>
          </footer>
        </>
      ) : selectedRecipe ? (
        renderRecipeDetail()
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setCurrentTab('my')}
              style={{
                padding: '0.5rem 1rem',
                background: currentTab === 'my' ? '#3b82f6' : '#f8fafc',
                color: currentTab === 'my' ? 'white' : '#334155',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              我的主页
            </button>
            <button
              onClick={() => setCurrentTab('community')}
              style={{
                padding: '0.5rem 1rem',
                background: currentTab === 'community' ? '#3b82f6' : '#f8fafc',
                color: currentTab === 'community' ? 'white' : '#334155',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              厨友社区
            </button>
          </div>

          {currentTab === 'my' ? renderMyPage() : renderCommunityPage()}
        </div>
      )}
    </div>
  );
};

export default App;
