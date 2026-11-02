import { Link } from "wouter";
import { Star, MapPin, Heart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Location } from "@workspace/api-client-react";
import { useCreateSaved, useDeleteSaved, useListSaved, getListSavedQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { usePlacePhoto } from "@/hooks/use-place-photo";

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const googlePhoto = usePlacePhoto(location.name);
  const [imgError, setImgError] = useState(false);
  const imageSrc = googlePhoto || location.imageUrl;

  const { data: savedSpots } = useListSaved({ query: { enabled: !!isSignedIn, queryKey: getListSavedQueryKey() } });
  
  const savedSpot = useMemo(() => {
    return savedSpots?.find(s => s.locationId === location.id);
  }, [savedSpots, location.id]);
  
  const isSaved = !!savedSpot;
  
  const createSaved = useCreateSaved();
  const deleteSaved = useDeleteSaved();

  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      toast.error("Please sign in to save locations");
      return;
    }
    
    if (isSaved && savedSpot) {
      deleteSaved.mutate({ id: savedSpot.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSavedQueryKey() });
          toast.success("Removed from saved spots");
        }
      });
    } else {
      createSaved.mutate({ data: { locationId: location.id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSavedQueryKey() });
          toast.success("Added to saved spots");
        }
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'monument': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'nature': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'food': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'culture': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'adventure': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <Link href={`/locations/${location.id}`} data-testid={`link-location-${location.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden relative bg-muted">
          {!imgError ? (
            <img
              src={imageSrc}
              alt={location.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-gradient-to-br from-muted to-muted/60">
              <ImageOff className="w-8 h-8 opacity-40" />
              <span className="text-xs opacity-50">{location.name}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="outline" className={`capitalize shadow-sm backdrop-blur-md ${getCategoryColor(location.category)}`}>
              {location.category}
            </Badge>
            {location.isFeatured && (
              <Badge variant="default" className="bg-primary text-primary-foreground shadow-sm">
                Featured
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
            onClick={toggleSaved}
            data-testid={`btn-save-${location.id}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1 text-foreground" title={location.name}>{location.name}</h3>
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{location.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="line-clamp-1">{location.city}, {location.province}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
            {location.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
