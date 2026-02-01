'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import { http } from '@/lib/http/client';

export default function Header({ onOpenAlarm }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  // =====================
  // mobile 햄버거 메뉴 (portal 유지)
  // =====================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const menuTriggerRef = useRef(null);

  // =====================
  // profile dropdown (absolute)
  // =====================
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileWrapRef = useRef(null);

  // =====================
  // alarm dropdown (absolute)
  // =====================
  const [isAlarmOn] = useState(true); // 임시: 알림 있음
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);
  const alarmWrapRef = useRef(null);

  // ✅ 임시 알림 데이터
  const mockAlarms = [
    { id: 1, message: '김머누님이 [RARE] 우리집 앞마당을 1장 구매했습니다.', timeText: '1시간 전' },
    {
      id: 2,
      message: '예진쓰님이 [COMMON] 스페인 여행의 포토 카드 교환을 제안했습니다.',
      timeText: '1시간 전',
    },
    { id: 3, message: '[LEGENDARY] 우리집 앞마당이 품절되었습니다.', timeText: '1시간 전' },
    {
      id: 4,
      message: '[RARE] How Far I’ll Go 3장을 성공적으로 구매했습니다.',
      timeText: '1시간 전',
    },
    {
      id: 5,
      message: '예진쓰님과의 [COMMON] 스페인 여행의 포토카드 교환이 성사되었습니다.',
      timeText: '1시간 전',
    },
  ];

  useEffect(() => setMounted(true), []);

  // ✅ 모바일 메뉴 위치(기존 유지)
  useEffect(() => {
    if (!mounted || !isMenuOpen || !menuTriggerRef.current) return;
    const rect = menuTriggerRef.current.getBoundingClientRect();
    setMenuStyle({ top: rect.bottom + 6, left: rect.left });
  }, [mounted, isMenuOpen]);

  // ✅ 바깥 클릭 닫기 (portal이든 absolute든 동일)
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await http.get('/users/me');
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    try {
      await http.post('/users/logout');
      setUser(null);
      router.replace('/');
      router.refresh();
    } catch {
      setUser(null);
      router.replace('/');
      router.refresh();
    }
    setIsMenuOpen(false);
  }

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
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }

      // alarm close
      if (alarmWrapRef.current && !alarmWrapRef.current.contains(e.target)) {
        setIsAlarmOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.nickname ?? user?.email ?? '';
  const points = user?.points ?? 0;

  return (
    <header className="w-full bg-black">
      <Container className="flex h-[72px] items-center justify-between">
        {/* ================= Desktop (>= 768px) ================= */}
        <div className="hidden min-[768px]:flex min-[768px]:w-full min-[768px]:items-center min-[768px]:justify-between">
          {/* LOGO */}
          <Link href="/" className="no-underline">
            <Image src="/assets/logos/logo.svg" alt="최애의포토" width={140} height={28} priority />
          </Link>
          <div className="flex items-center gap-4 text-sm text-white/80">
            {authLoading ? (
              <span className="text-white/50">...</span>
            ) : user ? (
              <>
                <div className="flex items-center gap-1">
                  <span>{Number(points).toLocaleString()}</span>
                  <span>P</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAlarm}
                  className="rounded p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="알림"
                >
                  🔔
                </button>
                <span>{displayName}</span>
                <span className="mx-1 h-4 w-px bg-white/20" />
                <button type="button" onClick={handleLogout} className="text-white/50 hover:text-white">
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-yellow-300 hover:underline">
                로그인
              </Link>
            )}
          </div>
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

            {/* ✅ 모바일 햄버거 메뉴(기존 portal 유지) */}
            {mounted &&
              isMenuOpen &&
              createPortal(
                <div
                  ref={menuRef}
                  className="fixed z-[9999] min-w-[160px] rounded border border-white/20 bg-[#1a1a1a] py-2 shadow-lg"
                  style={{ top: menuStyle.top, left: menuStyle.left }}
                  role="menu"
                >
                  {user ? (
                    <>
                      <div className="flex items-center gap-1 px-4 py-2 text-sm text-white/80">
                        <span>{Number(points).toLocaleString()}</span>
                        <span>P</span>
                      </div>
                      <div className="my-1 h-px w-full bg-white/20" />
                      <div className="px-4 py-2 text-sm text-white">{displayName}</div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-white/50 hover:bg-white/10 hover:text-white"
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="block px-4 py-2 text-sm text-yellow-300 hover:bg-white/10 hover:underline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                  )}
                </div>,
                document.body,
              )}
          </div>

          {/* LOGO */}
          <Link href="/" className="flex flex-1 justify-center no-underline">
            <Image src="/assets/logos/logo.svg" alt="최애의포토" width={120} height={24} priority />
          </Link>

          {/* 오른쪽 */}
          <div className="flex min-w-0 flex-1 justify-end">
            {userName ? (
              <div ref={alarmWrapRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsAlarmOpen((v) => !v);
                    setIsProfileOpen(false);
                  }}
                  className="relative rounded p-2 hover:bg-white/10"
                  aria-label="알림"
                >
                  <Image
                    src={isAlarmOn ? '/assets/icons/ic_alarm_on.svg' : '/assets/icons/ic_alarm.svg'}
                    alt=""
                    width={24}
                    height={24}
                  />
                  {isAlarmOn && (
                    <span className="absolute right-[9px] top-[9px] h-[6px] w-[6px] rounded-full bg-red-500" />
                  )}
                </button>

                {isAlarmOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+10px)] z-[9999] h-[535px] w-[300px] overflow-hidden rounded bg-[#2b2b2b] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                    role="menu"
                  >
                    <AlarmDropdownContent items={mockAlarms} />
                  </div>
                )}
              </div>
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

      <div className="h-px w-full bg-white/20" />
    </header>
  );
}
