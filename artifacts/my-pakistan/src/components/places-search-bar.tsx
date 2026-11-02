import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/maps-loader";

export interface PlaceResult {
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  photoUrl?: string;
}

interface PlacesSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesSearchBar({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search any destination, landmark, or city in Pakistan...",
  className = "",
}: PlacesSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!inputRef.current || !apiKey) return;

    setLoading(true);
    loadGoogleMaps()
      .then(() => {
        if (!inputRef.current || autocompleteRef.current) return;

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "pk" },
          fields: ["name", "geometry", "photos", "place_id", "formatted_address"],
          types: ["geocode", "establishment"],
        });

        autocompleteRef.current = ac;

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place.geometry?.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          let photoUrl: string | undefined;
          if (place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
          }

          const result: PlaceResult = {
            name: place.name ?? "",
            formattedAddress: place.formatted_address ?? "",
            lat,
            lng,
            placeId: place.place_id ?? "",
            photoUrl,
          };

          onChange(place.name ?? "");
          onPlaceSelect(result);
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  const handleClear = () => {
    onChange("");
    onPlaceSelect({ name: "", formattedAddress: "", lat: 0, lng: 0, placeId: "" });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className={`relative flex-grow ${className}`}>
      {loading ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        data-testid="input-places-search"
        autoComplete="off"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
