'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { useAppStore } from '@/store/appStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { usePlants } from '@/hooks/usePlants';
import { useObservations } from '@/hooks/useObservations';

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

  const { plants } = usePlants();
  const { observations } = useObservations(selectedPlantId);

  const cardRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const plant = selectedPlantId
    ? plants.find((p) => p.id === selectedPlantId) ?? null
    : null;

  if (!plant) return null;

  const latestObs = observations[0] ?? null;
  const heroImage = latestObs?.imageUrl ?? plant.mainImageUrl ?? null;

  const displayName = plant.nickname ?? plant.name;
  const isInvestigating = plant.name === null && plant.nickname === null;
  const badge = getBadge(plant.affectionLevel);
  const days = getDaysSince(plant.createdAt);
  const affectionPct = Math.min(100, (plant.affectionLevel / 10) * 100);

  async function saveImage(): Promise<string | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: 360,
    });
    const link = document.createElement('a');
    link.download = `${plant?.nickname ?? '植物'}の図鑑カード.png`;
    link.href = dataUrl;
    link.click();
    return dataUrl;
  }

  async function handleSave() {
    try {
      setSaveStatus('saving');
      await saveImage();
      setSaveStatus('done');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (err) {
      console.error('save error:', err);
      setSaveStatus('idle');
    }
  }

  async function handleShareTo(platform: 'x' | 'instagram' | 'line') {
    try {
      await saveImage();
      const messages = {
        x: '画像を保存しました！Xを開いて投稿してください🐦',
        instagram: '画像を保存しました！Instagramを開いて投稿してください📸',
        line: '画像を保存しました！LINEを開いて送ってください💬',
      };
      alert(messages[platform]);
    } catch (err) {
      console.error('share error:', err);
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={closeModal}>
      <div className="px-4 pb-8 space-y-5">

        {/* タイトル */}
        <div className="pt-1">
          <p
            className="text-[#1e3a0e] text-base font-semibold"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            🎴 自慢の図鑑カード
          </p>
          <p className="text-[#8aaa58] text-xs mt-0.5">シェアしてみんなに見せよう！</p>
        </div>

        {/* カードプレビュー */}
        <div
          ref={cardRef}
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1e3a0e 0%, #2d5016 50%, #3a7020 100%)',
            borderRadius: 16,
            width: 360,
          }}
        >
          {/* ヒーロー画像エリア */}
          <div className="relative w-full" style={{ height: 200 }}>
            {heroImage ? (
              <Image
                src={heroImage}
                alt={displayName ?? '調査中'}
                fill
                className="object-cover"
                sizes="384px"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1a2e0a]">
                <span className="text-6xl">🌿</span>
              </div>
            )}
            {/* グラデーションオーバーレイ */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(10,25,5,0.85) 100%)',
              }}
            />
            {/* 画像上の名前・バッジ */}
            <div className="absolute bottom-3 left-4 right-4">
              {isInvestigating ? (
                <p className="text-white/60 text-base italic">調査中</p>
              ) : (
                <p
                  className="text-white text-xl font-semibold leading-tight"
                  style={{ fontFamily: "'Shippori Mincho', serif" }}
                >
                  {displayName}
                </p>
              )}
              {plant.scientificName && (
                <p className="text-white/50 text-xs mt-0.5">{plant.scientificName}</p>
              )}
              <span
                className="inline-block mt-1 bg-white/20 text-white/90 text-xs rounded-full"
                style={{ padding: '2px 8px', whiteSpace: 'nowrap' }}
              >
                {badge.label}
              </span>
            </div>
          </div>

          {/* 下部情報エリア */}
          <div className="px-4 py-3">
            {/* 愛情度バー */}
            <div className="mb-3">
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
            <div className="flex gap-1.5 flex-wrap">
              {plant.color && (
                <span className="bg-white/15 text-white/80 text-[11px] px-2 py-0.5 rounded-full">
                  {plant.color}
                </span>
              )}
              {plant.smell && (
                <span className="bg-white/15 text-white/80 text-[11px] px-2 py-0.5 rounded-full">
                  {plant.smell}
                </span>
              )}
              {plant.texture && (
                <span className="bg-white/15 text-white/80 text-[11px] px-2 py-0.5 rounded-full">
                  {plant.texture}
                </span>
              )}
              <span className="bg-white/15 text-white/80 text-[11px] px-2 py-0.5 rounded-full">
                発見{days}日目
              </span>
              <span className="bg-white/15 text-white/80 text-[11px] px-2 py-0.5 rounded-full">
                観察{plant.affectionLevel}回
              </span>
            </div>

            {/* ウォーターマーク */}
            <p
              className="text-right text-white/20 text-xs mt-3"
              style={{ fontFamily: "'Shippori Mincho', serif" }}
            >
              おしばな
            </p>
          </div>
        </div>

        {/* シェアボタングリッド */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleShareTo('x')}
            className="bg-black text-white text-sm py-3 rounded-xl font-medium"
          >
            𝕏 でシェア
          </button>
          <button
            onClick={() => handleShareTo('instagram')}
            className="text-white text-sm py-3 rounded-xl font-medium"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #fb923c)' }}
          >
            📸 Instagram
          </button>
          <button
            onClick={() => handleShareTo('line')}
            className="bg-[#06c755] text-white text-sm py-3 rounded-xl font-medium"
          >
            💬 LINE
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="bg-[#f0f8e4] text-[#2d5016] text-sm py-3 rounded-xl font-medium border border-[#cde0b0] disabled:opacity-60"
          >
            {saveStatus === 'saving' ? '保存中...' : saveStatus === 'done' ? '✅ 保存しました！' : '⬇️ 保存'}
          </button>
        </div>

        {/* 閉じるボタン */}
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
