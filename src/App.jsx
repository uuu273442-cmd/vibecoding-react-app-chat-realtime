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

function App() {
  useEffect(() => {
    // Setup automatic token refresh
    setupAutoRefresh();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route mặc định redirect về login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes với MainLayout (sidebar) */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChatLayout />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/friends" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <FriendsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* 404 - Not found */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;