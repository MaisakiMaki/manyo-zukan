'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/store/appStore';
import BottomSheet from '@/components/ui/BottomSheet';
import { supabase } from '@/lib/supabase';

// --- カラー定義 ---
const COLOR_OPTIONS = [
  { label: '白', bg: '#ffffff', border: '#ddeec0' },
  { label: '赤', bg: '#f87171', border: '#f87171' },
  { label: '黄', bg: '#fbbf24', border: '#fbbf24' },
  { label: 'ピンク', bg: '#f9a8d4', border: '#f9a8d4' },
  { label: '紫', bg: '#c084fc', border: '#c084fc' },
  { label: '緑', bg: '#4ade80', border: '#4ade80' },
];

const SMELL_OPTIONS = ['甘い香り', '草っぽい', '無臭'];
const TEXTURE_OPTIONS = ['つるつる', 'ざらざら', 'ふわふわ', 'かたい'];

export default function RegisterModal() {
  const activeModal = useAppStore((s) => s.activeModal);
  const closeModal = useAppStore((s) => s.closeModal);

  const isOpen = activeModal === 'register';

  // フォーム状態
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSmells, setSelectedSmells] = useState<string[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [useLocation, setUseLocation] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function toggleChip<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
  }

  function handleClose() {
    setNickname('');
    setSelectedColor(null);
    setSelectedSmells([]);
    setSelectedTextures([]);
    setMemo('');
    setUseLocation(true);
    setIsPublic(true);
    setLoading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    closeModal();
  }

  async function handleSubmit() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let imageUrl: string | null = null;

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

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

    const { error } = await supabase.from('plants').insert({
      user_id: user.id,
      nickname: nickname || null,
      name: null,
      smell: selectedSmells.length > 0 ? selectedSmells.join(',') : null,
      texture: selectedTextures.length > 0 ? selectedTextures.join(',') : null,
      color: selectedColor || null,
      is_oshi: false,
      affection_level: 1,
      is_public: isPublic,
      main_image_url: imageUrl,
    });

    if (error) {
      console.error('insert error:', error);
      setLoading(false);
      return;
    }

    closeModal();
    window.location.reload();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <div className="px-4 pb-8 space-y-5">

        {/* ② タイトル */}
        <div className="pt-1">
          <p className="text-[#1e3a0e] text-base font-semibold" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            🌿 新しい植物を登録
          </p>
          <p className="text-[#8aaa58] text-xs mt-0.5">発見した植物を記録しよう</p>
        </div>

        {/* ③ 写真アップロードエリア */}
        <div
          className="relative border-2 border-dashed border-[#b8d890] rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer bg-[#f5f8f0]"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <Image src={previewUrl} alt="preview" fill className="object-cover rounded-2xl" />
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <span className="text-sm text-[#8aaa58] mt-1">写真を追加</span>
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

        {/* ④ 愛称入力 */}
        <div className="space-y-1.5">
          <label className="text-[#1e3a0e] text-xs font-semibold">愛称（後でもOK）</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="まだわからなければ空欄でも"
            className="w-full border border-[#ddeec0] rounded-xl px-3 py-2.5 text-sm text-[#1e3a0e] placeholder-[#c5dea0] outline-none focus:border-[#4a8820] bg-white"
          />
        </div>

        {/* ⑤ 色の選択 */}
        <div className="space-y-2">
          <label className="text-[#1e3a0e] text-xs font-semibold">色</label>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map((color) => {
              const isSelected = selectedColor === color.label;
              return (
                <button
                  key={color.label}
                  onClick={() => setSelectedColor(isSelected ? null : color.label)}
                  className={`w-8 h-8 rounded-full shrink-0 transition-all ${
                    isSelected ? 'ring-2 ring-[#2d5016] ring-offset-1' : ''
                  }`}
                  style={{
                    backgroundColor: color.bg,
                    border: `1.5px solid ${color.border}`,
                  }}
                  title={color.label}
                />
              );
            })}
          </div>
          {selectedColor && (
            <p className="text-[#8aaa58] text-xs">{selectedColor} を選択中</p>
          )}
        </div>

        {/* ⑥ 匂いのChips */}
        <div className="space-y-2">
          <label className="text-[#1e3a0e] text-xs font-semibold">匂い</label>
          <div className="flex flex-wrap gap-2">
            {SMELL_OPTIONS.map((smell) => {
              const isSelected = selectedSmells.includes(smell);
              return (
                <button
                  key={smell}
                  onClick={() => setSelectedSmells(toggleChip(selectedSmells, smell))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    isSelected
                      ? 'bg-[#e8f4cc] border-[#4a8820] text-[#2d5016] font-medium'
                      : 'bg-white border-[#ddeec0] text-[#8aaa58]'
                  }`}
                >
                  {smell}
                </button>
              );
            })}
            <button className="text-xs px-3 py-1.5 rounded-full border border-dashed border-[#ddeec0] text-[#8aaa58]">
              ＋ 追加
            </button>
          </div>
        </div>

        {/* ⑦ 手触りのChips */}
        <div className="space-y-2">
          <label className="text-[#1e3a0e] text-xs font-semibold">手触り</label>
          <div className="flex flex-wrap gap-2">
            {TEXTURE_OPTIONS.map((texture) => {
              const isSelected = selectedTextures.includes(texture);
              return (
                <button
                  key={texture}
                  onClick={() => setSelectedTextures(toggleChip(selectedTextures, texture))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    isSelected
                      ? 'bg-[#e8f4cc] border-[#4a8820] text-[#2d5016] font-medium'
                      : 'bg-white border-[#ddeec0] text-[#8aaa58]'
                  }`}
                >
                  {texture}
                </button>
              );
            })}
            <button className="text-xs px-3 py-1.5 rounded-full border border-dashed border-[#ddeec0] text-[#8aaa58]">
              ＋ 追加
            </button>
          </div>
        </div>

        {/* ⑧ メモ入力 */}
        <div className="space-y-1.5">
          <label className="text-[#1e3a0e] text-xs font-semibold">今日のメモ（任意）</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="どんな場所で見つけた？"
            rows={3}
            className="w-full h-20 border border-[#ddeec0] rounded-xl px-3 py-2.5 text-sm text-[#1e3a0e] placeholder-[#c5dea0] outline-none focus:border-[#4a8820] bg-white resize-none"
          />
        </div>

        {/* ⑨ 位置情報トグル */}
        <div className="flex items-center justify-between py-1">
          <span className="text-[#1e3a0e] text-sm">📍 位置情報を使う</span>
          <button
            onClick={() => setUseLocation(!useLocation)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              useLocation ? 'bg-[#2d5016]' : 'bg-[#ddeec0]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                useLocation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ⑩ ボタン行 */}
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
            {loading ? '登録中...' : '登録する'}
          </button>
        </div>

      </div>
    </BottomSheet>
  );
}
