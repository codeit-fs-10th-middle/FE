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
    // 기존 FE가 쓰는 키들
    description: card.description ?? card.desc ?? '',
    owner: card.owner ?? card.ownerName ?? card.userNickname ?? '',
    category: card.genre ?? card.category ?? 'ALL',
    rarity: card.grade ?? card.rarity ?? 'COMMON',
    // CardOriginal에서 필요하면 추가
    name: card.name ?? card.title ?? '',
    imageUrl: card.imageUrl ?? card.image ?? '',
    minPrice: card.minPrice ?? card.price ?? 0,
  };
}

export default function MyGalleryPage() {
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  const { setOwnedCount, setLabel } = useMyGalleryCount();

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('ALL');
  const [genre, setGenre] = useState('ALL');

  // 서버 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // 서버 데이터
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

      // ✅ BE 스펙: GET /api/photo-cards/users/:userId?page=&pageSize=
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        // 서버가 필터를 지원하면 아래도 같이 보내면 됨
        // search, grade, genre
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

      // counts / pageInfo는 BE가 내려주는 값 그대로 사용
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

  // 최초 + page 변경 시 서버 재조회
  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  // 상단 Shell 텍스트/카운트 반영 (서버 counts.total 기준)
  useEffect(() => {
    setLabel?.('유디님이 보유한 포토카드');
    setOwnedCount(counts.total);
  }, [counts.total, setOwnedCount, setLabel]);

  // ✅ 지금 서버는 search/grade/genre 필터를 받지 않으니
  // 일단 프론트에서만 필터링(현재 페이지 items 내부)
  // 나중에 서버가 필터 지원하면, 이 로직 제거하고
  // fetch 파라미터로 넘기고 page=1로 재조회하면 됨.
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

  // 필터 바뀌면 1페이지로(서버 필터 붙이면 여기서 fetch도 같이)
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
