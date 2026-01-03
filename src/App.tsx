// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyCircle from './pages/MyCircle';
import Community from './pages/Community';
import Publish from './pages/Publish';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-circle" element={<MyCircle />} />
          <Route path="/community" element={<Community />} />
          <Route path="/publish" element={<Publish />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
