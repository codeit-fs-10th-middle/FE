'use client';

import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import Image from 'next/image';
import { ButtonPrimary } from '@/components/atoms/Button';

export default function Home() {
  return (
    <>
      <Header />

      {/* ================= HERO ================= */}
      <section className="relative mt-[13px] min-h-[1100px] bg-neutral-950">
        {/* 회색 배경 (Container 기준 반응형) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Container className="h-full">
            <div className="h-full rounded-[28px] bg-neutral-700" />
          </Container>
        </div>

        {/* 텍스트 + 버튼 */}
        <div className="relative z-10 h-[40%] pt-[70px] flex justify-center text-center">
          <Container>
            <div className="mx-auto w-full max-w-[720px]">
              <p className="text-[18px] font-semibold tracking-[-0.02em]">최애의포토</p>

              <h1 className="mt-[18px] text-[44px] leading-[1.25] font-bold tracking-[-0.02em]">
                구하기 어려웠던
                <br />
                <span className="text-lime-400">나의 최애</span>가 여기에!
              </h1>

              <div className="mt-[28px] flex justify-center">
                <ButtonPrimary
                  href="/market"
                  thickness="thin"
                  size="M"
                  className="!w-[226px] !h-[55px] !px-0"
                >
                  최애 찾으러 가기
                </ButtonPrimary>
              </div>
            </div>
          </Container>
        </div>

        {/* 하단 이미지 */}
        <div className="absolute left-1/2 bottom-0 w-screen -translate-x-1/2 h-[80%] pointer-events-none z-[1]">
          <Image
            src="/images/landing/lg/img1.svg"
            alt="hero preview"
            fill
            priority
            className="object-contain object-center"
          />
        </div>
      </section>

      {/* ================= BELOW SECTIONS ================= */}
      <main className="bg-neutral-950 text-white">
        {/* Section A */}
        <section className="py-24">
          <Container>
            <div className="min-h-[420px] rounded-[28px] bg-neutral-900/40" />
          </Container>
        </section>

        {/* Section B */}
        <section className="py-24">
          <Container>
            <div className="min-h-[420px] rounded-[28px] bg-neutral-900/40" />
          </Container>
        </section>

        {/* Section C */}
        <section className="py-24">
          <Container>
            <div className="min-h-[420px] rounded-[28px] bg-neutral-900/40" />
          </Container>
        </section>

        {/* Final CTA */}
        <section className="pt-24 pb-32">
          <Container>
            <div className="min-h-[320px] rounded-[28px] bg-neutral-900/40" />
          </Container>
        </section>
      </main>
    </>
  );
}
