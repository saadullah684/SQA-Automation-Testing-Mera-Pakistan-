import { Link } from "wouter";
import { ArrowRight, Search, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetFeaturedLocations, useListProvinces } from "@workspace/api-client-react";
import { LocationCard } from "@/components/location-card";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: featuredLocations, isLoading: isLoadingFeatured } = useGetFeaturedLocations();
  const { data: provinces, isLoading: isLoadingProvinces } = useListProvinces();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation('/explore');
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1627896157734-4d7d4388f28b?q=80&w=2070&auto=format&fit=crop" 
            alt="Badshahi Mosque, Lahore" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary-foreground backdrop-blur-md border-primary/30 py-1.5 px-4 text-sm tracking-widest uppercase font-medium">
            Discover The Unseen
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            Journey Through <span className="text-accent">Pakistan</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md font-medium">
            From the peaks of Karakoram to the ancient ruins of Mohenjo-Daro, uncover the beauty, culture, and spirit of Pakistan.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex items-center">
            <div className="relative w-full flex items-center group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Enter a city, monument, or region..."
                className="w-full pl-12 pr-32 py-8 text-lg rounded-full bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl focus-visible:ring-primary text-foreground placeholder:text-muted-foreground/70"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-hero-search"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <Button 
                  type="submit" 
                  className="rounded-full px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  data-testid="btn-hero-search"
                >
                  Explore
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Trending Destinations</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">Discover the most captivating and highly-rated locations right now.</p>
            </div>
            <Link href="/explore" className="hidden md:inline-flex" data-testid="link-view-all-featured">
              <Button variant="outline" className="group">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-card border border-border h-[320px] animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredLocations?.slice(0, 4).map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/explore" data-testid="link-view-all-featured-mobile">
              <Button variant="outline" className="w-full">
                View All Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Provinces Showcase */}
      <section className="py-20 bg-secondary/30 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">Explore by Province</h2>
            <p className="text-muted-foreground text-lg">
              Each province offers a distinct flavor of culture, language, history, and landscape. 
              Find your next adventure.
            </p>
          </div>

          {isLoadingProvinces ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {provinces?.map((province) => (
                <Link key={province.id} href={`/provinces/${province.slug}`} data-testid={`link-province-${province.slug}`}>
                  <div className="group relative h-[300px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                    <img 
                      src={province.imageUrl} 
                      alt={province.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="text-2xl font-bold mb-1 group-hover:text-accent transition-colors">{province.name}</h3>
                          <div className="flex items-center text-white/80 text-sm font-medium">
                            <Map className="w-4 h-4 mr-1.5" />
                            {province.cityCount} Cities
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Inline Badge component for hero
function Badge({ className, children }: { className?: string, children: React.ReactNode }) {
  return <span className={`inline-block rounded-full ${className}`}>{children}</span>;
}
