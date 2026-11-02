import { useParams } from "wouter";
import {
  useGetLocation,
  useCreateSaved,
  useDeleteSaved,
  useListSaved,
  useListFoods,
  getListSavedQueryKey,
  getGetLocationQueryKey,
  getListFoodsQueryKey,
} from "@workspace/api-client-react";
import { MapPin, Star, Heart, Compass, UtensilsCrossed, Info, Thermometer, ChefHat, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { MapContainer } from "@/components/map-container";
import { usePlacePhoto } from "@/hooks/use-place-photo";

// ─── Weather ────────────────────────────────────────────────────────────────

interface WeatherData {
  temperature: number;
  label: string;
  icon: string;
}

function weatherCodeToDescription(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if (code <= 3) return { label: "Partly cloudy", icon: "⛅" };
  if (code <= 48) return { label: "Foggy", icon: "🌫️" };
  if (code <= 55) return { label: "Drizzle", icon: "🌦️" };
  if (code <= 65) return { label: "Rainy", icon: "🌧️" };
  if (code <= 77) return { label: "Snowy", icon: "🌨️" };
  if (code <= 82) return { label: "Rain showers", icon: "🌧️" };
  if (code <= 86) return { label: "Snow showers", icon: "🌨️" };
  if (code <= 99) return { label: "Thunderstorm", icon: "⛈️" };
  return { label: "Unknown", icon: "🌡️" };
}

function useWeather(lat: number | null | undefined, lng: number | null | undefined) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    let cancelled = false;
    setWeatherLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const cw = data?.current_weather;
        if (cw) {
          const { label, icon } = weatherCodeToDescription(cw.weathercode ?? 0);
          setWeather({ temperature: cw.temperature, label, icon });
        }
      })
      .catch(() => { if (!cancelled) setWeather(null); })
      .finally(() => { if (!cancelled) setWeatherLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  return { weather, weatherLoading };
}

// ─── Main component ───────────────────────────────────────────────────────

export default function LocationDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();

  const { data: location, isLoading } = useGetLocation(id, {
    query: { enabled: !!id, queryKey: getGetLocationQueryKey(id) },
  });

  const { data: savedSpots } = useListSaved({
    query: { enabled: !!isSignedIn, queryKey: getListSavedQueryKey() },
  });

  const savedSpot = useMemo(
    () => savedSpots?.find((s) => s.locationId === id),
    [savedSpots, id]
  );
  const isSaved = !!savedSpot;

  const createSaved = useCreateSaved();
  const deleteSaved = useDeleteSaved();

  const { weather, weatherLoading } = useWeather(location?.lat, location?.lng);
  const googlePhotoUrl = usePlacePhoto(location?.name);

  const { data: foods } = useListFoods(
    { city: location?.city },
    { query: { enabled: !!location?.city, queryKey: getListFoodsQueryKey({ city: location?.city }) } },
  );

  const mapMarkers = useMemo(() => {
    if (!location?.lat || !location?.lng) return [];
    return [{ lat: location.lat, lng: location.lng, title: location.name, id: location.id }];
  }, [location?.id, location?.lat, location?.lng, location?.name]);

  const toggleSaved = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save locations");
      return;
    }
    if (isSaved && savedSpot) {
      deleteSaved.mutate(
        { id: savedSpot.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSavedQueryKey() });
            toast.success("Removed from saved spots");
          },
        }
      );
    } else {
      createSaved.mutate(
        { data: { locationId: id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSavedQueryKey() });
            toast.success("Added to saved spots");
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-muted-foreground">
        Location not found
      </div>
    );
  }

  const heroImage = googlePhotoUrl || location.imageUrl;

  return (
    <div className="w-full flex flex-col min-h-screen pb-20">
      {/* Hero — real Google Places photo when available */}
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        <img src={heroImage} alt={location.name} className="w-full h-full object-cover" />
        {googlePhotoUrl && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            📸 Google Places
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground capitalize px-3 py-1 text-sm shadow-md">
                {location.category}
              </Badge>
              <div className="flex items-center gap-1.5 text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {location.rating.toFixed(1)}
              </div>
              {location.isFeatured && (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/20 text-amber-200 border-amber-500/50 backdrop-blur-md"
                >
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              {location.name}
            </h1>

            <div className="flex items-center gap-2 text-white/90 text-lg">
              <MapPin className="w-5 h-5 text-accent" />
              <span>{location.city}, {location.province}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-12">
            <div className="flex justify-between items-start">
              <p className="text-lg md:text-xl leading-relaxed text-foreground">
                {location.description}
              </p>
              <Button
                variant="outline"
                size="icon"
                className={`ml-6 shrink-0 h-12 w-12 rounded-full border-2 transition-all ${
                  isSaved ? "border-red-500 bg-red-50/10" : "border-border"
                }`}
                onClick={toggleSaved}
                data-testid={`btn-save-detail-${location.id}`}
              >
                <Heart
                  className={`w-6 h-6 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                />
              </Button>
            </div>

            {location.culturalInsight && (
              <div className="bg-secondary/50 rounded-2xl p-6 md:p-8 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Cultural Insight</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {location.culturalInsight}
                </p>
              </div>
            )}

            {location.cuisine && (
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/10 p-3 rounded-full text-orange-600 dark:text-orange-400">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Local Cuisine</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {location.cuisine}
                </p>
              </div>
            )}

            {foods && foods.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-500/10 p-3 rounded-full text-rose-600 dark:text-rose-400">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Famous Dishes of {location.city}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="w-full h-full object-cover"
                        />
                        {food.isSignature && (
                          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                            ★ Signature
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-foreground text-lg mb-1">{food.name}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {food.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm sticky top-24 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-primary" /> Location
              </h3>

              {/* Interactive map — red pin via Maps JS API */}
              {location.lat && location.lng ? (
                <MapContainer markers={mapMarkers} zoom={14} height="220px" className="w-full" />
              ) : (
                <div className="rounded-xl bg-muted h-[120px] flex items-center justify-center border border-border">
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4" /> Map unavailable
                  </p>
                </div>
              )}

              {/* Live weather */}
              {location.lat && location.lng && (
                <div className="rounded-xl bg-secondary/40 border border-border p-4" data-testid="weather-widget">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Current Weather</span>
                  </div>
                  {weatherLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Fetching live conditions...
                    </div>
                  ) : weather ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label={weather.label}>{weather.icon}</span>
                        <div>
                          <div className="text-xl font-bold text-foreground">{weather.temperature.toFixed(1)}°C</div>
                          <div className="text-xs text-muted-foreground">{weather.label}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>Live data</div>
                        <div className="opacity-60">Open-Meteo</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" /> Weather unavailable
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">City</span>
                  <span className="font-medium text-foreground text-sm">{location.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Province</span>
                  <span className="font-medium text-foreground text-sm">{location.province}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground text-sm">Category</span>
                  <span className="font-medium text-foreground text-sm capitalize">{location.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
