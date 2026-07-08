'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { useAppStore } from '@/store/appStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { supabase } from '@/lib/supabase';
import { dummyPlants } from '@/lib/dummyData';

function getTodayFormatted(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export default function ObservationModal() {
  const activeModal = useAppStore((s) => s.activeModal);
  const selectedPlantId = useAppStore((s) => s.selectedPlantId);
  const closeModal = useAppStore((s) => s.closeModal);

  const isOpen = activeModal === 'observation';

  const plant = selectedPlantId
    ? dummyPlants.find((p) => p.id === selectedPlantId) ?? null
    : null;

  const plantLabel = plant?.nickname ?? plant?.name ?? null;

  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);
    setSelectedFile(compressedFile);
    setPreviewUrl(URL.createObjectURL(compressedFile));
  }

  function handleClose() {
    setComment('');
    setIsPublic(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setLoading(false);
    closeModal();
  }

  async function handleSubmit() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedPlantId) { setLoading(false); return; }

    let imageUrl: string | null = null;

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/obs_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('plant-images')
        .upload(fileName, selectedFile);
      if (!uploadError) {
        const { data } = supabase.storage
          .from('plant-images')
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('observation_records').insert({
      plant_id: selectedPlantId,
      date: new Date().toISOString(),
      image_url: imageUrl,
      comment: comment || null,
      is_public: isPublic,
    });

    if (!error) {
      await supabase.rpc('increment_affection', { plant_id: selectedPlantId });
      closeModal();
      window.location.reload();
    }

    setLoading(false);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="px-4 pb-8 space-y-5">

        {/* ② タイトル */}
        <div className="pt-1">
          <p
            className="text-[#1e3a0e] text-base font-semibold"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            📷 今日の記録
          </p>
          <p className="text-[#8aaa58] text-xs mt-0.5">
            {plantLabel ? (
              <>
                <span className="text-[#4a8820] font-medium">{plantLabel}</span>
                {' に会いに行った'}
              </>
            ) : (
              '植物の記録を残そう'
            )}
          </p>
        </div>

        {/* ③ 写真アップロードエリア */}
        <div
          className="relative border-2 border-dashed border-[#b8d890] rounded-2xl h-48 flex flex-col items-center justify-center gap-2 bg-[#f5f8f0] cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <Image src={previewUrl} alt="preview" fill className="object-cover rounded-2xl" />
          ) : (
            <>
              <span className="text-4xl">📷</span>
              <p className="text-[#8aaa58] text-xs">今日の写真を追加</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ④ ひとこと入力 */}
        <div className="space-y-1.5">
          <label className="text-[#1e3a0e] text-xs font-semibold">ひとこと</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="今日も元気そうだった！など、なんでも"
            className="w-full h-24 border border-[#ddeec0] rounded-xl px-3 py-2.5 text-sm text-[#1e3a0e] placeholder-[#c5dea0] outline-none focus:border-[#4a8820] bg-white resize-none"
          />
        </div>

        {/* ⑤ 日付・場所（自動入力・読み取り専用） */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#f5f8f0] rounded-xl px-4 py-3 text-sm text-[#8aaa58]">
              🗓 {getTodayFormatted()}
            </div>
            <div className="flex-1 bg-[#f5f8f0] rounded-xl px-4 py-3 text-sm text-[#8aaa58] truncate">
              📍 現在地を取得中...
            </div>
          </div>
          <p className="text-[#c5dea0] text-xs text-center">自動で記録されます</p>
        </div>

        {/* ⑤-b 共有トグル */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-[#1e3a0e] text-sm">👥 みんなに共有する</span>
            <p className="text-xs text-[#8aaa58] mt-0.5">写真とひとことがみんなに見えます</p>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              isPublic ? 'bg-[#2d5016]' : 'bg-[#ddeec0]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ⑥ ボタン行 */}
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
            {loading ? '記録中...' : '記録する'}
          </button>
        </div>

      </div>
    </BottomSheet>
  );
}
