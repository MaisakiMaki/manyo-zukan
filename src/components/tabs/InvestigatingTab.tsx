'use client';

import Image from 'next/image';
import { useAppStore } from '@/store/appStore';
import { dummyPlants } from '@/lib/dummyData';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export default function InvestigatingTab() {
  const openModal = useAppStore((s) => s.openModal);

  const investigatingPlants = dummyPlants.filter((p) => p.name === null);

  return (
    <div className="px-4 py-4">
      <p className="text-sm text-[#8aaa58] text-center mb-4">
        まだ名前のついていない植物たち
      </p>

      {investigatingPlants.length === 0 ? (
        <p className="text-[#8aaa58] text-sm text-center mt-8">
          調査中の植物はいません
        </p>
      ) : (
        <div className="space-y-3">
          {investigatingPlants.map((plant) => (
            <div
              key={plant.id}
              className="flex bg-white rounded-2xl overflow-hidden shadow-sm"
              style={{ minHeight: 96 }}
            >
              {/* 左：画像 */}
              <div className="relative w-28 shrink-0">
                {plant.mainImageUrl ? (
                  <Image
                    src={plant.mainImageUrl}
                    alt="調査中"
                    fill
                    className="object-cover saturate-[0.8]"
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#e8f4cc] flex items-center justify-center">
                    <span className="text-3xl">🌿</span>
                  </div>
                )}
              </div>

              {/* 右：テキスト情報 */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  {/* 調査中バッジ */}
                  <span className="bg-[#fdf0d8] text-[#7a5010] rounded-full text-xs px-2 py-0.5">
                    🔍 調査中
                  </span>

                  {/* 登録日 */}
                  <p className="text-xs text-[#8aaa58] mt-1">
                    登録日：{formatDate(plant.createdAt)}
                  </p>

                  {/* タグ行 */}
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {plant.color && (
                      <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5">
                        {plant.color}
                      </span>
                    )}
                    {plant.smell && (
                      <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5">
                        {plant.smell}
                      </span>
                    )}
                    {plant.texture && (
                      <span className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5">
                        {plant.texture}
                      </span>
                    )}
                  </div>
                </div>

                {/* 名付けボタン */}
                <button
                  onClick={() => openModal('naming', plant.id)}
                  className="self-start border border-[#2d5016] text-[#2d5016] text-xs rounded-full px-3 py-1 mt-2"
                >
                  ✏️ 名付けする
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
