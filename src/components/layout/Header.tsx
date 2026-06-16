'use client';

import Image from 'next/image';
import { useAppStore } from '@/store/appStore';

export default function Header() {
  const openModal = useAppStore((s) => s.openModal);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#ddeec0]">
      <Image
        src="/oshibana-logotype.png"
        alt="おしばな"
        width={140}
        height={34}
        className="object-contain"
      />
      <button
        onClick={() => openModal('register')}
        className="border border-[#2d5016] text-[#2d5016] bg-transparent text-sm px-4 py-1.5 rounded-full"
      >
        ＋ 登録
      </button>
    </header>
  );
}
