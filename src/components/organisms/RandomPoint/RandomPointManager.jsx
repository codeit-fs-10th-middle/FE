'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RandomPointSelectModal from './RandomPointSelectModal';
import RandomPointResultModal from './RandomPointResultModal';

const COOLDOWN_SECONDS = 60 * 60;
const POLL_MS = 30 * 1000;

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

function pad2(n) {
  return String(n).padStart(2, '0');
}
function formatRemain(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}시간 ${pad2(m)}분 ${pad2(ss)}초`;
}

function parseDateSafe(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function RandomPointManager() {
  // TODO: 로그인 연동되면 여기서 userId 가져오기
  const userId = 1;

  const [selectOpen, setSelectOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  const [earnedPoint, setEarnedPoint] = useState(0);
  const [remainSeconds, setRemainSeconds] = useState(COOLDOWN_SECONDS);

  const [loadingDraw, setLoadingDraw] = useState(false);

  // 같은 “기회”에서 여러 번 자동 오픈 방지
  const lastAutoOpenKeyRef = useRef(null);

  const timeText = useMemo(() => formatRemain(remainSeconds), [remainSeconds]);
  const canDraw = remainSeconds <= 0;

  // 1초 카운트다운(표시용)
  useEffect(() => {
    const t = setInterval(() => {
      setRemainSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // 최근 뽑기 시각 기반으로 remaining 계산
  const refreshStatus = useCallback(async () => {
    try {
      if (!API_BASE) return; // 배포 환경변수 누락 시 조용히 중단

      const qs = new URLSearchParams({ userId: String(userId), limit: '1', offset: '0' });
      const res = await fetch(`${API_BASE}/point-box-draws/draw-history?${qs.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`status HTTP ${res.status}`);

      const json = await res.json();
      if (!json?.ok) throw new Error('status ok:false');

      const raw = json.data;
      const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];

      const last = rows[0];
      if (!last) {
        setRemainSeconds(0);
        return;
      }

      const lastAt = parseDateSafe(last.reg_date ?? last.regDate);
      if (!lastAt) {
        setRemainSeconds(0);
        return;
      }

      const now = Date.now();
      const diffSec = Math.floor((now - lastAt.getTime()) / 1000);
      const remain = COOLDOWN_SECONDS - diffSec;
      setRemainSeconds(Math.max(0, remain));
    } catch {
      // 여기서 에러 로그 안 찍는 이유: 배포에서 콘솔 도배 방지
    }
  }, [userId]);

  // 폴링
  useEffect(() => {
    refreshStatus(); // 최초 1회
    const t = setInterval(refreshStatus, POLL_MS);
    return () => clearInterval(t);
  }, [refreshStatus]);

  // canDraw true 되는 순간 자동 오픈
  useEffect(() => {
    if (!canDraw) return;

    const hourBucket = Math.floor(Date.now() / (COOLDOWN_SECONDS * 1000));
    const key = `${userId}:${hourBucket}`;

    if (lastAutoOpenKeyRef.current === key) return;
    lastAutoOpenKeyRef.current = key;

    setSelectOpen(true);
  }, [canDraw, userId]);

  const draw = useCallback(async () => {
    setLoadingDraw(true);
    try {
      if (!API_BASE) throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');

      const res = await fetch(`${API_BASE}/point-box-draws/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (res.status === 429) {
        await refreshStatus();
        return { ok: false, reason: 'COOLDOWN' };
      }

      if (!res.ok) throw new Error(`draw HTTP ${res.status}`);

      const json = await res.json();
      if (!json?.ok) throw new Error('draw ok:false');

      const data = json.data ?? json;
      const earned = Number(data.earnedPoints ?? data.earnedPoint ?? 0) || 0;

      setEarnedPoint(earned);
      setSelectOpen(false);
      setResultOpen(true);

      setRemainSeconds(COOLDOWN_SECONDS);
      return { ok: true };
    } finally {
      setLoadingDraw(false);
    }
  }, [userId, refreshStatus]);

  const handleConfirm = useCallback(async () => {
    if (loadingDraw) return;
    await draw();
  }, [draw, loadingDraw]);

  const handleCloseSelect = useCallback(() => setSelectOpen(false), []);
  const handleCloseResult = useCallback(() => setResultOpen(false), []);

  return (
    <>
      <RandomPointSelectModal
        open={selectOpen}
        onClose={handleCloseSelect}
        onConfirm={handleConfirm}
        timeText={timeText}
      />

      <RandomPointResultModal
        open={resultOpen}
        onClose={handleCloseResult}
        earnedPoint={earnedPoint}
        timeText={timeText}
      />
    </>
  );
}
