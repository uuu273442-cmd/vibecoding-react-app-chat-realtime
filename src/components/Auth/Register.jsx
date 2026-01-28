// Đường dẫn: src/components/Auth/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { registerUser } from '../../services/authService';
import { authStyles } from '../../styles/authStyles';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      const data = await registerUser(formData);
      setSuccessMessage(`Đăng ký thành công! Chào mừng ${data.name} 🎉`);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        password: '',
        passwordConfirm: ''
      });
      
      // Chuyển sang trang login sau 2s
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      if (error.message) {
        if (Array.isArray(error.message)) {
          setErrors(error.message);
        } else {
          setErrors([error.message]);
        }
      } else {
        setErrors(['Không thể kết nối đến server. Vui lòng thử lại!']);
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
      <div style={authStyles.card}>
        {/* Logo/Header */}
        <div style={authStyles.header}>
          <div style={authStyles.logo}>
            <svg style={authStyles.logoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 style={authStyles.title}>Tạo tài khoản</h1>
          <p style={authStyles.subtitle}>Bắt đầu trò chuyện cùng bạn bè!</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={authStyles.successBox}>
            <CheckCircle style={authStyles.successIcon} />
            <p style={authStyles.successText}>{successMessage}</p>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div style={authStyles.errorBox}>
            <div style={authStyles.errorContent}>
              <AlertCircle style={authStyles.errorIcon} />
              <div>
                <p style={authStyles.errorTitle}>Vui lòng kiểm tra lại:</p>
                <ul style={authStyles.errorList}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div style={authStyles.formContainer}>
          {/* Name Fields */}
          <div style={authStyles.nameRow}>
            <div style={authStyles.fieldHalf}>
              <label style={authStyles.label}>Họ</label>
              <div style={authStyles.inputWrapper}>
                <User style={authStyles.inputIcon} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  style={authStyles.input}
                  placeholder="Nguyễn"
                />
              </div>
            </div>
            <div style={authStyles.fieldHalf}>
              <label style={authStyles.label}>Tên</label>
              <div style={authStyles.inputWrapper}>
                <User style={authStyles.inputIcon} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  style={authStyles.input}
                  placeholder="Văn A"
                />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div style={authStyles.field}>
            <label style={authStyles.label}>Số điện thoại</label>
            <div style={authStyles.inputWrapper}>
              <Phone style={authStyles.inputIcon} />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={authStyles.input}
                placeholder="0912345678"
              />
            </div>
          </div>

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

          {/* Confirm Password */}
          <div style={authStyles.field}>
            <label style={authStyles.label}>Xác nhận mật khẩu</label>
            <div style={authStyles.inputWrapper}>
              <Lock style={authStyles.inputIcon} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={authStyles.input}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={authStyles.eyeButton}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
                Đang xử lý...
              </span>
            ) : (
              'Đăng ký'
            )}
          </button>
        </div>

        {/* Login Link */}
        <div style={authStyles.footer}>
          <p style={authStyles.footerText}>
            Đã có tài khoản?{' '}
            <a href="/login" style={authStyles.footerLink}>
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}