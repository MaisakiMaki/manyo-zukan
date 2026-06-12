'use client';

import { useAppStore } from '@/store/appStore';
import { useGarden } from '@/hooks/useGarden';
import { usePlants } from '@/hooks/usePlants';
import { Plant } from '@/types';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import OshiCard from '@/components/home/OshiCard';
import CollectionTimeline from '@/components/home/CollectionTimeline';
import GardenMode from '@/components/home/GardenMode';
import InvestigatingTab from '@/components/tabs/InvestigatingTab';
import SocialTab from '@/components/tabs/SocialTab';
import ForestTab from '@/components/tabs/ForestTab';
import PlantDetailModal from '@/components/modals/PlantDetailModal';
import RegisterModal from '@/components/modals/RegisterModal';
import ObservationModal from '@/components/modals/ObservationModal';
import NamingModal from '@/components/modals/NamingModal';
import ShareCardModal from '@/components/modals/ShareCardModal';

function HomeContent({ plants, loading }: { plants: Plant[]; loading: boolean }) {
  if (loading) {
    return (
      <p className="text-[#8aaa58] text-sm text-center mt-8">読み込み中...</p>
    );
  }

  if (plants.length === 0) {
    return (
      <p className="text-[#8aaa58] text-sm text-center mt-8">
        まだ植物が登録されていません
      </p>
    );
  }

  const oshiPlant = plants.find((p) => p.isOshi) ?? null;

  return (
    <div className="px-4 py-4 space-y-5">
      <section>
        {oshiPlant ? (
          <OshiCard plant={oshiPlant} />
        ) : (
          <div className="border-2 border-dashed border-[#ddeec0] rounded-2xl h-28 flex flex-col items-center justify-center gap-1 bg-[#fafcf7]">
            <span className="text-2xl">⭐</span>
            <p className="text-[#8aaa58] text-xs">推し植物を設定しよう</p>
            <p className="text-[#c5dea0] text-xs">植物の詳細から「推しにする」を選んでね</p>
          </div>
        )}
      </section>
      <section>
        <h2 className="text-[#1e3a0e] text-sm font-semibold mb-3">
          コレクション
          <span className="text-[#8aaa58] font-normal ml-1">{plants.length}種</span>
        </h2>
        <CollectionTimeline plants={plants} />
      </section>
    </div>
  );
}

export default function Home() {
  useGarden();

  const { plants, loading } = usePlants();
  const activeTab = useAppStore((s) => s.activeTab);
  const isInGarden = useAppStore((s) => s.isInGarden);

  return (
    <div className="flex flex-col flex-1">
      {!(activeTab === 'home' && isInGarden) && <Header />}

      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          isInGarden ? <GardenMode /> : <HomeContent plants={plants} loading={loading} />
        )}
        {activeTab === 'investigating' && <InvestigatingTab />}
        {activeTab === 'social' && <SocialTab />}
        {activeTab === 'forest' && <ForestTab />}
      </main>

      <BottomNav />

      {/* モーダル群 */}
      <PlantDetailModal />
      <RegisterModal />
      <ObservationModal />
      <NamingModal />
      <ShareCardModal />
    </div>
  );
}
