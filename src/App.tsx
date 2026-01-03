import React, { useState } from 'react';

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  description: string;
}

const App = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '', unit: 'g' }]);
  const [steps, setSteps] = useState<Step[]>([{ description: '' }]);
  const [isPublished, setIsPublished] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState(false);

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
    setSteps([...steps, { description: '' }]);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const handlePublish = () => {
    if (!title.trim() || !description.trim()) {
      alert('请填写菜谱标题和描述');
      return;
    }
    setIsPublished(true);
  };

  const generateVideo = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setVideoGenerated(true);
    }, 2000);
  };

  return (
    <div className="app-container">
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
                <div key={i} className="step-item">
                  <textarea
                    rows={2}
                    placeholder={`第 ${i + 1} 步`}
                    value={step.description}
                    onChange={(e) => updateStep(i, e.target.value)}
                  />
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
                  onClick={() => alert('已分享到厨友圈！')}
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
    </div>
  );
};

export default App;
