'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/layout/Container';

function ProfileDropdownContent({ userName, ownedPoint = 300, onClose }) {
  return (
    <div className="relative h-full w-full px-[20px] pt-[20px] pb-[21px]">
      <p className="text-[20px] font-bold leading-[1.2] text-white">안녕하세요, {userName}님!</p>

      <div className="mt-[18px] flex items-center justify-between">
        <span className="text-[12px] font-light text-white/40">보유 포인트</span>
        <span className="text-[12px] font-normal text-yellow-300">
          {ownedPoint.toLocaleString()} P
        </span>
      </div>

      <div className="mt-[18px] h-px w-full bg-white/10" />

      <nav className="mt-[18px] flex flex-col gap-[15px]">
        <Link
          href="/marketplace"
          onClick={onClose}
          className="text-[14px] font-bold text-white hover:text-yellow-300"
        >
          마켓플레이스
        </Link>
        <Link
          href="/mygallery"
          onClick={onClose}
          className="text-[14px] font-bold text-white hover:text-yellow-300"
        >
          마이갤러리
        </Link>
        <Link
          href="/mygallery/selling-card"
          onClick={onClose}
          className="text-[14px] font-bold text-white hover:text-yellow-300"
        >
          판매 중인 포토카드
        </Link>
      </nav>
    </div>
  );
}

function GuestRight() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="rounded bg-yellow-300 px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
      >
        회원가입
      </Link>
    </div>
  );
}

export default function Header({ userName = '유디', points = 1540, onLogout, onOpenAlarm }) {
  const [mounted, setMounted] = useState(false);

  // mobile 햄버거 메뉴
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const menuTriggerRef = useRef(null);

  // profile dropdown (닉네임 클릭)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileStyle, setProfileStyle] = useState({ top: 0, left: 0 });
  const profileRef = useRef(null);

  // ✅ ref 분리 (중요)
  const desktopProfileTriggerRef = useRef(null);
  const mobileProfileTriggerRef = useRef(null);

  // 현재 열려있는 트리거를 기억
  const [profileAnchor, setProfileAnchor] = useState('desktop'); // 'desktop' | 'mobile'

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e) {
      // mobile menu close
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuTriggerRef.current &&
        !menuTriggerRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }

      // profile close
      const triggerEl =
        profileAnchor === 'mobile'
          ? mobileProfileTriggerRef.current
          : desktopProfileTriggerRef.current;

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        triggerEl &&
        !triggerEl.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileAnchor]);

  useLayoutEffect(() => {
    if (!mounted || !isMenuOpen || !menuTriggerRef.current) return;
    const rect = menuTriggerRef.current.getBoundingClientRect();
    setMenuStyle({ top: rect.bottom + 6, left: rect.left });
  }, [mounted, isMenuOpen]);

  useLayoutEffect(() => {
    if (!mounted || !isProfileOpen) return;

    const triggerEl =
      profileAnchor === 'mobile'
        ? mobileProfileTriggerRef.current
        : desktopProfileTriggerRef.current;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();

    setProfileStyle({
      top: rect.bottom + 10,
      left: rect.right - 260, // 우측 정렬
    });
  }, [mounted, isProfileOpen, profileAnchor]);

  return (
    <header className="w-full bg-black">
      <Container className="flex h-[72px] items-center justify-between">
        {/* ================= Desktop (>= 768px) ================= */}
        <div className="hidden min-[768px]:flex min-[768px]:w-full min-[768px]:items-center min-[768px]:justify-between">
          {/* LOGO */}
          <Link href="/" className="no-underline">
            <Image src="/assets/logos/logo.svg" alt="최애의포토" width={140} height={28} priority />
          </Link>

          {/* 오른쪽 영역 분기 */}
          {userName ? (
            /* ===== 로그인 상태 ===== */
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <span>{points.toLocaleString()}</span>
                <span>P</span>
              </div>

              <button
                type="button"
                onClick={onOpenAlarm}
                className="rounded p-2 hover:bg-white/10"
                aria-label="알림"
              >
                <Image src="/assets/icons/ic_alarm.svg" alt="" width={24} height={24} />
              </button>

              <button
                ref={desktopProfileTriggerRef}
                type="button"
                onClick={() => {
                  setProfileAnchor('desktop');
                  setIsProfileOpen((v) => !v);
                }}
                className="rounded px-2 py-1 text-white hover:bg-white/10 font-['BR_B']"
              >
                {userName}
              </button>

              <span className="mx-1 h-4 w-px bg-white/20" />

              <button type="button" onClick={onLogout} className="text-white/50 hover:text-white">
                로그아웃
              </button>
            </div>
          ) : (
            /* ===== 비로그인 상태 ===== */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded bg-yellow-300 px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>

        {/* ================= Mobile (< 768px) ================= */}
        <div className="flex w-full min-[768px]:hidden items-center gap-2 px-2">
          <div className="relative flex min-w-0 flex-1 justify-start">
            {userName && (
              <button
                ref={menuTriggerRef}
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="rounded p-2 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="메뉴"
              >
                <Image src="/assets/icons/ic_menu.svg" alt="" width={24} height={24} />
              </button>
            )}
          </div>

          {/* LOGO */}
          <Link href="/" className="flex flex-1 justify-center no-underline">
            <Image src="/assets/logos/logo.svg" alt="최애의포토" width={120} height={24} priority />
          </Link>

          {/* 오른쪽 */}
          <div className="flex min-w-0 flex-1 justify-end">
            {userName ? (
              <button
                type="button"
                onClick={onOpenAlarm}
                className="rounded p-2 hover:bg-white/10"
                aria-label="알림"
              >
                <Image src="/assets/icons/ic_alarm.svg" alt="" width={24} height={24} />
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </Container>

      {/* ===== 프로필 드롭다운 (로그인 상태일 때만) ===== */}
      {mounted &&
        userName &&
        isProfileOpen &&
        createPortal(
          <div
            ref={profileRef}
            className="fixed z-[9999] h-[231px] w-[260px] overflow-hidden rounded bg-[#161616] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            style={{ top: profileStyle.top, left: profileStyle.left }}
            role="menu"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            <ProfileDropdownContent
              userName={userName}
              ownedPoint={300}
              onClose={() => setIsProfileOpen(false)}
            />
          </div>,
          document.body,
        )}

      <div className="h-px w-full bg-white/20" />
    </header>
  );
}
