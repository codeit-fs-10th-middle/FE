'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useBreakpoint from '@/hooks/useBreakpoint';

import CardOriginal from '@/components/organisms/CardOriginal/CardOriginal';
import GradeChips from './_components/GradeChips';
import Pagination from './_components/Pagination';
import MyGalleryFilterBar from './_components/MyGalleryFilterBar';
import MyGalleryMobileHeader from './_components/MyGalleryMobileHeader';
import { useMyGalleryCount } from './_components/MyGalleryCountContext';

import styles from './page.module.css';

const DEFAULT_PAGE_SIZE = 15;

// BE -> FE 카드 필드 매핑 (필드명 확정되면 여기만 수정)
function mapApiCardToUi(card) {
  return {
    id: card.id ?? card.photoCardId ?? card.photocardId,
    description: card.description ?? card.desc ?? '',
    owner: card.owner ?? card.ownerName ?? card.userNickname ?? '',
    category: card.genre ?? card.category ?? 'ALL',
    rarity: card.grade ?? card.rarity ?? 'COMMON',
    name: card.name ?? card.title ?? '',
    imageUrl: card.imageUrl ?? card.image ?? '',
    minPrice: card.minPrice ?? card.price ?? 0,
  };
}

export default function MyGalleryPage() {
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  // ✅ setTitle 추가로 꺼내기 (2번 해결 포인트)
  const { setOwnedCount, setLabel, setTitle } = useMyGalleryCount();

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('ALL');
  const [genre, setGenre] = useState('ALL');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    common: 0,
    rare: 0,
    superRare: 0,
    legendary: 0,
  });
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // TODO: 로그인 연동되면 여기서 userId 가져오도록 교체
  const userId = 1;

  const fetchMyCards = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`/api/photo-cards/users/${userId}?${qs.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? 'API returned ok:false');

      const data = json.data ?? {};
      const apiItems = Array.isArray(data.items) ? data.items : [];

      setItems(apiItems.map(mapApiCardToUi));
      setCounts(data.counts ?? { total: 0, common: 0, rare: 0, superRare: 0, legendary: 0 });

      const pi = data.pageInfo ?? {};
      setTotalPages(Number(pi.totalPages ?? 1) || 1);
    } catch (e) {
      setError(e?.message ?? 'failed to load');
      setItems([]);
      setCounts({ total: 0, common: 0, rare: 0, superRare: 0, legendary: 0 });
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, userId]);

  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  // ✅ 2번 해결: 데스크탑 큰 타이틀을 "마이갤러리"로 고정
  useEffect(() => {
    setTitle?.('마이갤러리');
  }, [setTitle]);

  // (기존) 라벨/카운트
  useEffect(() => {
    setLabel?.('유디님이 보유한 포토카드');
    setOwnedCount(counts.total);
  }, [counts.total, setOwnedCount, setLabel]);

  const filteredItems = useMemo(() => {
    return items.filter((c) => {
      const okSearch = search
        ? `${c.description} ${c.owner} ${c.category}`.toLowerCase().includes(search.toLowerCase())
        : true;
      const okGrade = grade === 'ALL' ? true : c.rarity === grade;
      const okGenre = genre === 'ALL' ? true : c.category === genre;
      return okSearch && okGrade && okGenre;
    });
  }, [items, search, grade, genre]);

  useEffect(() => {
    setPage(1);
  }, [search, grade, genre]);

  return (
    <div className={styles.listWrapper}>
      {isMobile && <MyGalleryMobileHeader title="마이갤러리" onBack={() => router.back()} />}

      {!isMobile && <GradeChips counts={counts} />}

      {!isMobile && <div className="mt-[60px] h-px w-full bg-white/20" />}

      <MyGalleryFilterBar
        isMobile={isMobile}
        search={search}
        onChangeSearch={setSearch}
        grade={grade}
        onChangeGrade={setGrade}
        genre={genre}
        onChangeGenre={setGenre}
      />

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && <div className="mt-6 text-sm text-white/60">불러오는 중...</div>}

      <div className={styles.cardGrid}>
        {!loading && filteredItems.length === 0 ? (
          <div className="col-span-full mt-10 text-center text-white/60">
            보유한 포토카드가 없습니다.
          </div>
        ) : (
          filteredItems.map((card) => <CardOriginal key={card.id} {...card} />)
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
