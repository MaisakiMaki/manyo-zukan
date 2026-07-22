'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';

type PublicObservation = {
  id: string;
  date: string;
  image_url: string | null;
  comment: string | null;
  plant: {
    id: string;
    nickname: string | null;
    name: string | null;
    color: string | null;
    smell: string | null;
    texture: string | null;
  };
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今日';
  if (days === 1) return '1日前';
  return `${days}日前`;
}

export default function SocialTab() {
  const [posts, setPosts] = useState<PublicObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTab = useAppStore((s) => s.activeTab);

  useEffect(() => {
    if (activeTab !== 'social') return;

    async function fetchPosts() {
      const { data, error } = await supabase
        .from('observation_records')
        .select(`
          id,
          date,
          image_url,
          comment,
          plant:plants(id, nickname, name, color, smell, texture, user_id)
        `)
        .eq('is_public', true)
        .order('date', { ascending: false })
        .limit(20);

      if (error) {
        console.error('fetch error:', error);
        setLoading(false);
        return;
      }

      setPosts((data as unknown as PublicObservation[]) ?? []);
      setLoading(false);
    }

    fetchPosts();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#8aaa58] text-sm">読み込み中...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="px-4 py-4">
        <h2
          className="text-[#1e3a0e] text-base font-semibold mb-6"
          style={{ fontFamily: "'Shippori Mincho', serif" }}
        >
          みんなの新発見
        </h2>
        <p className="text-[#8aaa58] text-sm text-center py-12">
          まだ共有された発見がありません
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <h2
        className="text-[#1e3a0e] text-base font-semibold"
        style={{ fontFamily: "'Shippori Mincho', serif" }}
      >
        みんなの新発見
      </h2>

      {posts.map((post) => {
        const plantName = post.plant.nickname ?? post.plant.name ?? '調査中';
        const tags = [post.plant.color, post.plant.smell, post.plant.texture].filter(Boolean) as string[];

        return (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">

            {/* 投稿日時 */}
            <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
              <div className="w-8 h-8 rounded-full bg-[#e8f4cc] flex items-center justify-center text-sm font-medium text-[#2d5016] shrink-0">
                🌿
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#8aaa58] text-xs">{getTimeAgo(post.date)}</p>
              </div>
            </div>

            {/* 写真 */}
            {post.image_url && (
              <div className="relative w-full h-48">
                <Image
                  src={post.image_url}
                  alt={plantName}
                  fill
                  className="object-cover saturate-[0.9]"
                  sizes="384px"
                />
              </div>
            )}

            {/* 本文エリア */}
            <div className="p-3 space-y-1.5">
              {/* 植物名 */}
              <p
                className="text-[#1e3a0e] font-bold text-base leading-tight"
                style={{ fontFamily: "'Shippori Mincho', serif" }}
              >
                {plantName}
              </p>

              {/* コメント */}
              {post.comment && (
                <p className="text-sm text-[#4a6030] mt-1">{post.comment}</p>
              )}

              {/* タグ行 */}
              {tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#eef8e0] text-[#5a8030] rounded-full text-xs px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
