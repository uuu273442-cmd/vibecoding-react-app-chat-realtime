// Đường dẫn: src/components/Auth/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { loginUser } from '../../services/authService';
import { authStyles } from '../../styles/authStyles';

export default function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await loginUser(formData);
      
      // Lưu cả access token và refresh token (đã xử lý trong loginUser)
      setSuccessMessage('Đăng nhập thành công! 🎉');
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });

      // Chuyển hướng đến trang chat sau 1.5s
      setTimeout(() => {
        navigate('/chat');
      }, 1500);

    } catch (error) {
      if (error.statusCode === 401) {
        setError('Email hoặc mật khẩu không chính xác!');
      } else if (error.statusCode === 500) {
        setError('Lỗi server. Vui lòng thử lại sau!');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Không thể kết nối đến server. Vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.cardSmall}>
        {/* Logo/Header */}
        <div style={authStyles.header}>
          <div style={authStyles.logo}>
            <LogIn style={authStyles.logoIcon} />
          </div>
          <h1 style={authStyles.title}>Đăng nhập</h1>
          <p style={authStyles.subtitle}>Chào mừng bạn quay trở lại!</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={authStyles.successBox}>
            <CheckCircle style={authStyles.successIcon} />
            <p style={authStyles.successText}>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={authStyles.errorBoxFlex}>
            <AlertCircle style={authStyles.errorIcon} />
            <p style={authStyles.errorText}>{error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div style={authStyles.formContainer}>
          {/* Email */}
          <div style={authStyles.field}>
            <label style={authStyles.label}>Email</label>
            <div style={authStyles.inputWrapper}>
              <Mail style={authStyles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={authStyles.input}
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={authStyles.field}>
            <label style={authStyles.label}>Mật khẩu</label>
            <div style={authStyles.inputWrapper}>
              <Lock style={authStyles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={authStyles.input}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={authStyles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={authStyles.forgotPasswordContainer}>
            <a href="#" style={authStyles.forgotPasswordLink}>
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              ...authStyles.submitButton,
              ...(isLoading ? authStyles.submitButtonDisabled : {})
            }}
          >
            {isLoading ? (
              <span style={authStyles.loadingContainer}>
                <span style={authStyles.spinner}>⟳</span>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </div>

        {/* Register Link */}
        <div style={authStyles.footer}>
          <p style={authStyles.footerText}>
            Chưa có tài khoản?{' '}
            <a href="/register" style={authStyles.footerLink}>
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}