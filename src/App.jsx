// Đường dẫn: src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ChatLayout from './components/Chat/ChatLayout';
import FriendsPage from './components/Friends/FriendsPage';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { setupAutoRefresh } from './utils/apiInterceptor';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  useEffect(() => { setupAutoRefresh(); }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ProtectedRoute><MainLayout><ChatLayout /></MainLayout></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><MainLayout><FriendsPage /></MainLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;