'use client';

import Image from 'next/image';
import { useAppStore } from '@/store/appStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { dummyPlants } from '@/lib/dummyData';

function getBadge(level: number): { icon: string; label: string } {
  if (level >= 7) return { icon: '✨', label: '愛着度MAX' };
  if (level >= 4) return { icon: '🌸', label: 'すっかり仲良し' };
  if (level >= 2) return { icon: '🌿', label: 'なじんできた' };
  return { icon: '🌱', label: 'はじめまして' };
}

function getDaysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const today = new Date();
  const diff = today.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export default function ShareCardModal() {
  const activeModal = useAppStore((s) => s.activeModal);
  const selectedPlantId = useAppStore((s) => s.selectedPlantId);
  const closeModal = useAppStore((s) => s.closeModal);

  const isOpen = activeModal === 'share';

  const plant = selectedPlantId
    ? dummyPlants.find((p) => p.id === selectedPlantId) ?? null
    : null;

  if (!plant) return null;

  const displayName = plant.nickname ?? plant.name;
  const isInvestigating = plant.name === null;
  const badge = getBadge(plant.affectionLevel);
  const days = getDaysSince(plant.createdAt);
  const affectionPct = Math.min(100, (plant.affectionLevel / 10) * 100);

  function handleShare(service: string) {
    alert(`${service}：準備中です`);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={closeModal}>
      <div className="px-4 pb-8 space-y-5">

        {/* ② タイトル */}
        <div className="pt-1">
          <p
            className="text-[#1e3a0e] text-base font-semibold"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            🎴 自慢の図鑑カード
          </p>
          <p className="text-[#8aaa58] text-xs mt-0.5">シェアしてみんなに見せよう！</p>
        </div>

        {/* ③ カードプレビュー */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a0e, #2d5016, #3a7020)',
            borderRadius: 16,
            padding: 18,
          }}
        >
          {/* 上部：画像＋テキスト */}
          <div className="flex gap-3 items-start">
            {/* 植物画像 */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white/10">
              {plant.mainImageUrl ? (
                <Image
                  src={plant.mainImageUrl}
                  alt={displayName ?? '調査中'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl">🌿</span>
                </div>
              )}
            </div>

            {/* 名前・学名・称号 */}
            <div className="flex-1 min-w-0 pt-1">
              {isInvestigating ? (
                <p className="text-white/60 text-base italic">調査中</p>
              ) : (
                <p
                  className="text-white text-lg font-semibold leading-tight"
                  style={{ fontFamily: "'Shippori Mincho', serif" }}
                >
                  {displayName}
                </p>
              )}
              {plant.scientificName && (
                <p className="text-white/50 text-xs mt-0.5">{plant.scientificName}</p>
              )}
              <span className="inline-block mt-1.5 bg-white/15 text-white/90 text-xs px-2 py-0.5 rounded-full">
                {badge.icon} {badge.label}
              </span>
            </div>
          </div>

          {/* 愛情度バー */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/50 text-xs">愛情度</p>
              <p className="text-white/70 text-xs">{plant.affectionLevel} / 10</p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white/60"
                style={{ width: `${affectionPct}%` }}
              />
            </div>
          </div>

          {/* タグ行 */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {plant.color && (
              <span className="bg-white/15 text-white/80 text-xs px-2 py-0.5 rounded-full">
                {plant.color}
              </span>
            )}
            {plant.texture && (
              <span className="bg-white/15 text-white/80 text-xs px-2 py-0.5 rounded-full">
                {plant.texture}
              </span>
            )}
            <span className="bg-white/15 text-white/80 text-xs px-2 py-0.5 rounded-full">
              発見{days}日目
            </span>
          </div>

          {/* ウォーターマーク */}
          <p
            className="absolute bottom-3 right-4 text-white/20 text-xs"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            万葉植物図鑑
          </p>
        </div>

        {/* ④ シェアボタングリッド */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleShare('𝕏')}
            className="bg-black text-white text-sm py-3 rounded-xl font-medium"
          >
            𝕏 でシェア
          </button>
          <button
            onClick={() => handleShare('Instagram')}
            className="text-white text-sm py-3 rounded-xl font-medium"
            style={{
              background: 'linear-gradient(135deg, #f9a8d4, #fb923c)',
            }}
          >
            📸 Instagram
          </button>
          <button
            onClick={() => handleShare('LINE')}
            className="bg-[#06c755] text-white text-sm py-3 rounded-xl font-medium"
          >
            💬 LINE
          </button>
          <button
            onClick={() => handleShare('保存')}
            className="bg-[#f0f8e4] text-[#2d5016] text-sm py-3 rounded-xl font-medium border border-[#cde0b0]"
          >
            ⬇️ 保存
          </button>
        </div>

        {/* ⑤ 閉じるボタン */}
        <button
          onClick={closeModal}
          className="w-full bg-[#f0f8e4] text-[#5a8030] text-sm py-3 rounded-full font-medium"
        >
          閉じる
        </button>

      </div>
    </BottomSheet>
  );
}
