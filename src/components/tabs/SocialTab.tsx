'use client';

import Image from 'next/image';
import { useAppStore } from '@/store/appStore';
import { dummyPosts } from '@/lib/dummyData';

export default function SocialTab() {
  const openModal = useAppStore((s) => s.openModal);

  return (
    <div className="px-4 py-4 space-y-4">
      <h2
        className="text-[#1e3a0e] text-base font-semibold"
        style={{ fontFamily: "'Shippori Mincho', serif" }}
      >
        みんなの新発見
      </h2>

      {dummyPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">

          {/* ユーザー行 */}
          <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
            <div className="w-10 h-10 rounded-full bg-[#e8f4cc] flex items-center justify-center text-xl shrink-0">
              {post.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1e3a0e] text-sm font-medium">{post.username}</p>
              <p className="text-[#8aaa58] text-xs">{post.timeAgo}</p>
            </div>
          </div>

          {/* 写真 */}
          <div className="relative w-full h-48">
            <Image
              src={post.plant.imageUrl}
              alt={post.plant.name}
              fill
              className="object-cover saturate-[0.9]"
              sizes="384px"
            />
          </div>

          {/* 本文エリア */}
          <div className="p-3 space-y-1.5">
            {/* 植物名・学名 */}
            <p
              className="text-[#1e3a0e] font-bold text-base leading-tight"
              style={{ fontFamily: "'Shippori Mincho', serif" }}
            >
              {post.plant.name}
            </p>
            <p className="text-xs text-[#8aaa58]">{post.plant.scientificName}</p>

            {/* コメント */}
            <p className="text-sm text-[#4a6030] mt-1">{post.comment}</p>

            {/* タグ行 */}
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              {post.plant.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* アクション行 */}
            <div className="flex items-center gap-3 pt-1">
              <button className="flex items-center gap-1 text-[#8aaa58] text-sm">
                <span>❤️</span>
                <span className="text-xs">{post.likes}</span>
              </button>
              <button className="text-[#8aaa58] text-sm">💬</button>
              <div className="flex-1" />
              <button
                onClick={() => openModal('share', post.id)}
                className="border border-[#2d5016] text-[#2d5016] text-xs rounded-full px-3 py-1"
              >
                🎴 カードを見る
              </button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
