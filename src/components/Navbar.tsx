// src/components/Navbar.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1>味享厨 CookShare</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser ? (
            <>
              <span>你好，{currentUser.name}</span>
              <button onClick={logout} className="btn btn-outline">退出</button>
            </>
          ) : (
            <Link to="/login" className="btn">登录</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
