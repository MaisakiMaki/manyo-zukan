'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ObservationRecord } from '@/types';

export function useObservations(plantId: string | null) {
  const [observations, setObservations] = useState<ObservationRecord[]>([]);

  useEffect(() => {
    if (!plantId) return;

    async function fetchObservations() {
      const { data, error } = await supabase
        .from('observation_records')
        .select('*')
        .eq('plant_id', plantId)
        .order('date', { ascending: false });

      if (error) {
        console.error('observations fetch error:', error);
        return;
      }

      const mapped: ObservationRecord[] = (data ?? []).map((o) => ({
        id: o.id,
        plantId: o.plant_id,
        date: o.date,
        imageUrl: o.image_url,
        comment: o.comment,
      }));

      setObservations(mapped);
    }

    fetchObservations();
  }, [plantId]);

  return { observations };
}
