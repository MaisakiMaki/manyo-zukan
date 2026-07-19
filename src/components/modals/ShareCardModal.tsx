'use client';

import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
// @ts-expect-error gif.js has no type definitions
import GIF from 'gif.js';
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  const [heroGifUrl, setHeroGifUrl] = useState<string | null>(null);
  const [heroGifBlob, setHeroGifBlob] = useState<Blob | null>(null);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const plant = selectedPlantId
    ? plants.find((p) => p.id === selectedPlantId) ?? null
    : null;

  // base64変換用（最新写真またはmain_image_url）
  const latestObs = observations[0] ?? null;
  const heroImage = plant ? (latestObs?.imageUrl ?? plant.mainImageUrl ?? null) : null;

  // GIF用：最新観察写真 ↔ 登録時メイン写真
  const latestImageUrl = latestObs?.imageUrl ?? null;
  const firstImageUrl = plant?.mainImageUrl ?? null;
  const canMakeGif = !!(latestImageUrl && firstImageUrl && latestImageUrl !== firstImageUrl);

  // 最新写真をbase64変換（保存用フォールバック）
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
      }
    }

    convertToBase64();

    return () => { cancelled = true; };
  }, [heroImage]);

  // GIF生成（最初と最新の観察記録が異なる場合）
  useEffect(() => {
    if (!canMakeGif || !latestImageUrl || !firstImageUrl) return;

    let cancelled = false;
    setHeroGifUrl(null);
    setIsGeneratingGif(true);

    async function generateGif() {
      try {
        // img1 = 最新の観察記録の写真（最初に表示）
        // img2 = 登録時のメイン写真（次に表示）
        const img1 = await loadImage(latestImageUrl!);
        const img2 = await loadImage(firstImageUrl!);

        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 267;
        const ctx = canvas.getContext('2d')!;

        const gif = new GIF({
          workers: 2,
          quality: 5,
          width: 480,
          height: 267,
          workerScript: '/gif.worker.js',
          repeat: 0,
          dither: 'FloydSteinberg',
        });

        const fadeSteps = 8;

        function drawCrossfade(from: HTMLImageElement, to: HTMLImageElement, alpha: number) {
          ctx.clearRect(0, 0, 480, 267);
          ctx.globalAlpha = 1 - alpha;
          ctx.drawImage(from, 0, 0, 480, 267);
          ctx.globalAlpha = alpha;
          ctx.drawImage(to, 0, 0, 480, 267);
          ctx.globalAlpha = 1;
        }

        // フレーム1：最新の写真を静止表示
        ctx.clearRect(0, 0, 480, 267);
        ctx.globalAlpha = 1;
        ctx.drawImage(img1, 0, 0, 480, 267);
        gif.addFrame(ctx, { copy: true, delay: 1000 });

        // 最新 → 登録時 クロスフェード
        for (let i = 1; i <= fadeSteps; i++) {
          drawCrossfade(img1, img2, i / fadeSteps);
          gif.addFrame(ctx, { copy: true, delay: 80 });
        }

        // フレーム：登録時の写真を静止表示
        ctx.clearRect(0, 0, 480, 267);
        ctx.globalAlpha = 1;
        ctx.drawImage(img2, 0, 0, 480, 267);
        gif.addFrame(ctx, { copy: true, delay: 1500 });

        // 登録時 → 最新 クロスフェード（戻り）
        for (let i = 1; i <= fadeSteps; i++) {
          drawCrossfade(img2, img1, i / fadeSteps);
          gif.addFrame(ctx, { copy: true, delay: 80 });
        }

        gif.on('finished', (blob: Blob) => {
          if (!cancelled) {
            const url = URL.createObjectURL(blob);
            setHeroGifUrl(url);
            setHeroGifBlob(blob);
            setIsGeneratingGif(false);
          }
        });

        gif.render();
      } catch (err) {
        console.error('GIF生成エラー:', err);
        if (!cancelled) {
          setIsGeneratingGif(false);
        }
      }
    }

    generateGif();

    return () => { cancelled = true; };
  }, [canMakeGif, latestImageUrl, firstImageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!plant) return null;

  const displayName = plant.nickname ?? plant.name;
  const isInvestigating = plant.name === null && plant.nickname === null;
  const badge = getBadge(plant.affectionLevel);
  const days = getDaysSince(plant.createdAt);
  const affectionPct = Math.min(100, (plant.affectionLevel / 10) * 100);

  async function handleSave() {
    setSaveStatus('saving');

    try {
      let blob: Blob;
      let filename: string;

      if (heroGifBlob) {
        // GIFがある場合はGIFをそのまま保存
        blob = heroGifBlob;
        filename = `${plant?.nickname ?? '植物'}の図鑑カード.gif`;
      } else {
        // GIFがない場合はPNGでキャプチャ
        if (!cardRef.current) return;
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          width: 360,
        });
        blob = await fetch(dataUrl).then(r => r.blob());
        filename = `${plant?.nickname ?? '植物'}の図鑑カード.png`;
      }

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS && navigator.share) {
        const file = new File([blob], filename, { type: blob.type });
        await navigator.share({ files: [file] });
      } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
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
            {(!isCapturing && heroGifUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroGifUrl}
                alt={displayName ?? '調査中'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (!isCapturing && isGeneratingGif) ? (
              <div className="w-full h-full flex items-center justify-center bg-[#1a2e0a]">
                <span className="text-white/50 text-sm">GIF生成中...</span>
              </div>
            ) : heroBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroBase64}
                alt={displayName ?? '調査中'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
