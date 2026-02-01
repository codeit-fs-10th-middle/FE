'use client';

export default function AlarmDropdownContent({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="w-[300px] bg-[#161616] px-5 py-4 text-[13px] text-white/60">
        불러오는 중...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="w-[300px] bg-[#161616] px-5 py-4 text-[13px] text-white/60">
        알림이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-[300px] bg-[#161616]">
      {items.map((a) => (
        <div key={a.id}>
          <div className="px-5 py-4">
            <div className="text-[14px] font-normal leading-[1.4] text-white">{a.message}</div>
            <div className="mt-2 text-[12px] font-light text-white/50">{a.timeText}</div>
          </div>
          <div className="h-px w-full bg-white/20" />
        </div>
      ))}
    </div>
  );
}
