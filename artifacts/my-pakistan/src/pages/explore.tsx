import { useEffect, useState, useMemo } from "react";
import { MapPin, X, LayoutGrid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListLocations, useCreateHistory } from "@workspace/api-client-react";
import { LocationCard } from "@/components/location-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useUser } from "@clerk/react";
import { PlacesSearchBar, type PlaceResult } from "@/components/places-search-bar";
import { MapContainer, type MapMarker } from "@/components/map-container";
import { useLocation as useWouterLocation } from "wouter";

export default function Explore() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>(
    initialCategory === "all" ? "" : initialCategory
  );
  const [province, setProvince] = useState<string>("");
  const [mapView, setMapView] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const debouncedQuery = useDebounce(query, 500);
  const { isSignedIn } = useUser();
  const createHistory = useCreateHistory();
  const [, navigate] = useWouterLocation();

  useEffect(() => {
    if (debouncedQuery.trim() && isSignedIn) {
      createHistory.mutate({ data: { query: debouncedQuery } });
    }
  }, [debouncedQuery, isSignedIn]);

  const { data: locations, isLoading } = useListLocations({
    q: debouncedQuery || undefined,
    category: category && category !== "all" ? category : undefined,
    province: province && province !== "all" ? province : undefined,
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "monument", label: "Monuments & Heritage" },
    { value: "nature", label: "Nature & Landscapes" },
    { value: "food", label: "Food & Cuisine" },
    { value: "culture", label: "Culture & Arts" },
    { value: "adventure", label: "Adventure" },
  ];

  const provinces = [
    { value: "all", label: "All Provinces" },
    { value: "Punjab", label: "Punjab" },
    { value: "Sindh", label: "Sindh" },
    { value: "Khyber Pakhtunkhwa", label: "KPK" },
    { value: "Balochistan", label: "Balochistan" },
    { value: "Gilgit-Baltistan", label: "Gilgit-Baltistan" },
    { value: "Azad Kashmir", label: "Azad Kashmir" },
  ];

  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setProvince("");
    setSelectedPlace(null);
  };

  const hasActiveFilters = query || category || province;

  const handlePlaceSelect = (place: PlaceResult) => {
    if (!place.placeId) {
      setSelectedPlace(null);
      return;
    }
    setSelectedPlace(place);
    setMapView(true);
  };

  const mapMarkers = useMemo<MapMarker[]>(() => {
    const dbMarkers: MapMarker[] =
      locations
        ?.filter((l) => l.lat != null && l.lng != null)
        .map((l) => ({
          lat: l.lat!,
          lng: l.lng!,
          title: l.name,
          id: l.id,
          href: `/locations/${l.id}`,
        })) ?? [];

    if (selectedPlace?.placeId && selectedPlace.lat !== 0) {
      const alreadyPresent = dbMarkers.some(
        (m) =>
          Math.abs(m.lat - selectedPlace.lat) < 0.01 &&
          Math.abs(m.lng - selectedPlace.lng) < 0.01
      );
      if (!alreadyPresent) {
        dbMarkers.unshift({
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
          title: selectedPlace.name,
          id: "places-result",
        });
      }
    }
    return dbMarkers;
  }, [locations, selectedPlace]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      <div className="mb-6 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Explore Pakistan</h1>
            <p className="text-muted-foreground">
              Search any place — powered by Google Places
            </p>
          </div>
          <Button
            variant={mapView ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView((v) => !v)}
            className="gap-2 shrink-0"
            data-testid="btn-toggle-map"
          >
            {mapView ? (
              <>
                <LayoutGrid className="h-4 w-4" /> Grid
              </>
            ) : (
              <>
                <Map className="h-4 w-4" /> Map
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
          <PlacesSearchBar
            value={query}
            onChange={setQuery}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search destinations, monuments, cities in Pakistan..."
          />
          <div className="flex gap-3">
            <Select
              value={category || "all"}
              onValueChange={(v) => setCategory(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[170px] bg-background" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={province || "all"}
              onValueChange={(v) => setProvince(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[170px] bg-background" data-testid="select-province">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {query && (
              <Badge variant="secondary" className="capitalize">
                {query}
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="capitalize">
                {category}
              </Badge>
            )}
            {province && (
              <Badge variant="secondary" className="capitalize">
                {province}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
        )}

        {/* Google Places result card */}
        {selectedPlace?.placeId && selectedPlace.photoUrl && (
          <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <img
              src={selectedPlace.photoUrl}
              alt={selectedPlace.name}
              className="w-20 h-16 rounded-lg object-cover shrink-0 border border-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Google Places Result
                </span>
              </div>
              <p className="font-semibold text-foreground truncate">{selectedPlace.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {selectedPlace.formattedAddress}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/explore?q=${encodeURIComponent(selectedPlace.name)}`
                )
              }
            >
              Filter results
            </Button>
          </div>
        )}
      </div>

      {/* Map View */}
      {mapView && (
        <div className="mb-8">
          <MapContainer
            markers={mapMarkers}
            center={
              selectedPlace?.placeId && selectedPlace.lat !== 0
                ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
                : undefined
            }
            zoom={selectedPlace?.placeId ? 12 : 5}
            height="480px"
            className="w-full shadow-md"
            onMarkerClick={(m) => {
              if (m.href) navigate(m.href);
            }}
          />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {mapMarkers.length} location{mapMarkers.length !== 1 ? "s" : ""} shown
            {selectedPlace?.placeId && " · Red pin = Google Places result"}
          </p>
        </div>
      )}

      {/* Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden bg-card border border-border h-[320px] animate-pulse"
            >
              <div className="h-48 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : locations && locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-border">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No locations found
          </h3>
          <p className="text-muted-foreground mb-6">
            Try a different search or clear your filters.
          </p>
          <Button onClick={clearFilters} data-testid="btn-clear-filters">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
