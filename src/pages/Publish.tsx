// src/pages/Publish.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Publish = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className="empty">请先登录才能发布菜谱</div>;
  }

  return (
    <div className="publish-page">
      <h2>发布菜谱（模拟）</h2>
      <p>当前为演示版本，提交后不会真实保存。</p>
      <form>
        <input type="text" placeholder="菜谱标题 *" required />
        <textarea placeholder="描述 *" required></textarea>
        <button type="submit" className="btn">提交（模拟）</button>
      </form>

      {/* 右侧快捷导航 */}
      <div className="sidebar">
        <Link to="/my-circle" className="btn">我的厨友圈</Link>
        <Link to="/community" className="btn">厨友社区</Link>
      </div>
    </div>
  );
};

export default Publish;
