import React from 'react';
import Container from '@/components/layout/Container';
import SuccessClient from './SuccessClient';

export default function CreateCardSuccessPage({ searchParams }) {
  const sp = React.use(searchParams); // ✅ unwrap

  const grade = sp?.grade ?? 'RARE';
  const title = sp?.title ?? '유리진 엄마당';

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Container className="min-h-screen grid place-items-center relative">
        <SuccessClient grade={grade} title={title} />
      </Container>
    </main>
  );
}
