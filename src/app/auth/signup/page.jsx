'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import styles from './page.module.css';
import { InputEmail } from '@/components/molecules/InputEmail';
import { InputPassword } from '@/components/molecules/InputPassword';
import InputLabel from '@/components/molecules/InputLabel/InputLabel';
import ButtonPrimary from '@/components/atoms/Button/ButtonPrimary';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const canSubmit =
    email.trim() &&
    nickname.trim() &&
    password.trim() &&
    passwordConfirm.trim() &&
    password === passwordConfirm;

  return (
    <main className={styles.page}>
      <div className={styles.vignette} />

      <section className={styles.center}>
        <div className={styles.box}>
          {/* 로그인과 동일한 SVG 로고 */}
          <div className={styles.logoWrap}>
            <Image src="/assets/logos/logo.svg" alt="최애의포토" width={260} height={60} priority />
          </div>

          <form className={styles.form}>
            <InputEmail
              label="이메일"
              placeholder="이메일을 입력해 주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* ✅ 닉네임: InputLabel 사용 */}
            <InputLabel
              label="닉네임"
              placeholder="닉네임을 입력해 주세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
            />

            <InputPassword
              label="비밀번호"
              placeholder="8자 이상 입력해 주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <InputPassword
              label="비밀번호 확인"
              placeholder="비밀번호를 한번 더 입력해 주세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />

            <ButtonPrimary type="submit" size="l" className={styles.loginBtn} disabled={!canSubmit}>
              가입하기
            </ButtonPrimary>

            <p className={styles.bottomText}>
              이미 최애의포토 회원이신가요?{' '}
              <Link href="/login" className={styles.joinLink}>
                로그인하기
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
