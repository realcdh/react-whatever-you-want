import { useState, useEffect } from "react";
import type { Station } from "../types/station.ts";
import { fetchStations } from "../api/subwayApi.ts";


let cache: Station[] | null = null;
let inflight: Promise<Station[]> | null = null;

function loadStations(): Promise<Station[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchStations()
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inflight = null; 
      });
  }
  return inflight;
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let ignore = false; // 화면을 벗어난 뒤 상태 변경 방지

    loadStations()
      .then((data) => {
        if (!ignore) setStations(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { stations, loading, error };
}
