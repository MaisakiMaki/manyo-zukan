'use client';

import Image from 'next/image';
import { useAppStore } from '@/store/appStore';
import { dummyPlants, dummyObservations } from '@/lib/dummyData';
import { ObservationRecord } from '@/types';

// 植物ごとの最新観察記録を取得
function getLatestObs(plantId: string): ObservationRecord | null {
  const obs = dummyObservations
    .filter((o) => o.plantId === plantId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return obs[0] ?? null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export default function GardenMode() {
  const openModal = useAppStore((s) => s.openModal);

  const oshiPlant = dummyPlants.find((p) => p.isOshi) ?? null;
  const otherPlants = dummyPlants.filter((p) => !p.isOshi);

  const oshiObs = oshiPlant ? getLatestObs(oshiPlant.id) : null;
  const oshiImageUrl = oshiObs?.imageUrl ?? oshiPlant?.mainImageUrl ?? null;
  const oshiDate = oshiObs?.date ?? oshiPlant?.createdAt ?? null;

  return (
    <div className="flex flex-col flex-1" style={{ background: '#080e04' }}>

      {/* ① 推し植物の前回写真（全画面風） */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '60svh' }}
        onClick={() => oshiPlant && openModal('detail', oshiPlant.id)}
      >
        {oshiImageUrl ? (
          <Image
            src={oshiImageUrl}
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'saturate(0.72) brightness(0.85)' }}
            sizes="384px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-[#1a2e0a]" />
        )}

        {/* グラデーションオーバーレイ */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 18%, transparent 60%, rgba(0,0,0,0.52) 100%)',
          }}
        />

        {/* 前回日付（右下、超薄く） */}
        {oshiDate && (
          <p
            className="absolute bottom-3 right-4"
            style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.32)',
              letterSpacing: '0.16em',
            }}
          >
            {formatDate(oshiDate)}
          </p>
        )}
      </div>

      {/* ② 区切り線 */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* ③ 他の植物グリッド（2列） */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: '#080e04', padding: 12 }}
      >
        <div className="grid grid-cols-2 gap-2">
          {otherPlants.map((plant) => {
            const obs = getLatestObs(plant.id);
            const imageUrl = obs?.imageUrl ?? plant.mainImageUrl;
            const isInvestigating = plant.name === null;
            const filterStyle = isInvestigating
              ? 'saturate(0.3) brightness(0.6)'
              : 'saturate(0.68) brightness(0.78)';

            return (
              <button
                key={plant.id}
                onClick={() => openModal('detail', plant.id)}
                className="relative overflow-hidden"
                style={{ borderRadius: 7, height: 96 }}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    style={{ filter: filterStyle }}
                    sizes="192px"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: '#1a2e0a' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
