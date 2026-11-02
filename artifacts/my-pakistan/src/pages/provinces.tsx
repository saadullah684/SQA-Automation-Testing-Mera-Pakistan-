import { useListProvinces } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Map, ArrowRight } from "lucide-react";

export default function Provinces() {
  const { data: provinces, isLoading } = useListProvinces();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-screen">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Provinces & Regions</h1>
        <p className="text-lg text-muted-foreground">
          Pakistan is divided into provinces and territories, each with its own unique culture, language, landscape, and history. Discover what makes each region special.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border h-[400px] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {provinces?.map((province) => (
            <Link key={province.id} href={`/provinces/${province.slug}`} data-testid={`link-province-${province.slug}`}>
              <div className="group flex flex-col md:flex-row h-auto md:h-[320px] rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-all cursor-pointer">
                <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
                  <img 
                    src={province.imageUrl} 
                    alt={province.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-card">
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold tracking-wider uppercase mb-2">
                    <Map className="w-4 h-4" />
                    Region
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">{province.name}</h2>
                  <p className="text-muted-foreground line-clamp-4 mb-6">
                    {province.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground bg-secondary px-3 py-1 rounded-full">
                      {province.cityCount} Major Cities
                    </span>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
