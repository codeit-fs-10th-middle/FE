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

const PAGE_SIZE = 15;

/** BE → FE 카드 매핑 */
function mapMyCardToCard(item) {
  const pc = item?.photoCard ?? item;

  return {
    id: pc?.id ?? item?.cardId ?? item?.id,
    description: pc?.description ?? '',
    owner: pc?.ownerNickname ?? pc?.ownerName ?? '',
    category: pc?.genre ?? pc?.category ?? 'ALL',
    rarity: pc?.grade ?? pc?.rarity ?? 'COMMON',
    name: pc?.name ?? '',
    imageUrl: pc?.imageUrl ?? pc?.image ?? '',
    minPrice: pc?.minPrice ?? 0,
  };
}

export default function MyGalleryPage() {
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  const { setOwnedCount, setLabel, setTitle } = useMyGalleryCount();

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('ALL');
  const [genre, setGenre] = useState('ALL');

  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** ✅ 내 카드 목록 (404 제거 핵심) */
  const fetchMyCards = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/users/me/cards', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const rawItems = Array.isArray(json?.data?.items)
        ? json.data.items
        : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
            ? json.data
            : [];

      const mapped = rawItems.map(mapMyCardToCard);

      setItems(mapped);
      setOwnedCount(mapped.length);
    } catch (e) {
      setError(e?.message ?? 'failed to load');
      setItems([]);
      setOwnedCount(0);
    } finally {
      setLoading(false);
    }
  }, [setOwnedCount]);

  useEffect(() => {
    fetchMyCards();
  }, [fetchMyCards]);

  // 타이틀 고정
  useEffect(() => {
    setTitle?.('마이갤러리');
  }, [setTitle]);

  // 라벨은 3번에서 이미 닉네임 처리 완료 상태
  // 여기선 건드리지 않음

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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, grade, genre]);

  return (
    <div className={styles.listWrapper}>
      {isMobile && <MyGalleryMobileHeader title="마이갤러리" onBack={() => router.back()} />}

      {!isMobile && (
        <GradeChips
          counts={{
            total: filteredItems.length,
            common: filteredItems.filter((c) => c.rarity === 'COMMON').length,
            rare: filteredItems.filter((c) => c.rarity === 'RARE').length,
            superRare: filteredItems.filter((c) => c.rarity === 'SUPER RARE').length,
            legendary: filteredItems.filter((c) => c.rarity === 'LEGENDARY').length,
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
      />

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && <div className="mt-6 text-sm text-white/60">불러오는 중...</div>}

      <div className={styles.cardGrid}>
        {!loading && pagedItems.length === 0 ? (
          <div className="col-span-full mt-10 text-center text-white/60">
            보유한 포토카드가 없습니다.
          </div>
        ) : (
          pagedItems.map((card) => <CardOriginal key={card.id} {...card} />)
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
