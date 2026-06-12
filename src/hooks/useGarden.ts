'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

const GARDEN_LAT = 35.6097354;
const GARDEN_LNG = 139.5566718;
const GARDEN_RADIUS_M = 50;

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGarden() {
  const setIsInGarden = useAppStore((s) => s.setIsInGarden);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const dist = calcDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          GARDEN_LAT,
          GARDEN_LNG
        );
        setIsInGarden(dist <= GARDEN_RADIUS_M);
      },
      (err) => console.warn('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [setIsInGarden]);
}
