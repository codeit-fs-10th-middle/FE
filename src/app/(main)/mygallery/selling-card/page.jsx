'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useBreakpoint from '@/hooks/useBreakpoint';

import { sampleCards } from '../_data/sampleCards';
import CardOriginal from '@/components/organisms/CardOriginal/CardOriginal';
import GradeChips from '../_components/GradeChips';
import Pagination from '../_components/Pagination';
import MyGalleryFilterBar from '../_components/MyGalleryFilterBar';
import MyGalleryMobileHeader from '../_components/MyGalleryMobileHeader';
import { useMyGalleryCount } from '../_components/MyGalleryCountContext';

import styles from './page.module.css';

const PAGE_SIZE = 15;

export default function MyGallerySellingPage() {
  const router = useRouter();
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';

  const { setOwnedCount, setLabel, setTitle } = useMyGalleryCount();

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('ALL');
  const [genre, setGenre] = useState('ALL');

  // ✅ 추가: 판매방법 / 매진여부
  const [sellMethod, setSellMethod] = useState('ALL'); // ALL | SELL | TRADE
  const [soldOut, setSoldOut] = useState('ALL'); // ALL | SOLD_OUT | ON_SALE

  const [page, setPage] = useState(1);

  // ✅ 판매중 카드만
  const sourceCards = useMemo(() => sampleCards.filter((c) => c.isSelling), []);

  /* 등급별 개수 */
  const gradeCounts = useMemo(() => {
    return sourceCards.reduce(
      (acc, card) => {
        acc.total += 1;
        if (card.rarity === 'COMMON') acc.common += 1;
        if (card.rarity === 'RARE') acc.rare += 1;
        if (card.rarity === 'SUPER RARE') acc.superRare += 1;
        if (card.rarity === 'LEGENDARY') acc.legendary += 1;
        return acc;
      },
      { total: 0, common: 0, rare: 0, superRare: 0, legendary: 0 },
    );
  }, [sourceCards]);

  useEffect(() => {
    setTitle?.('나의 판매 포토카드'); // ✅ 큰 타이틀
    setLabel?.('유디님이 보유한 포토카드'); // ✅ 아래 문구
    setOwnedCount(gradeCounts.total);
  }, [gradeCounts.total, setOwnedCount, setLabel, setTitle]);

  /* 필터 */
  const filteredCards = useMemo(() => {
    return sourceCards.filter((c) => {
      const okSearch = search
        ? `${c.description ?? ''} ${c.owner ?? ''} ${c.category ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;

      const okGrade = grade === 'ALL' ? true : c.rarity === grade;
      const okGenre = genre === 'ALL' ? true : c.category === genre;

      // ✅ 판매방법: 데이터에 c.sellMethod가 없으면 일단 'SELL'로 간주(임시)
      const method = c.sellMethod ?? 'SELL';
      const okSellMethod = sellMethod === 'ALL' ? true : method === sellMethod;

      // ✅ 매진여부: selling.remaining 기준
      const remaining = c.selling?.remaining ?? 0;
      const okSoldOut =
        soldOut === 'ALL' ? true : soldOut === 'SOLD_OUT' ? remaining === 0 : remaining > 0; // ON_SALE

      return okSearch && okGrade && okGenre && okSellMethod && okSoldOut;
    });
  }, [sourceCards, search, grade, genre, sellMethod, soldOut]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const pagedCards = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, grade, genre, sellMethod, soldOut]);

  return (
    <div className={styles.listWrapper}>
      {isMobile && <MyGalleryMobileHeader title="판매 포토카드" onBack={() => router.back()} />}

      {!isMobile && <GradeChips counts={gradeCounts} />}
      {!isMobile && <div className="mt-[60px] h-px w-full bg-white/20" />}

      <MyGalleryFilterBar
        isMobile={isMobile}
        search={search}
        onChangeSearch={setSearch}
        grade={grade}
        onChangeGrade={setGrade}
        genre={genre}
        onChangeGenre={setGenre}
        showExtraFilters={true}
        sellMethod={sellMethod}
        onChangeSellMethod={setSellMethod}
        soldOut={soldOut}
        onChangeSoldOut={setSoldOut}
      />

      <div className={styles.cardGrid}>
        {pagedCards.map((card) => (
          <CardOriginal key={card.id} {...card} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
