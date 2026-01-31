'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/components/layout/Container';

export default function CreateCardFailPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const grade = sp.get('grade') || 'RARE';
  const title = sp.get('title') || '유리진 엄마당';

  const goMyGallery = () => router.push('/mygallery');

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Container className="min-h-screen grid place-items-center relative">
        {/* X 버튼 – 화면 대비 더 멀리 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={goMyGallery}
          className="
            absolute
            top-1/2 left-1/2
            translate-x-[320px] translate-y-[-200px]
            text-[20px]
            text-white/80
            hover:text-white
          "
        >
          ×
        </button>

        {/* 중앙 컨텐츠 */}
        <div className="w-full max-w-[460px] text-center">
          {/* 타이틀 */}
          <h1
            className="
              font-['BR_B']
              text-[46px]
              font-normal
              leading-[100%]
              tracking-[-0.03em]
            "
          >
            포토카드 생성 <span className="text-white/50">실패</span>
          </h1>

          {/* 설명 */}
          <p
            className="
              mt-[62px]
              font-['Noto_Sans_KR']
              text-[18px]
              font-medium
              leading-[100%]
              text-white/90
            "
          >
            [{grade} | {title}] 포토카드 생성에 실패했습니다.
          </p>

          {/* 버튼 */}
          <button
            type="button"
            onClick={goMyGallery}
            className="
              mt-[50px]
              w-[440px]
              h-[60px]
              px-[32px]
              border border-white/40
              text-[18px]
              font-medium
              hover:border-white/70
              active:translate-y-[1px]
            "
          >
            마이갤러리로 돌아가기
          </button>
        </div>
      </Container>
    </main>
  );
}
