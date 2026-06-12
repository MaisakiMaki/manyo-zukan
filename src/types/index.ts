export type Plant = {
  id: string;
  userId: string;
  name: string | null;
  nickname: string | null;
  scientificName: string | null;
  mainImageUrl: string | null;
  smell: string | null;
  texture: string | null;
  color: string | null;
  isOshi: boolean;
  affectionLevel: number;
  latitude: number | null;
  longitude: number | null;
  isPublic: boolean;
  createdAt: string;
};

export type ObservationRecord = {
  id: string;
  plantId: string;
  date: string;
  imageUrl: string | null;
  comment: string | null;
};

export type Tab = 'home' | 'investigating' | 'social' | 'forest';

export type Modal =
  | 'detail'
  | 'register'
  | 'naming'
  | 'observation'
  | 'share'
  | null;
