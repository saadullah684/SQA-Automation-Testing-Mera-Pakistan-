import { useEffect, useRef, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/lib/maps-loader";
import { useLocation } from "wouter";

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  id?: number | string;
  href?: string;
}

interface MapContainerProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

const PAKISTAN_CENTER = { lat: 30.3753, lng: 69.3451 };

export function MapContainer({
  markers,
  center,
  zoom = 13,
  height = "300px",
  className = "",
  onMarkerClick,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const openInfoRef = useRef<google.maps.InfoWindow | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [, navigate] = useLocation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Stable string dep so the effect only re-runs when coordinates actually change
  const markerKey = useMemo(
    () => markers.map((m) => `${m.lat.toFixed(5)},${m.lng.toFixed(5)}`).join("|"),
    [markers]
  );

  useEffect(() => {
    if (!containerRef.current || !apiKey) return;
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        if (!mapRef.current) {
          const initialCenter =
            center ??
            (markers.length > 0
              ? { lat: markers[0].lat, lng: markers[0].lng }
              : PAKISTAN_CENTER);

          mapRef.current = new google.maps.Map(containerRef.current, {
            center: initialCenter,
            zoom: markers.length > 1 ? 5 : zoom,
            mapTypeId: "roadmap",
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            ],
          });
        }

        const map = mapRef.current;

        // Clear previous markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const bounds = new google.maps.LatLngBounds();

        markers.forEach((markerData) => {
          const marker = new google.maps.Marker({
            position: { lat: markerData.lat, lng: markerData.lng },
            map,
            title: markerData.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: markers.length === 1 ? 12 : 9,
              fillColor: "#dc2626",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2.5,
            },
            animation:
              markers.length === 1 ? google.maps.Animation.DROP : undefined,
          });

          const infoContent = markerData.href
            ? `<div style="font-family:system-ui,sans-serif;padding:4px 6px;min-width:140px;">
                <strong style="font-size:13px;color:#111;">${markerData.title}</strong>
                <div style="margin-top:5px;">
                  <a href="${markerData.href}" id="info-link-${markerData.id}" style="font-size:12px;color:#047857;text-decoration:none;font-weight:600;">View details →</a>
                </div>
              </div>`
            : `<div style="font-family:system-ui,sans-serif;padding:4px 6px;">
                <strong style="font-size:13px;color:#111;">${markerData.title}</strong>
              </div>`;

          const infoWindow = new google.maps.InfoWindow({ content: infoContent });

          marker.addListener("click", () => {
            if (openInfoRef.current) openInfoRef.current.close();
            infoWindow.open({ anchor: marker, map });
            openInfoRef.current = infoWindow;
            onMarkerClick?.(markerData);

            if (markerData.href) {
              google.maps.event.addListenerOnce(infoWindow, "domready", () => {
                const link = document.getElementById(`info-link-${markerData.id}`);
                link?.addEventListener("click", (e) => {
                  e.preventDefault();
                  navigate(markerData.href!);
                });
              });
            }
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: markerData.lat, lng: markerData.lng });
        });

        if (markers.length > 1) {
          map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
        } else if (markers.length === 1) {
          map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
          map.setZoom(zoom);
        } else {
          map.setCenter(center ?? PAKISTAN_CENTER);
          map.setZoom(5);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [markerKey, zoom]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  if (!apiKey) {
    return (
      <div
        className={`bg-muted rounded-xl flex items-center justify-center border border-border ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Map API key not configured</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`bg-muted rounded-xl flex items-center justify-center border border-border ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">Map failed to load</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-xl overflow-hidden border border-border ${className}`}
      style={{ height }}
      data-testid="map-container"
    />
  );
}
