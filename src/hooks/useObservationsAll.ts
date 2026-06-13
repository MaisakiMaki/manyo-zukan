'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ObservationRecord } from '@/types';

export function useObservationsAll(plantIds: string[]) {
  const [observations, setObservations] = useState<ObservationRecord[]>([]);

  useEffect(() => {
    if (plantIds.length === 0) return;

    async function fetchAll() {
      const { data, error } = await supabase
        .from('observation_records')
        .select('*')
        .in('plant_id', plantIds)
        .order('date', { ascending: false });

      if (error) return;

      const mapped: ObservationRecord[] = (data ?? []).map((o) => ({
        id: o.id,
        plantId: o.plant_id,
        date: o.date,
        imageUrl: o.image_url,
        comment: o.comment,
      }));

      setObservations(mapped);
    }

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantIds.join(',')]);

  return { observations };
}
