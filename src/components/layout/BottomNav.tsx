'use client';

import { useAppStore } from '@/store/appStore';
import { Tab } from '@/types';

type NavItem = {
  id: Tab;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'マイ図鑑', icon: '🌿' },
  { id: 'investigating', label: '調査中', icon: '🔍' },
  { id: 'social', label: 'みんな', icon: '👥' },
  { id: 'forest', label: '森の状態', icon: '🌳' },
];

export default function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const isInGarden = useAppStore((s) => s.isInGarden);

  return (
    <nav
      className="flex border-t transition-colors duration-300"
      style={
        isInGarden
          ? { background: '#050a02', borderColor: 'rgba(255,255,255,0.05)' }
          : { background: '#ffffff', borderColor: '#ddeec0' }
      }
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        const labelColor = isInGarden
          ? isActive
            ? 'rgba(255,255,255,0.65)'
            : 'rgba(255,255,255,0.22)'
          : isActive
          ? '#2d5016'
          : '#8aaa58';

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span
              style={{ color: labelColor }}
              className={isActive ? 'font-semibold' : ''}
            >
              {item.label}
            </span>
            {/* アクティブドット */}
            {isActive && (
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: isInGarden ? '#8ab840' : '#2d5016' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
