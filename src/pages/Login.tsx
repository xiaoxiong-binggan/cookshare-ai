// src/pages/Login.tsx
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    login(userId);
    navigate('/my-circle');
  };

  return (
    <div className="login-page">
      <h2>选择账号登录</h2>
      <div className="user-list">
        {mockUsers.map(user => (
          <button
            key={user.id}
            className="btn"
            onClick={() => handleLogin(user.id)}
          >
            登录为：{user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Login;
