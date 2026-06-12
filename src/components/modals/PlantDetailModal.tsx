'use client';

import Image from 'next/image';
import { useAppStore } from '@/store/appStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { useObservations } from '@/hooks/useObservations';
import { usePlants } from '@/hooks/usePlants';
import { supabase } from '@/lib/supabase';
import { Plant } from '@/types';

// affectionLevel → 称号バッジ
function getBadge(level: number): { icon: string; label: string } {
  if (level >= 7) return { icon: '✨', label: '愛着度MAX' };
  if (level >= 4) return { icon: '🌸', label: 'すっかり仲良し' };
  if (level >= 2) return { icon: '🌿', label: 'なじんできた' };
  return { icon: '🌱', label: 'はじめまして' };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

// 仲間候補（同じ color または texture）
function getSimilarPlants(target: Plant, all: Plant[]): Plant[] {
  return all.filter(
    (p) =>
      p.id !== target.id &&
      ((target.color && p.color === target.color) ||
        (target.texture && p.texture === target.texture))
  );
}

export default function PlantDetailModal() {
  const activeModal = useAppStore((s) => s.activeModal);
  const selectedPlantId = useAppStore((s) => s.selectedPlantId);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);

  const isOpen = activeModal === 'detail';

  const { plants } = usePlants();

  const plant = selectedPlantId
    ? plants.find((p) => p.id === selectedPlantId) ?? null
    : null;

  const { observations } = useObservations(selectedPlantId);

  const similarPlants = plant ? getSimilarPlants(plant, plants) : [];

  if (!plant) return null;

  const displayName = plant.nickname ?? plant.name;
  const isInvestigating = plant.name === null;
  const badge = getBadge(plant.affectionLevel);

  async function handleToggleOshi() {
    if (!plant) return;

    if (!plant.isOshi) {
      await supabase
        .from('plants')
        .update({ is_oshi: false })
        .eq('user_id', plant.userId);
    }

    await supabase
      .from('plants')
      .update({ is_oshi: !plant.isOshi })
      .eq('id', plant.id);

    window.location.reload();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={closeModal}>
      {/* ① ヒーロー画像 */}
      <div className="relative w-full h-[200px] bg-[#e8f4cc] shrink-0">
        {plant.mainImageUrl && (
          <Image
            src={plant.mainImageUrl}
            alt={displayName ?? '調査中'}
            fill
            className="object-cover"
            sizes="384px"
          />
        )}
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 閉じるボタン */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white text-sm"
        >
          ✕
        </button>

        {/* 植物名・学名 */}
        <div className="absolute bottom-3 left-4 right-12">
          {isInvestigating ? (
            <p className="text-white/70 text-base italic">調査中</p>
          ) : (
            <p
              className="text-white text-xl font-semibold leading-tight"
              style={{ fontFamily: "'Shippori Mincho', serif" }}
            >
              {displayName}
            </p>
          )}
          {plant.scientificName && (
            <p className="text-white/60 text-xs mt-0.5">{plant.scientificName}</p>
          )}
        </div>
      </div>

      {/* ② 基本情報エリア */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* 称号バッジ＋推し設定ボタン＋名付け編集ボタン */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#e8f4cc] text-[#2d5016] text-xs px-3 py-1 rounded-full font-medium">
              {badge.icon} {badge.label}
            </span>
            <button
              onClick={handleToggleOshi}
              className={`text-xs px-3 py-1 rounded-full border ${
                plant.isOshi
                  ? 'bg-[#2d5016] text-white border-[#2d5016]'
                  : 'bg-transparent text-[#2d5016] border-[#2d5016]'
              }`}
            >
              {plant.isOshi ? '⭐ 推し中' : '☆ 推しにする'}
            </button>
          </div>
          <button
            onClick={() => openModal('naming', plant.id)}
            className="border border-[#2d5016] text-[#2d5016] bg-transparent text-xs px-3 py-1 rounded-full"
          >
            ✏️ 名付け編集
          </button>
        </div>

        {/* 特徴タグ */}
        <div className="flex gap-1.5 flex-wrap">
          {plant.color && (
            <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2.5 py-1">
              🎨 {plant.color}
            </span>
          )}
          {plant.smell && (
            <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2.5 py-1">
              👃 {plant.smell}
            </span>
          )}
          {plant.texture && (
            <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2.5 py-1">
              🤚 {plant.texture}
            </span>
          )}
        </div>
      </div>

      {/* ③ 仲間かな？ */}
      {similarPlants.length > 0 && (
        <div className="px-4 py-3 border-t border-[#f0f7e8]">
          <p className="text-[#1e3a0e] text-xs font-semibold mb-2">🌿 仲間かな？</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {similarPlants.map((p) => (
              <button
                key={p.id}
                onClick={() => openModal('detail', p.id)}
                className="shrink-0 flex flex-col items-center gap-1 w-20"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#e8f4cc]">
                  {p.mainImageUrl && (
                    <Image
                      src={p.mainImageUrl}
                      alt={p.nickname ?? p.name ?? '調査中'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
                <p className="text-[#8aaa58] text-xs text-center leading-tight line-clamp-2 w-full">
                  {p.nickname ?? p.name ?? '調査中'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ④ 観察記録セクション */}
      <div className="px-4 py-3 border-t border-[#f0f7e8]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#1e3a0e] text-xs font-semibold">観察記録</p>
          <button
            onClick={() => openModal('observation', plant.id)}
            className="border border-[#2d5016] text-[#2d5016] bg-transparent text-xs px-3 py-1.5 rounded-full"
          >
            今日も会いに行った
          </button>
        </div>

        {/* 記録リスト */}
        {observations.length === 0 ? (
          <p className="text-[#8aaa58] text-sm text-center py-4">
            まだ記録がありません
          </p>
        ) : (
          <div className="space-y-2">
            {observations.map((obs, index) => {
              const isLatest = index === 0;
              const height = isLatest ? 180 : 120;
              return (
                <div
                  key={obs.id}
                  className="relative rounded-xl overflow-hidden bg-[#e8f4cc]"
                  style={{ height }}
                >
                  {obs.imageUrl && (
                    <Image
                      src={obs.imageUrl}
                      alt={formatDate(obs.date)}
                      fill
                      className="object-cover"
                      sizes="384px"
                    />
                  )}
                  {/* 下部グラデーション（コメント用） */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* 日付（左上） */}
                  <p className="absolute top-2 left-3 text-white/50 text-xs">
                    {formatDate(obs.date)}
                  </p>

                  {/* ひとこと（左下） */}
                  {obs.comment && (
                    <p className="absolute bottom-2 left-3 right-3 text-white text-xs leading-relaxed line-clamp-2">
                      {obs.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ⑤ 図鑑カードボタン */}
      <div className="px-4 pt-2 pb-6">
        <button
          onClick={() => openModal('share', plant.id)}
          className="w-full bg-[#2d5016] text-white text-sm py-3 rounded-full font-medium"
        >
          🎴 図鑑カードを作って自慢する
        </button>
      </div>
    </BottomSheet>
  );
}
