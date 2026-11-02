import { useParams } from "wouter";
import { useListProvinces, useListCitiesByProvince, useListLocations, getListCitiesByProvinceQueryKey, getListLocationsQueryKey } from "@workspace/api-client-react";
import { MapPin, Globe } from "lucide-react";
import { LocationCard } from "@/components/location-card";
import { Badge } from "@/components/ui/badge";

export default function ProvinceDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  
  const { data: provinces } = useListProvinces();
  const province = provinces?.find(p => p.slug === slug);
  
  const { data: cities, isLoading: isLoadingCities } = useListCitiesByProvince(slug, {
    query: { enabled: !!slug, queryKey: getListCitiesByProvinceQueryKey(slug) }
  });
  
  const { data: locations, isLoading: isLoadingLocations } = useListLocations(
    { province: province?.name || slug }, 
    { query: { enabled: !!province, queryKey: getListLocationsQueryKey({ province: province?.name || slug }) } }
  );

  if (!province) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading province details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={province.imageUrl} 
            alt={province.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/30"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-20">
          <Badge className="mb-4 bg-primary/20 text-primary-foreground backdrop-blur-md border-primary/30 py-1 px-3">
            Province Profile
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            {province.name}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
            {province.description}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Cities Section */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
            <Globe className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Major Cities</h2>
          </div>
          
          {isLoadingCities ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[280px] h-[320px] rounded-2xl bg-card border border-border animate-pulse shrink-0"></div>
              ))}
            </div>
          ) : cities && cities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cities.map(city => (
                <div key={city.id} className="group rounded-2xl overflow-hidden bg-card border border-border flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{city.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{city.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No cities listed for this province yet.</p>
          )}
        </div>

        {/* Locations Section */}
        <div>
          <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
            <MapPin className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Discover {province.name}</h2>
          </div>
          
          {isLoadingLocations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-card border border-border h-[320px] animate-pulse"></div>
              ))}
            </div>
          ) : locations && locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <p className="text-lg text-muted-foreground">No locations found in {province.name}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
