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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null); // 新增：选中的菜谱

  // 加载已分享的菜谱
  useEffect(() => {
    const saved = localStorage.getItem('sharedRecipes');
    if (saved) {
      try {
        setSharedRecipes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse shared recipes', e);
        localStorage.removeItem('sharedRecipes');
      }
    }
  }, []);

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
      steps: [...steps], // 包含步骤图片
    };

    const current = JSON.parse(localStorage.getItem('sharedRecipes') || '[]');
    const updated = [...current, recipe];
    localStorage.setItem('sharedRecipes', JSON.stringify(updated));

    setSharedRecipes(updated);
    alert('🎉 已成功分享到厨友圈！');
    setViewCommunity(true);
    setSelectedRecipe(null); // 返回列表
  };

  const backToMain = () => {
    setViewCommunity(false);
    setSelectedRecipe(null);
  };

  const viewRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
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
        /* 菜谱详情页 */
        <div className="app-container">
          <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1>{selectedRecipe.title}</h1>
            <button
              onClick={() => setSelectedRecipe(null)}
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
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
              />
            </div>
          )}

          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedRecipe.description}</p>

          <h3>📝 烹饪步骤</h3>
          {selectedRecipe.steps.length === 0 ? (
            <p>暂无步骤</p>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {selectedRecipe.steps.map((step, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <p>
                    <strong>第 {i + 1} 步：</strong> {step.description || '（无描述）'}
                  </p>
                  {step.image && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                      <img
                        src={step.image}
                        alt={`步骤 ${i + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <footer style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
            <p>© 2026 味享厨 CookShare</p>
          </footer>
        </div>
      ) : (
        /* 社区列表页 */
        <div className="app-container">
          <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1>✨ 我的厨友圈</h1>
            <p>点击菜谱查看详情</p>
          </header>

          {sharedRecipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>暂无分享内容</p>
              <p>快去生成视频并分享吧！</p>
            </div>
          ) : (
            <div>
              {sharedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => viewRecipeDetail(recipe)}
                  style={{
                    marginBottom: '1.2rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <span>🎨 {recipe.style}</span>
                    <span>⏱️ {recipe.duration}</span>
                    <span>👁️ {recipe.views} 次播放</span>
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
            }}
          >
            ← 返回主页
          </button>

          <footer style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
            <p>© 2026 味享厨 CookShare · 天池大赛作品</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
