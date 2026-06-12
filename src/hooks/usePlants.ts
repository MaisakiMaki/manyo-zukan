'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plant } from '@/types';

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlants() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('plants fetch error:', error);
        return;
      }

      const mapped: Plant[] = (data ?? []).map((p) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        nickname: p.nickname,
        scientificName: p.scientific_name,
        mainImageUrl: p.main_image_url,
        smell: p.smell,
        texture: p.texture,
        color: p.color,
        isOshi: p.is_oshi,
        affectionLevel: p.affection_level,
        latitude: p.latitude,
        longitude: p.longitude,
        isPublic: p.is_public,
        createdAt: p.created_at,
      }));

      setPlants(mapped);
      setLoading(false);
    }

    fetchPlants();
  }, []);

  return { plants, loading };
}
