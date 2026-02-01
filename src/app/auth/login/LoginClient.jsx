'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/atoms/Input/Input';
import Label from '@/components/atoms/Label/Label';
import { http } from '@/lib/http/client';
import styles from './page.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const EMAIL_MIN_LENGTH = 8;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 30;

function validateEmail(value) {
  if (!value.trim()) return '이메일을 입력해 주세요.';
  if (!value.includes('@')) return '이메일 주소 형식이 올바르지 않습니다.';
  if (value.length < EMAIL_MIN_LENGTH) return '이메일은 8자 이상이어야 합니다.';
  return null;
}

function validatePassword(value) {
  if (!value) return '비밀번호를 입력해 주세요.';
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return '비밀번호는 8자 이상 30자 이하여야 합니다.';
  }
  return null;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) setPasswordError(decodeURIComponent(error));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr || '');
    setPasswordError(pErr || '');
    if (eErr || pErr) return;

    setLoading(true);
    try {
      await http.post('/users/login', { email, password });
      router.push('/');
    } catch (err) {
      const message = err.response?.data?.message ?? '로그인에 실패했습니다.';
      setPasswordError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!API_BASE_URL) return;
    window.location.href = `${API_BASE_URL}/users/auth/google`;
  };

  return (
    <div className="min-h-full w-full bg-black flex flex-col items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className={styles.logo}>
          최애<span className={styles.logoAccent}>의</span>포토
        </h1>

        <div className="w-full">
          <Label htmlFor="login-email" className={styles.label}>
            이메일
          </Label>
          <Input
            id="login-email"
            type="email"
            placeholder="이메일을 입력해 주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${styles.inputField} ${styles.inputFieldNoIcon} ${emailError ? styles.inputError : ''}`}
          />
          {emailError && <p className={styles.errorMessage}>{emailError}</p>}
        </div>

        <div className="w-full">
          <Label htmlFor="login-password" className={styles.label}>
            비밀번호
          </Label>
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${styles.inputField} ${passwordError ? styles.inputError : ''}`}
          />
          {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
        </div>

        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <button type="button" className={styles.googleLoginButton} onClick={handleGoogleLogin}>
          구글 로그인
        </button>
      </form>
    </div>
  );
}
