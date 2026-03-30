import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Grid, List, SlidersHorizontal, Map, Flame, Split } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPES, LOCATIONS } from "@/lib/index";
import PropertyMap from "@/components/PropertyMap";

const allProperties = [
  {
    id: "1",
    title: "Modern Apartment in Ongata Rongai",
    location: "Ongata Rongai",
    sub_location: "Kware",
    price: 25000,
    bedrooms: 2,
    bathrooms: 1,
    property_type: "apartment",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    is_premium: true,
    is_featured: true,
    status: "AVAILABLE" as const,
    latitude: -1.3887,
    longitude: 36.7812,
  },
  {
    id: "2",
    title: "Cozy Bedsitter near Kiserian",
    location: "Kiserian",
    sub_location: "Town",
    price: 12000,
    bedrooms: 1,
    bathrooms: 1,
    property_type: "bedsitter",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    is_premium: false,
    is_featured: false,
    status: "AVAILABLE" as const,
    latitude: -1.4356,
    longitude: 36.9567,
  },
  {
    id: "3",
    title: "Spacious 3BR House with Garden",
    location: "Ngong",
    sub_location: "Kibera",
    price: 45000,
    bedrooms: 3,
    bathrooms: 2,
    property_type: "house",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    is_premium: true,
    is_featured: true,
    status: "AVAILABLE" as const,
    latitude: -1.3125,
    longitude: 36.8125,
  },
  {
    id: "4",
    title: "Luxury Villa with Pool",
    location: "Karen",
    sub_location: "Langata",
    price: 85000,
    bedrooms: 4,
    bathrooms: 3,
    property_type: "villa",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    is_premium: true,
    is_featured: true,
    status: "AVAILABLE" as const,
    latitude: -1.3236,
    longitude: 36.7178,
  },
  {
    id: "5",
    title: "Studio Apartment - Kilimani",
    location: "Kilimani",
    sub_location: "Muthangari",
    price: 18000,
    bedrooms: 1,
    bathrooms: 1,
    property_type: "studio",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400",
    is_premium: false,
    is_featured: false,
    status: "AVAILABLE" as const,
    latitude: -1.2935,
    longitude: 36.7856,
  },
  {
    id: "6",
    title: "Single Room - Magadi Road",
    location: "Ongata Rongai",
    sub_location: "Mbagathi",
    price: 8000,
    bedrooms: 1,
    bathrooms: 1,
    property_type: "single",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
    is_premium: false,
    is_featured: false,
    status: "AVAILABLE" as const,
    latitude: -1.4123,
    longitude: 36.8234,
  },
];

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlView = searchParams.get("view") as "grid" | "list" | "map" | "split" | null;
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map" | "split">(urlView || "grid");
  const [showFilters, setShowFilters] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    property_type: "",
    price_min: "",
    price_max: "",
    bedrooms: "",
    bathrooms: "",
    status: "",
    is_premium: "",
  });

  const filteredProperties = allProperties.filter((property) => {
    if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.location && property.location.toLowerCase() !== filters.location) return false;
    if (filters.property_type && property.property_type !== filters.property_type) return false;
    if (filters.price_min && property.price < parseInt(filters.price_min)) return false;
    if (filters.price_max && property.price > parseInt(filters.price_max)) return false;
    if (filters.bedrooms && property.bedrooms !== parseInt(filters.bedrooms)) return false;
    if (filters.bathrooms && property.bathrooms !== parseInt(filters.bathrooms)) return false;
    if (filters.status && property.status !== filters.status) return false;
    if (filters.is_premium && (property.is_premium ? "true" : "false") !== filters.is_premium) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Browse Properties</h1>
          <p className="text-muted-foreground">{filteredProperties.length} properties available</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => { setViewMode("grid"); setSearchParams({ view: "grid" }); }}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => { setViewMode("list"); setSearchParams({ view: "list" }); }}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "split" ? "default" : "ghost"}
              size="icon"
              onClick={() => { setViewMode("split"); setSearchParams({ view: "split" }); }}
              title="Split View"
            >
              <Split className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="icon"
              onClick={() => { setViewMode("map"); setSearchParams({ view: "map" }); }}
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
          {viewMode === "map" && (
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Flame className="w-4 h-4 mr-2" />
              Heatmap
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel - Always Visible */}
      <motion.div
        initial={false}
        animate={{ opacity: showFilters ? 1 : 0, height: showFilters ? "auto" : 0 }}
        style={{ overflow: "hidden" }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filter Properties</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: "", location: "", property_type: "", price_min: "", price_max: "", bedrooms: "", bathrooms: "", status: "", is_premium: "" })}
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.property_type}
                onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <Input
                placeholder="Min Price"
                type="number"
                value={filters.price_min}
                onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
              />
              <Input
                placeholder="Max Price"
                type="number"
                value={filters.price_max}
                onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
              />
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              >
                <option value="">Bedrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.bathrooms}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
              >
                <option value="">Bathrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Properties Display */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : viewMode === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-[calc(100vh-200px)] rounded-xl overflow-hidden border">
          <div className="lg:col-span-2 overflow-y-auto px-4 py-4 bg-gray-50">
            <div className="space-y-3">
              {filteredProperties.map((property) => (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-0 flex">
                      <div className="w-28 h-28 relative shrink-0">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {property.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {property.bedrooms} bed • {property.bathrooms} bath
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          KSh {property.price.toLocaleString()}/mo
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 h-full">
            <PropertyMap
              properties={filteredProperties}
              selectedId={null}
              onSelectProperty={() => {}}
              showHeatmap={showHeatmap}
            />
          </div>
        </div>
      ) : viewMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
          <div className="overflow-y-auto space-y-4 pr-2">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/properties/${property.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  <CardContent className="p-3 flex gap-3">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-24 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {property.location}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        KSh {property.price.toLocaleString()}/mo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="rounded-lg overflow-hidden border">
            <PropertyMap
              properties={filteredProperties}
              selectedId={null}
              onSelectProperty={() => {}}
              showHeatmap={showHeatmap}
            />
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {property.is_premium && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  )}
                  <Badge className="absolute top-2 left-2" variant={property.is_premium ? "default" : "secondary"}>
                    {property.is_premium ? "Premium" : "Standard"}
                  </Badge>
                  <Badge variant="available" className="absolute top-2 right-2">
                    Available
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate mb-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {property.location} • {property.sub_location}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">
                      KSh {property.price.toLocaleString()}/mo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {property.bedrooms} bed • {property.bathrooms} bath
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="md:w-72 h-48 md:h-auto relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="object-cover w-full h-full"
                    />
                    {property.is_premium && (
                      <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {property.location} • {property.sub_location}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        KSh {property.price.toLocaleString()}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span>{property.bedrooms} Bedrooms</span>
                      <span>{property.bathrooms} Bathrooms</span>
                      <span className="capitalize">{property.property_type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="available">Available</Badge>
                      {property.is_premium && <Badge>Premium</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
