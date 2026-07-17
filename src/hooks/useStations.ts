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
  const [reloadKey, setReloadKey] = useState(0); // 값이 바뀌면 아래 effect가 다시 실행 → 재요청

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
  }, [reloadKey]);

  // 실패 시 재시도: 상태를 초기화하고 다시 요청 (실패 시 cache는 비어 있어 effect가 재요청함)
  function retry() {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }

  return { stations, loading, error, retry };
}
