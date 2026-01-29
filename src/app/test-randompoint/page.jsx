'use client';

import { useState } from 'react';
import RandomPointModal from '@/components/organisms/RandomPoint/RandomPointSelectModal';
import RandomPointResultModal from '@/components/organisms/RandomPoint/RandomPointResultModal';

export default function TestRandomPointPage() {
  const [selectOpen, setSelectOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [earned, setEarned] = useState(0);

  const handleConfirm = (index) => {
    setEarned(2);
    setSelectOpen(false);
    setResultOpen(true);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Random Point Modal Test</h1>

      <button onClick={() => setSelectOpen(true)}>랜덤 포인트 모달 열기</button>

      <RandomPointModal
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        onConfirm={handleConfirm}
      />

      <RandomPointResultModal
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        earnedPoint={earned}
        timeText="59분 59초"
      />
    </div>
  );
}
