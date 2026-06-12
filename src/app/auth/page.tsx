'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f8f0] px-6">

      {/* ロゴ */}
      <div className="text-center mb-8">
        <h1
          className="text-2xl text-[#1e3a0e]"
          style={{ fontFamily: "'Shippori Mincho', serif" }}
        >
          万葉植物図鑑
        </h1>
        <p className="text-sm text-[#8aaa58] mt-1">自分だけの植物図鑑を育てよう</p>
      </div>

      {/* タブ切替 */}
      <div className="flex w-full max-w-xs bg-[#e8f4cc] rounded-xl p-1 mb-6">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${
              mode === m
                ? 'bg-white text-[#2d5016] shadow-sm'
                : 'text-[#8aaa58]'
            }`}
          >
            {m === 'login' ? 'ログイン' : '新規登録'}
          </button>
        ))}
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-[#1e3a0e] font-medium">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@email.com"
            className="w-full border border-[#ddeec0] rounded-xl px-4 py-3 text-sm text-[#1e3a0e] placeholder-[#c5dea0] outline-none focus:border-[#4a8820] bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[#1e3a0e] font-medium">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="6文字以上"
            className="w-full border border-[#ddeec0] rounded-xl px-4 py-3 text-sm text-[#1e3a0e] placeholder-[#c5dea0] outline-none focus:border-[#4a8820] bg-white"
          />
        </div>

        {/* エラーメッセージ */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2d5016] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-60 mt-2"
        >
          {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
        </button>
      </form>

    </div>
  );
}
