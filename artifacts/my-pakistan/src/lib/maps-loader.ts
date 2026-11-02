import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export interface GoogleLibs {
  maps: google.maps.MapsLibrary;
  places: google.maps.PlacesLibrary;
}

let ready: Promise<GoogleLibs> | null = null;

export function loadGoogleMaps(): Promise<GoogleLibs> {
  if (!ready) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "" } as any);
    ready = Promise.all([
      importLibrary("maps") as Promise<google.maps.MapsLibrary>,
      importLibrary("places") as Promise<google.maps.PlacesLibrary>,
    ]).then(([maps, places]) => ({ maps, places }));
  }
  return ready;
}
