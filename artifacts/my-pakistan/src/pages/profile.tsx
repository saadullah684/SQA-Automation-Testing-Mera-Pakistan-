import { useUser, SignOutButton } from "@clerk/react";
import { useListHistory, useDeleteHistory, useListSaved, getListHistoryQueryKey, getListSavedQueryKey } from "@workspace/api-client-react";
import { LocationCard } from "@/components/location-card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, MapPin, Heart, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  const { data: history, isLoading: isLoadingHistory } = useListHistory();
  const { data: savedSpots, isLoading: isLoadingSaved } = useListSaved();
  
  const deleteHistory = useDeleteHistory();

  const handleDeleteHistory = (id: number) => {
    deleteHistory.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListHistoryQueryKey() });
        toast.success("History entry deleted");
      }
    });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
        <div className="flex items-center gap-6 bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm flex-grow">
          <img 
            src={user.imageUrl} 
            alt={user.fullName || "User"} 
            className="w-24 h-24 rounded-full border-4 border-background shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{user.fullName || "Traveler"}</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
              {user.primaryEmailAddress?.emailAddress}
            </p>
            <div className="flex gap-4 mt-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500" />
                {savedSpots?.length || 0} Saved
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                {history?.length || 0} Searches
              </div>
            </div>
          </div>
        </div>
        
        <SignOutButton>
          <Button variant="outline" className="shrink-0 h-14 px-6 text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </SignOutButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Saved Destinations</h2>
          </div>
          
          {isLoadingSaved ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-xl bg-card border border-border animate-pulse"></div>)}
            </div>
          ) : savedSpots && savedSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedSpots.map((spot) => (
                <LocationCard key={spot.id} location={spot.location} />
              ))}
            </div>
          ) : (
            <div className="bg-card p-12 text-center rounded-2xl border border-border">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No saved spots yet</h3>
              <p className="text-muted-foreground">Browse locations and click the heart icon to save them here for later.</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Search History</h2>
          </div>
          
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {isLoadingHistory ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-muted rounded-md animate-pulse"></div>)}
              </div>
            ) : history && history.length > 0 ? (
              <ul className="divide-y divide-border">
                {history.map((entry) => (
                  <li key={entry.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                    <div className="truncate pr-4">
                      <p className="font-medium text-foreground truncate">{entry.query}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8"
                      onClick={() => handleDeleteHistory(entry.id)}
                      data-testid={`btn-delete-history-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Your search history is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
