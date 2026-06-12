'use client';

import { useAppStore } from '@/store/appStore';

export default function Header() {
  const openModal = useAppStore((s) => s.openModal);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#ddeec0]">
      <span className="text-[#2d5016] text-lg font-semibold" style={{ fontFamily: "'Shippori Mincho', serif" }}>
        万葉植物図鑑
      </span>
      <button
        onClick={() => openModal('register')}
        className="border border-[#2d5016] text-[#2d5016] bg-transparent text-sm px-4 py-1.5 rounded-full"
      >
        ＋ 登録
      </button>
    </header>
  );
}
