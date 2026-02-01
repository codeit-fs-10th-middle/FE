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

function mapMyCardToCard(item) {
  // listing 래핑 형태(판매등록) or 단순 카드(보유)
  const listing = item?.listingId ? item : (item?.listing ?? null);
  const pc = listing?.photoCard ?? item?.photoCard ?? item;

  const status =
    listing?.status ?? item?.status ?? item?.listingStatus ?? listing?.listingStatus ?? null;
  const saleType = listing?.saleType ?? item?.saleType ?? item?.sellMethod ?? 'SELL';

  const quantity =
    listing?.quantity ?? item?.quantity ?? item?.remaining ?? pc?.quantity ?? pc?.remaining ?? 0;

  const pricePerUnit =
    listing?.pricePerUnit ??
    item?.pricePerUnit ??
    item?.price ??
    pc?.minPrice ??
    pc?.pricePerUnit ??
    0;

  const imageUrl =
    pc?.imageUrl ?? pc?.thumbnailUrl ?? pc?.imageUrlSmall ?? pc?.photoUrl ?? pc?.image ?? '';

  return {
    id: listing?.listingId ?? item?.cardId ?? item?.id,
    description: pc?.description ?? '',
    owner: String(listing?.sellerUserId ?? item?.ownerUserId ?? item?.ownerId ?? ''),
    category: pc?.genre ?? pc?.category ?? 'ALL',
    rarity: pc?.grade ?? pc?.rarity ?? 'COMMON',
    name: pc?.name ?? '',
    imageUrl,

    selling: {
      remaining: quantity,
      pricePerUnit,
      status,
      saleType,
    },

    sellMethod: saleType,
    isSelling: status === 'ACTIVE' || status === 'SOLD_OUT' || status === 'ON_SALE',
  };
}

export default function MyGallerySellingPage() {
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  // ✅ setLabel은 판매 페이지에서 건드리지 않음 (마이갤러리에서 세팅된 라벨 유지)
  const { setOwnedCount, setTitle } = useMyGalleryCount();

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('ALL');
  const [genre, setGenre] = useState('ALL');
  const [sellMethod, setSellMethod] = useState('ALL'); // ALL | SELL | TRADE
  const [soldOut, setSoldOut] = useState('ALL'); // ALL | SOLD_OUT | ON_SALE

  const [page, setPage] = useState(1);

  const [allCards, setAllCards] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ ALL이면 status를 아예 안 보내고, FE에서 remaining으로 처리
  const statusParam = useMemo(() => {
    if (soldOut === 'SOLD_OUT') return 'SOLD_OUT';
    if (soldOut === 'ON_SALE') return 'ACTIVE';
    return null; // ✅ ALL
  }, [soldOut]);

  const fetchMore = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams();
      qs.set('limit', '50');
      if (statusParam) qs.set('status', statusParam);
      if (nextCursor) qs.set('cursor', String(nextCursor));

      // ✅ 404 방지: 프록시 기준 통일 (/api)
      const url = `/api/users/me/cards?${qs.toString()}`;
      console.log('[selling] request:', url);

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      const rawItems = Array.isArray(json?.data?.items)
        ? json.data.items
        : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
            ? json.data
            : [];

      console.log('[selling] response keys:', Object.keys(json ?? {}));
      console.log('[selling] rawItems length:', rawItems.length);
      console.log('[selling] rawItems[0]:', rawItems?.[0]);

      // ✅ 판매등록된 것만 (status/ listing 존재 기반으로 최대한 안전하게)
      const onlySelling = rawItems.filter((x) => {
        const listing = x?.listingId ? x : x?.listing;
        const status =
          listing?.status ?? x?.status ?? x?.listingStatus ?? listing?.listingStatus ?? null;

        const hasListing = Boolean(listing) || status != null;

        // status가 아예 없으면 판매등록 여부 판단 불가 → 일단 제외(= selling page니까)
        if (!hasListing) return false;

        return status === 'ACTIVE' || status === 'SOLD_OUT' || status === 'ON_SALE';
      });

      console.log('[selling] onlySelling length:', onlySelling.length);
      console.log('[selling] onlySelling[0]:', onlySelling?.[0]);

      const mapped = onlySelling.map(mapMyCardToCard);

      setAllCards((prev) => {
        const existed = new Set(prev.map((x) => x.id));
        const merged = [...prev, ...mapped.filter((m) => !existed.has(m.id))];
        console.log('[selling] merged length:', merged.length);
        return merged;
      });

      setNextCursor(json?.data?.nextCursor ?? json?.nextCursor ?? null);
    } catch (e) {
      console.error('[selling] fetch error:', e);
      setError(e?.message ?? 'failed to load');
    } finally {
      setLoading(false);
    }
  }, [nextCursor, statusParam]);

  useEffect(() => {
    setAllCards([]);
    setNextCursor(null);
    setPage(1);
  }, [soldOut]);

  useEffect(() => {
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldOut]);

  useEffect(() => {
    const need = page * PAGE_SIZE;
    if (allCards.length < need && nextCursor && !loading) {
      fetchMore();
    }
  }, [page, allCards.length, nextCursor, loading, fetchMore]);

  // ✅ 타이틀/카운트만 갱신 (라벨은 유지)
  useEffect(() => {
    setTitle?.('나의 판매 포토카드');
  }, [setTitle]);

  useEffect(() => {
    setOwnedCount(allCards.length);
  }, [allCards.length, setOwnedCount]);

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
