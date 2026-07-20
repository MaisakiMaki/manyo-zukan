'use client';

import { useRef, useState, useEffect } from 'react';
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
  const [heroBase64, setHeroBase64] = useState<string | null>(null);

  const plant = selectedPlantId
    ? plants.find((p) => p.id === selectedPlantId) ?? null
    : null;

  const latestObs = observations[0] ?? null;
  const heroImage = plant ? (latestObs?.imageUrl ?? plant.mainImageUrl ?? null) : null;

  useEffect(() => {
    setHeroBase64(null);
    if (!heroImage) return;

    let cancelled = false;

    async function convertToBase64() {
      try {
        const response = await fetch(heroImage + '?t=' + Date.now());
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled) {
            setHeroBase64(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('画像変換エラー:', err);
        if (!cancelled) {
          setHeroBase64('ERROR:' + (err instanceof Error ? err.message : String(err)));
        }
      }
    }

    convertToBase64();

    return () => { cancelled = true; };
  }, [heroImage]);

  if (!plant) return null;

  const displayName = plant.nickname ?? plant.name;
  const isInvestigating = plant.name === null && plant.nickname === null;
  const badge = getBadge(plant.affectionLevel);
  const days = getDaysSince(plant.createdAt);
  const affectionPct = Math.min(100, (plant.affectionLevel / 10) * 100);

  async function waitForImagesLoaded(element: HTMLElement) {
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  }

  async function handleSave() {
    if (!cardRef.current) return;
    setSaveStatus('saving');

    try {
      await waitForImagesLoaded(cardRef.current);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 360,
      });

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS && navigator.share) {
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File(
          [blob],
          `${plant?.nickname ?? '植物'}の図鑑カード.png`,
          { type: 'image/png' }
        );
        await navigator.share({ files: [file] });
      } else {
        const link = document.createElement('a');
        link.download = `${plant?.nickname ?? '植物'}の図鑑カード.png`;
        link.href = dataUrl;
        link.click();
      }

      setSaveStatus('done');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (err) {
      console.error('save error:', err);
      setSaveStatus('idle');
    }
  }

  async function handleShare() {
    try {
      const shareUrl = 'https://manyo-zukan.vercel.app';
      const shareText = `${plant?.nickname ?? '植物'}の変化を記録しています🌿\nおしばな - ${shareUrl}`;

      if (navigator.share) {
        await navigator.share({
          title: 'おしばな',
          text: shareText,
        });
      } else {
        window.open(
          'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText),
          '_blank'
        );
      }
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
            <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 999, background: 'yellow', color: 'black', fontSize: 8, padding: 2 }}>
              heroImage: {heroImage ? 'あり' : 'なし'} / heroBase64: {heroBase64 ? `あり(${heroBase64.length})` : 'なし'}
            </div>
            {heroBase64 && !heroBase64.startsWith('ERROR:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroBase64}
                alt={displayName ?? '調査中'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : heroBase64?.startsWith('ERROR:') ? (
              <div className="w-full h-full flex items-center justify-center bg-red-900 p-4">
                <span className="text-white text-xs text-center">{heroBase64}</span>
              </div>
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

        {/* ボタン */}
        <div className="space-y-2">
          <button
            onClick={handleShare}
            className="w-full bg-[#2d5016] text-white text-sm py-3 rounded-xl font-medium"
          >
            🔗 シェアする
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full bg-[#f0f8e4] text-[#2d5016] text-sm py-3 rounded-xl font-medium border border-[#cde0b0] disabled:opacity-60"
          >
            {saveStatus === 'saving' ? '保存中...' :
             saveStatus === 'done' ? '✅ 保存しました！' : '⬇️ 画像を保存'}
          </button>
        </div>
        <p className="text-xs text-[#8aaa58] text-center">
          iOSはシェアシートからも画像を保存できます
        </p>

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
