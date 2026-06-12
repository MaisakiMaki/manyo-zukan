'use client';

import Image from 'next/image';
import { Plant } from '@/types';
import { useAppStore } from '@/store/appStore';

type Props = {
  plants: Plant[];
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function groupByDate(plants: Plant[]): { date: string; plants: Plant[] }[] {
  const sorted = [...plants].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const map = new Map<string, Plant[]>();
  for (const plant of sorted) {
    const key = plant.createdAt;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(plant);
  }
  return Array.from(map.entries()).map(([date, plants]) => ({ date, plants }));
}

export default function CollectionTimeline({ plants }: Props) {
  const openModal = useAppStore((s) => s.openModal);

  if (plants.length === 0) {
    return (
      <p className="text-[#8aaa58] text-sm text-center mt-6">
        まだ植物が登録されていません
      </p>
    );
  }

  const groups = groupByDate(plants);

  return (
  <div className="relative">
    {/* 縦線：全体を貫く */}
    <div className="absolute left-[5px] top-2 bottom-0 w-0.5 bg-[#ddeec0]" />

    <div className="space-y-6">
      {groups.map(({ date, plants: groupPlants }) => (
        <div key={date} className="flex gap-3">

          {/* ドットだけ（縦線は親が担当） */}
          <div className="shrink-0 w-3 h-3 rounded-full bg-[#6aaa30] mt-0.5 z-10" />

          {/* 右：日付＋カード */}
          <div className="flex-1 pb-2">
            <p className="text-[#8aaa58] text-xs mb-2 -mt-0.5">{formatDate(date)}</p>
            <div className="space-y-2">
              {groupPlants.map((plant) => {
                const isInvestigating = plant.name === null && plant.nickname === null;
                const displayName = plant.nickname ?? plant.name;

                return (
                  <div
                    key={plant.id}
                    className="flex items-center gap-3 bg-white rounded-xl px-3 py-3 shadow-sm cursor-pointer active:opacity-70 transition-opacity"
                    onClick={() => openModal('detail', plant.id)}
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#e8f4cc]">
                      {plant.mainImageUrl ? (
                        <Image
                          src={plant.mainImageUrl}
                          alt={displayName ?? '調査中'}
                          fill
                          className={`object-cover ${isInvestigating ? 'saturate-[0.3] brightness-[0.6]' : ''}`}
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🌿</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isInvestigating ? (
                          <p className="text-[#8aaa58] text-sm italic">調査中</p>
                        ) : (
                          <p
                            className="text-[#1e3a0e] font-semibold text-sm truncate"
                            style={{ fontFamily: "'Shippori Mincho', serif" }}
                          >
                            {displayName}
                          </p>
                        )}
                        {plant.isOshi && (
                          <span className="text-[#2d5016] text-xs">★</span>
                        )}
                      </div>
                      {plant.scientificName && (
                        <p className="text-[#8aaa58] text-xs mt-0.5 truncate">{plant.scientificName}</p>
                      )}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {plant.color && (
                          <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5">
                            {plant.color}
                          </span>
                        )}
                        {plant.texture && (
                          <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5">
                            {plant.texture}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ))}
    </div>
  </div>
);
}