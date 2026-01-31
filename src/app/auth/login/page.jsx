'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import styles from './page.module.css';
import { InputEmail } from '@/components/molecules/InputEmail';
import { InputPassword } from '@/components/molecules/InputPassword';
import ButtonPrimary from '@/components/atoms/Button/ButtonPrimary';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [emailValid, setEmailValid] = useState(true);

  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(null);

  const canSubmit =
    Boolean(email.trim()) && Boolean(password.trim()) && emailValid && !emailError && !pwError;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) setEmailError('이메일을 입력해 주세요.');
    if (!password.trim()) setPwError('비밀번호를 입력해 주세요.');
    if (!canSubmit) return;

    // TODO: swagger 오면 여기서 로그인 API 연결
    console.log('login submit:', { email, password });
  };

  return (
    <main className={styles.page}>
      <div className={styles.vignette} />

      <section className={styles.center}>
        <div className={styles.box}>
          {/* ✅ 로고 SVG 사용 */}
          <div className={styles.logoWrap}>
            <Image src="/assets/logos/logo.svg" alt="최애의포토" width={260} height={60} priority />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <InputEmail
              id="login-email"
              label="이메일"
              placeholder="이메일을 입력해 주세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={() => {}}
              onValidityChange={(v) => setEmailValid(v)}
              onError={(msg) => setEmailError(msg)}
              error={emailError}
            />

            <InputPassword
              id="login-password"
              label="비밀번호"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (pwError) setPwError(null);
              }}
              error={pwError}
              required
            />

            <ButtonPrimary
              type="submit"
              size="l"
              thickness="thin"
              className={styles.loginBtn}
              disabled={!canSubmit}
            >
              로그인
            </ButtonPrimary>

            <p className={styles.bottomText}>
              최애의 포토가 처음이신가요?{' '}
              <Link className={styles.joinLink} href="/signup">
                회원가입하기
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
