'use client';

import Image from 'next/image';
import { Plant } from '@/types';
import { useAppStore } from '@/store/appStore';

type Props = {
  plant: Plant;
  /** 植物園モード（GardenMode）で日付表示に使用予定 */
  latestDate?: string | null;
};

export default function OshiCard({ plant }: Props) {
  const openModal = useAppStore((s) => s.openModal);

  const displayName = plant.nickname ?? plant.name ?? '調査中';
  const isInvestigating = plant.name === null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-white shadow-sm cursor-pointer"
      onClick={() => openModal('detail', plant.id)}
    >
      {/* メイン写真 */}
      <div className="relative w-full aspect-[4/3]">
        {plant.mainImageUrl ? (
          <Image
            src={plant.mainImageUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 384px) 100vw, 384px"
          />
        ) : (
          <div className="w-full h-full bg-[#e8f4cc] flex items-center justify-center">
            <span className="text-4xl">🌿</span>
          </div>
        )}

        {/* ★ 推しバッジ */}
        <div className="absolute top-3 left-3 bg-[#2d5016] text-white text-xs px-2 py-0.5 rounded-full">
          ★ 推し
        </div>

        {/* 最終観察日（植物園モード専用のため、ここでは非表示） */}
      </div>

      {/* 下部情報エリア */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          {isInvestigating ? (
            <span className="bg-[#fdf0d8] text-[#7a5010] rounded-full text-xs px-2 py-0.5">
              調査中
            </span>
          ) : (
            <p
              className="text-[#1e3a0e] text-base font-semibold"
              style={{ fontFamily: "'Shippori Mincho', serif" }}
            >
              {displayName}
            </p>
          )}
          {plant.scientificName && (
            <p className="text-[#8aaa58] text-xs mt-0.5">{plant.scientificName}</p>
          )}
        </div>

        {/* 愛情度ドット */}
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < plant.affectionLevel ? 'bg-[#2d5016]' : 'bg-[#ddeec0]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
