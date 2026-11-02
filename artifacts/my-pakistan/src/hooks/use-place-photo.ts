import { useState, useEffect } from "react";
import { loadGoogleMaps } from "@/lib/maps-loader";

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

async function fetchPlacePhoto(name: string): Promise<string | null> {
  if (cache.has(name)) return cache.get(name) ?? null;
  if (pending.has(name)) return pending.get(name)!;

  const promise = loadGoogleMaps()
    .then(({ places }) => {
      return new Promise<string | null>((resolve) => {
        const dummy = document.createElement("div");
        const service = new places.PlacesService(dummy);
        service.textSearch(
          { query: `${name}, Pakistan` },
          (results: google.maps.places.PlaceResult[] | null, status: string) => {
            if (status === "OK" && results?.[0]?.photos?.[0]) {
              resolve(results[0].photos![0].getUrl({ maxWidth: 800 }));
            } else {
              resolve(null);
            }
          },
        );
      });
    })
    .catch(() => null)
    .then((url) => {
      cache.set(name, url);
      pending.delete(name);
      return url;
    });

  pending.set(name, promise);
  return promise;
}

export function usePlacePhoto(name: string | undefined): string | null {
  const [photoUrl, setPhotoUrl] = useState<string | null>(() =>
    name ? (cache.get(name) ?? null) : null,
  );

  useEffect(() => {
    if (!name || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;
    if (cache.has(name)) {
      setPhotoUrl(cache.get(name) ?? null);
      return;
    }
    let cancelled = false;
    fetchPlacePhoto(name).then((url) => {
      if (!cancelled) setPhotoUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return photoUrl;
}
