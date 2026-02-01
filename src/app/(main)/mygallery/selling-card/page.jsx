'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useBreakpoint from '@/hooks/useBreakpoint';

import CardOriginal from '@/components/organisms/CardOriginal/CardOriginal';
import GradeChips from '../_components/GradeChips';
import Pagination from '../_components/Pagination';
import MyGalleryFilterBar from '../_components/MyGalleryFilterBar';
import MyGalleryMobileHeader from '../_components/MyGalleryMobileHeader';
import { useMyGalleryCount } from '../_components/MyGalleryCountContext';

import styles from './page.module.css';

const PAGE_SIZE = 15;

// ✅ listing(item) -> CardOriginal props로 매핑
function mapListingToCard(listing) {
  const pc = listing.photoCard ?? {};
  return {
    id: listing.listingId, // listing 기준으로 고유키
    description: pc.description ?? '',
    owner: String(listing.sellerUserId ?? ''), // 닉네임 없으니 일단 userId로
    category: pc.genre ?? 'ALL',
    rarity: pc.grade ?? 'COMMON',
    name: pc.name ?? '',
    imageUrl: pc.imageUrl ?? '',
    selling: {
      remaining: listing.quantity ?? 0, // ✅ 너 코드가 remaining을 기대해서 연결
      pricePerUnit: listing.pricePerUnit ?? pc.minPrice ?? 0,
      status: listing.status,
      saleType: listing.saleType,
    },
    // 필터용
    sellMethod: listing.saleType ?? 'SELL',
    isSelling: listing.status === 'ACTIVE',
  };
}

export default function MyGallerySellingPage() {
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  const { setOwnedCount, setLabel, setTitle } = useMyGalleryCount();

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('ALL');
  const [genre, setGenre] = useState('ALL');
  const [sellMethod, setSellMethod] = useState('ALL'); // ALL | SELL | TRADE
  const [soldOut, setSoldOut] = useState('ALL'); // ALL | SOLD_OUT | ON_SALE

  const [page, setPage] = useState(1);

  // ✅ API 데이터
  const [allCards, setAllCards] = useState([]); // 누적 로드
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ status는 BE가 지원함. (판매중/매진 필터를 status로 맞춰서 요청)
  const statusParam = useMemo(() => {
    if (soldOut === 'SOLD_OUT') return 'SOLD_OUT';
    if (soldOut === 'ON_SALE') return 'ACTIVE';
    return 'ACTIVE'; // 일단 기본은 ACTIVE로 (전체=ACTIVE+SOLD_OUT은 현재 1번 호출로 불가)
  }, [soldOut]);

  const fetchMore = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams();
      qs.set('limit', '50');
      qs.set('status', statusParam);
      qs.set('sortBy', 'reg_date');
      qs.set('sortOrder', 'DESC');
      if (nextCursor) qs.set('cursor', String(nextCursor));

      // ✅ 같은 도메인으로 프록시 되어있다는 가정.
      // 만약 FE/BE가 다른 도메인이면 NEXT_PUBLIC_API_BASE 붙여야 함(아래 설명 참고)
      const res = await fetch(`/api/listings?${qs.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? 'API ok:false');

      const items = Array.isArray(json.data?.items) ? json.data.items : [];
      const mapped = items.map(mapListingToCard);

      setAllCards((prev) => {
        const existed = new Set(prev.map((x) => x.id));
        const merged = [...prev, ...mapped.filter((m) => !existed.has(m.id))];
        return merged;
      });

      setNextCursor(json.data?.nextCursor ?? null);
    } catch (e) {
      setError(e?.message ?? 'failed to load');
    } finally {
      setLoading(false);
    }
  }, [nextCursor, statusParam]);

  // 최초 로드 + soldOut 바뀌면 목록 리셋 후 다시 로드
  useEffect(() => {
    setAllCards([]);
    setNextCursor(null);
    setPage(1);
  }, [soldOut]);

  useEffect(() => {
    // 리셋 직후 1회 로드
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldOut]);

  // page가 증가했는데, 현재 데이터가 부족하면 더 가져오기
  useEffect(() => {
    const need = page * PAGE_SIZE;
    if (allCards.length < need && nextCursor && !loading) {
      fetchMore();
    }
  }, [page, allCards.length, nextCursor, loading, fetchMore]);

  // ✅ 타이틀/라벨/카운트
  useEffect(() => {
    setTitle?.('나의 판매 포토카드');
    setLabel?.('유디님이 보유한 포토카드');
    // ⚠️ 지금은 “내 것만”이 아니라 “조회된 전체 리스팅 개수”임
    setOwnedCount(allCards.length);
  }, [allCards.length, setOwnedCount, setLabel, setTitle]);

  // ✅ 필터(클라 필터) — 지금 BE가 이 필터들을 지원 안 하니까 FE에서 처리
  const filteredCards = useMemo(() => {
    return allCards.filter((c) => {
      const okSearch = search
        ? `${c.description ?? ''} ${c.owner ?? ''} ${c.category ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;

      const okGrade = grade === 'ALL' ? true : c.rarity === grade;
      const okGenre = genre === 'ALL' ? true : c.category === genre;

      const method = c.sellMethod ?? 'SELL';
      const okSellMethod = sellMethod === 'ALL' ? true : method === sellMethod;

      // soldOut는 이미 statusParam으로 1차 필터됨. 그래도 유지
      const remaining = c.selling?.remaining ?? 0;
      const okSoldOut =
        soldOut === 'ALL' ? true : soldOut === 'SOLD_OUT' ? remaining === 0 : remaining > 0;

      return okSearch && okGrade && okGenre && okSellMethod && okSoldOut;
    });
  }, [allCards, search, grade, genre, sellMethod, soldOut]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const pagedCards = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, grade, genre, sellMethod, soldOut]);

  return (
    <div className={styles.listWrapper}>
      {isMobile && <MyGalleryMobileHeader title="판매 포토카드" onBack={() => router.back()} />}

      {!isMobile && (
        <GradeChips
          counts={{
            // ⚠️ gradeCounts도 "전체 로드된 데이터 기준"임
            total: filteredCards.length,
            common: filteredCards.filter((c) => c.rarity === 'COMMON').length,
            rare: filteredCards.filter((c) => c.rarity === 'RARE').length,
            superRare: filteredCards.filter((c) => c.rarity === 'SUPER RARE').length,
            legendary: filteredCards.filter((c) => c.rarity === 'LEGENDARY').length,
          }}
        />
      )}

      {!isMobile && <div className="mt-[60px] h-px w-full bg-white/20" />}

      <MyGalleryFilterBar
        isMobile={isMobile}
        search={search}
        onChangeSearch={setSearch}
        grade={grade}
        onChangeGrade={setGrade}
        genre={genre}
        onChangeGenre={setGenre}
        showExtraFilters
        sellMethod={sellMethod}
        onChangeSellMethod={setSellMethod}
        soldOut={soldOut}
        onChangeSoldOut={setSoldOut}
      />

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && <div className="mt-6 text-sm text-white/60">불러오는 중...</div>}

      <div className={styles.cardGrid}>
        {pagedCards.map((card) => (
          <CardOriginal key={card.id} {...card} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
