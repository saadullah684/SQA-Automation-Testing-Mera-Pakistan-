import { useMemo } from "react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin, Navigation } from "lucide-react";
import { LocationCard } from "@/components/location-card";
import { MapContainer, type MapMarker } from "@/components/map-container";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const [, navigate] = useLocation();

  const colors = ["#047857", "#d97706", "#dc2626", "#2563eb", "#7c3aed"];

  const allPinMarkers = useMemo<MapMarker[]>(() => {
    if (!summary?.topRatedLocations) return [];
    return summary.topRatedLocations
      .filter((l) => l.lat != null && l.lng != null)
      .map((l) => ({
        lat: l.lat!,
        lng: l.lng!,
        title: `${l.name} — ${l.rating.toFixed(1)}★`,
        id: l.id,
        href: `/locations/${l.id}`,
      }));
  }, [summary?.topRatedLocations]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-card animate-pulse mb-8" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Platform Overview</h1>
        <p className="text-muted-foreground">Mera Pakistan statistics and insights</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Locations
            </CardTitle>
            <MapPin className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{summary.totalLocations}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Provinces Covered
            </CardTitle>
            <Map className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{summary.totalProvinces}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cities Indexed
            </CardTitle>
            <Navigation className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{summary.totalCities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pakistan Explorer Map */}
      <Card className="mb-10 shadow-sm border-border overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Pakistan Explorer Map
          </CardTitle>
          <CardDescription>
            Top-rated destinations across Pakistan — click any pin for details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <MapContainer
            markers={allPinMarkers}
            height="420px"
            className="rounded-none border-0"
            onMarkerClick={(m) => {
              if (m.href) navigate(m.href);
            }}
          />
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Locations by Category</CardTitle>
            <CardDescription>
              Distribution of indexed places across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.categoryCounts}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "currentColor" }}
                    className="text-muted-foreground text-xs uppercase"
                  />
                  <YAxis
                    tick={{ fill: "currentColor" }}
                    className="text-muted-foreground text-xs"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--accent)", opacity: 0.1 }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {summary.categoryCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Platform summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                Most Abundant
              </h4>
              <p className="text-lg font-medium text-foreground capitalize">
                {summary.categoryCounts.length > 0
                  ? [...summary.categoryCounts].sort((a, b) => b.count - a.count)[0].category
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                Top Rated
              </h4>
              <p className="text-lg font-medium text-foreground">
                {summary.topRatedLocations.length > 0
                  ? summary.topRatedLocations[0].name
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Rated grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Rated Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summary.topRatedLocations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      </div>
    </div>
  );
}
