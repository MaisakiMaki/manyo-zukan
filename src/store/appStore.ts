import { create } from 'zustand';
import { Plant, Tab, Modal } from '@/types';

type User = { id: string; email: string };

type AppStore = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  activeModal: Modal;
  selectedPlantId: string | null;
  openModal: (modal: Modal, plantId?: string) => void;
  closeModal: () => void;

  isInGarden: boolean;
  setIsInGarden: (value: boolean) => void;

  plants: Plant[];

  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  activeModal: null,
  selectedPlantId: null,
  openModal: (modal, plantId) =>
    set({ activeModal: modal, selectedPlantId: plantId ?? null }),
  closeModal: () => set({ activeModal: null, selectedPlantId: null }),

  isInGarden: false,
  setIsInGarden: (value) => set({ isInGarden: value }),

  plants: [],

  user: null,
  setUser: (user) => set({ user }),
}));
