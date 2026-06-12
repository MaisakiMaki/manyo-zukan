'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { supabase } from '@/lib/supabase';

export default function NamingModal() {
  const activeModal = useAppStore((s) => s.activeModal);
  const selectedPlantId = useAppStore((s) => s.selectedPlantId);
  const closeModal = useAppStore((s) => s.closeModal);

  const isOpen = activeModal === 'naming';

  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setNickname('');
    setLoading(false);
    closeModal();
  }

  async function handleSubmit() {
    if (!selectedPlantId) return;
    setLoading(true);

    const { error } = await supabase.from('plants').update({
      nickname: nickname || null,
    }).eq('id', selectedPlantId);

    if (!error) {
      closeModal();
      window.location.reload();
    }

    setLoading(false);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="px-4 pb-8 space-y-5">

        {/* タイトル */}
        <div className="pt-1">
          <p
            className="text-[#1e3a0e] text-base font-semibold"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            ✏️ 名付けタイム
          </p>
          <p className="text-[#8aaa58] text-xs mt-0.5">自分だけの特別な名前をつけよう</p>
        </div>

        {/* 愛称入力 */}
        <div className="space-y-1.5">
          <label className="text-[#1e3a0e] text-xs font-semibold">
            愛称（自由につけてOK！）
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例：ふわもこくん"
            className="w-full border border-[#ddeec0] rounded-xl px-3 py-2.5 text-sm text-[#1e3a0e] placeholder-[#c5dea0] outline-none focus:border-[#4a8820] bg-white"
          />
        </div>

        {/* ボタン行 */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 bg-[#f0f8e4] text-[#5a8030] text-sm py-3 rounded-full font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#2d5016] text-white text-sm py-3 rounded-full font-medium disabled:opacity-60"
          >
            {loading ? '保存中...' : '決定！'}
          </button>
        </div>

      </div>
    </BottomSheet>
  );
}
