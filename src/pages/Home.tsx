// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home">
      <h1>欢迎来到味享厨 CookShare</h1>
      {!currentUser ? (
        <p>请先 <Link to="/login">登录</Link> 以发布和管理你的菜谱。</p>
      ) : (
        <div className="buttons">
          <Link to="/my-circle" className="btn">我的厨友圈</Link>
          <Link to="/community" className="btn">厨友社区</Link>
          <Link to="/publish" className="btn">发布菜谱</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
