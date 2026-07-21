'use client';

import { useAppStore } from '@/store/appStore';
import { usePlants } from '@/hooks/usePlants';
import { useObservationsAll } from '@/hooks/useObservationsAll';

export default function ForestTab() {
  const isInGarden = useAppStore((s) => s.isInGarden);
  const setIsInGarden = useAppStore((s) => s.setIsInGarden);

  const { plants } = usePlants();
  const plantIds = plants.map((p) => p.id);
  const { observations } = useObservationsAll(plantIds);

  async function handleNotifyDemo() {
    if (!('Notification' in window)) {
      alert('このブラウザは通知に対応していません');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      alert('通知が許可されていません');
      return;
    }

    const oshiPlant = plants.find((p) => p.isOshi);
    if (!oshiPlant) {
      alert('推し植物が設定されていません');
      return;
    }

    const latestObs = observations
      .filter((o) => o.plantId === oshiPlant.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const imageUrl = latestObs?.imageUrl ?? oshiPlant.mainImageUrl;

    new Notification('おしばな', {
      body: '',
      icon: imageUrl ?? undefined,
      silent: true,
      // @ts-expect-error imageはNotificationOptionsの型定義にないが実際には使えるブラウザがある
      image: imageUrl ?? undefined,
    });
  }
  return (
    <div className="px-4 py-4 space-y-4">

      {/* ===== 気象情報カード ===== */}
      <div className="bg-white rounded-2xl p-4">
        <p className="font-bold text-sm text-[#1e3a0e] mb-3">🌤 現在の森のコンディション</p>

        {/* 3列グリッド */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: '⛅', label: '天気', value: '曇り' },
            { icon: '🌡', label: '気温', value: '24°C' },
            { icon: '💧', label: '湿度', value: '72%' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-[#f5f8f0] rounded-xl p-3 text-center">
              <p className="text-xl">{icon}</p>
              <p className="text-xs text-[#8aaa58] mt-0.5">{label}</p>
              <p className="font-bold text-sm text-[#1e3a0e] mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* 虫発生率バー */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-[#1e3a0e] font-medium">🦟 虫の発生率</p>
            <p className="text-xs font-bold text-[#c04020]">70%</p>
          </div>
          <div className="h-2.5 rounded-full bg-[#ddeec0] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '70%',
                background: 'linear-gradient(90deg, #e8c840, #e08820, #c04020)',
              }}
            />
          </div>
          <p className="text-xs text-[#c04020] mt-1.5">
            ⚠️ 虫除けスプレーを持参することをおすすめします
          </p>
        </div>
      </div>

      {/* ===== マップカード ===== */}
      <div className="bg-white rounded-2xl p-4">
        <p className="font-bold text-sm text-[#1e3a0e] mb-3">🗺 万葉植物園マップ</p>

        <svg
          viewBox="0 0 680 480"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto rounded-xl"
        >
          {/* 背景（芝生） */}
          <rect width="680" height="480" fill="#7ab848" />

          {/* 外周フェンス */}
          <rect
            x="10" y="10" width="660" height="460"
            fill="none" stroke="#5a9030" strokeWidth="3"
            rx="8" strokeDasharray="8,4"
          />

          {/* ===== 道路 ===== */}
          {/* 入口からのヘアピンカーブ坂 */}
          <path
            d="M 320 480 L 320 400 Q 320 365 285 350 L 210 330 Q 165 318 152 275 Q 140 232 162 192 Q 184 152 225 142 L 345 142 Q 395 142 422 163 Q 450 184 450 224 Q 450 264 420 284 Q 392 302 362 302 L 340 302"
            stroke="#d8cc78" strokeWidth="18" fill="none" strokeLinecap="round"
          />

          {/* 池を囲む道 */}
          <ellipse cx="272" cy="242" rx="87" ry="62" fill="#d8cc78" />

          {/* 池 */}
          <ellipse cx="272" cy="242" rx="62" ry="43" fill="#80c0ee" />
          <ellipse cx="272" cy="242" rx="55" ry="36" fill="#90ccf8" />
          <text x="272" y="247" textAnchor="middle" fontSize="14" fill="#2060a0" fontWeight="bold">池</text>

          {/* 野外音楽堂への細い道 */}
          <path
            d="M 415 158 Q 456 132 494 122"
            stroke="#d8cc78" strokeWidth="12" fill="none" strokeLinecap="round"
          />

          {/* 野外音楽堂（半円・扇形） */}
          <path d="M 462 128 A 56 56 0 0 1 572 128 L 517 128 Z" fill="#b8b898" />
          <ellipse cx="517" cy="128" rx="20" ry="13" fill="#a8a880" />
          <text x="517" y="150" textAnchor="middle" fontSize="9" fill="#606050">野外音楽堂</text>

          {/* 畑（畝あり） */}
          <rect x="492" y="272" width="148" height="112" fill="#c8b068" rx="6" />
          {[287, 302, 317, 332, 347, 362, 377].map((y) => (
            <line key={y} x1="492" y1={y} x2="640" y2={y} stroke="#b09050" strokeWidth="1.5" />
          ))}
          <text x="566" y="328" textAnchor="middle" fontSize="12" fill="#806030" fontWeight="bold">畑</text>

          {/* 入口 */}
          <rect x="294" y="428" width="52" height="44" fill="#d8cc78" rx="5" />
          <text x="320" y="455" textAnchor="middle" fontSize="12" fill="#806030" fontWeight="bold">入口</text>

          {/* ===== ベンチ ===== */}
          <rect x="150" y="256" width="20" height="9" fill="#c8a868" rx="2" />
          <rect x="358" y="147" width="20" height="9" fill="#c8a868" rx="2" />
          <rect x="442" y="292" width="20" height="9" fill="#c8a868" rx="2" />
          <rect x="216" y="350" width="20" height="9" fill="#c8a868" rx="2" />

          {/* ===== 木々 ===== */}
          {/* 左上 */}
          <circle cx="88"  cy="78"  r="28" fill="#3d9020" />
          <circle cx="88"  cy="78"  r="21" fill="#4aa028" />
          <circle cx="138" cy="48"  r="23" fill="#3d9020" />
          <circle cx="58"  cy="158" r="26" fill="#4aa028" />
          <circle cx="102" cy="128" r="18" fill="#3d9020" />
          {/* 右上 */}
          <circle cx="592" cy="58"  r="27" fill="#3d9020" />
          <circle cx="632" cy="98"  r="23" fill="#4aa028" />
          <circle cx="642" cy="162" r="21" fill="#3d9020" />
          {/* 上中央 */}
          <circle cx="262" cy="48"  r="21" fill="#3d9020" />
          <circle cx="302" cy="28"  r="17" fill="#4aa028" />
          <circle cx="384" cy="42"  r="19" fill="#3d9020" />
          <circle cx="432" cy="62"  r="17" fill="#4aa028" />
          {/* 左下 */}
          <circle cx="68"  cy="352" r="25" fill="#4aa028" />
          <circle cx="108" cy="402" r="21" fill="#3d9020" />
          <circle cx="58"  cy="432" r="19" fill="#4aa028" />
          {/* 右下 */}
          <circle cx="642" cy="422" r="23" fill="#3d9020" />
          <circle cx="612" cy="458" r="19" fill="#4aa028" />
          {/* 道の脇 */}
          <circle cx="478" cy="342" r="17" fill="#3d9020" />
          <circle cx="464" cy="402" r="19" fill="#4aa028" />
          <circle cx="392" cy="392" r="17" fill="#3d9020" />

          {/* ===== ピン ===== */}
          {/* ⭐ 推し（池の上あたり） */}
          <text x="268" y="180" fontSize="22" textAnchor="middle">⭐</text>
          {/* 🌿 自分の植物（池の左下） */}
          <text x="175" y="298" fontSize="22" textAnchor="middle">🌿</text>
          {/* 🔍 調査中（道の右側） */}
          <text x="434" y="244" fontSize="22" textAnchor="middle">🔍</text>
          {/* 💜 みんなの発見（道の下） */}
          <text x="342" y="368" fontSize="22" textAnchor="middle">💜</text>
        </svg>

        {/* 凡例 */}
        <div className="flex items-center justify-around mt-3 flex-wrap gap-y-1">
          {[
            { icon: '⭐', label: '推し' },
            { icon: '🌿', label: '自分の植物' },
            { icon: '🔍', label: '調査中' },
            { icon: '💜', label: 'みんなの発見' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-base">{icon}</span>
              <span className="text-xs text-[#8aaa58]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 通知デモ */}
      <div className="bg-white rounded-2xl p-4">
        <p className="text-[#1e3a0e] text-sm font-semibold mb-2">
          🔔 推しからのお知らせ（デモ）
        </p>
        <p className="text-xs text-[#8aaa58] mb-3">
          通知を許可すると、推し植物の写真が届きます
        </p>
        <button
          onClick={handleNotifyDemo}
          className="w-full border border-[#2d5016] text-[#2d5016] text-sm py-2.5 rounded-full font-medium"
        >
          今すぐ届けてみる
        </button>
      </div>

      {/* 🧪 開発用テストトグル */}
      <button
        onClick={() => setIsInGarden(!isInGarden)}
        className="text-xs text-[#8aaa58] text-center mt-4 w-full py-2"
      >
        🧪 植物園モードをテスト（現在：{isInGarden ? 'ON' : 'OFF'}）
      </button>

    </div>
  );
}
