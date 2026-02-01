'use client';

export default function AlarmDropdownContent({ items = [] }) {
  return (
    <div className="w-[300px] bg-[#161616]">
      {items.map((a) => (
        <div key={a.id}>
          <div className="px-5 py-4">
            <div className="text-[14px] font-normal leading-[1.4] text-white">{a.message}</div>
            <div className="mt-2 text-[12px] font-light text-white/50">{a.timeText}</div>
          </div>

          {/* ✅ 회색 구분선 */}
          <div className="h-px w-full bg-white/20" />
        </div>
      ))}
    </div>
  );
}
