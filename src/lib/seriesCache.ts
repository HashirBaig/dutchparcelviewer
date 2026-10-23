import {
  CACHE_DB_NAME,
  CACHE_DB_VERSION,
  CACHE_STORE,
  CACHE_TTL_MS,
} from "../constants/cache";
import type { NdviSeriesResult } from "../types/timeseries";

interface CacheEntry {
  savedAt: number;
  result: NdviSeriesResult;
}

/** Past seasons never change, so they do not expire. */
export const ttlForYear = (year: number): number =>
  year < new Date().getFullYear() ? Number.POSITIVE_INFINITY : CACHE_TTL_MS;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(CACHE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadCachedSeries(
  key: string,
  ttlMs: number,
): Promise<NdviSeriesResult | null> {
  try {
    const db = await openDb();
    const entry = await new Promise<CacheEntry | undefined>(
      (resolve, reject) => {
        const request = db
          .transaction(CACHE_STORE)
          .objectStore(CACHE_STORE)
          .get(key);
        request.onsuccess = () =>
          resolve(request.result as CacheEntry | undefined);
        request.onerror = () => reject(request.error);
      },
    );
    db.close();
    if (!entry || Date.now() - entry.savedAt > ttlMs) return null;
    return entry.result;
  } catch {
    return null;
  }
}

export async function saveCachedSeries(
  key: string,
  result: NdviSeriesResult,
): Promise<void> {
  try {
    const db = await openDb();
    const entry: CacheEntry = { savedAt: Date.now(), result };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE, "readwrite");
      tx.objectStore(CACHE_STORE).put(entry, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  } catch {
    // caching is best-effort
  }
}
