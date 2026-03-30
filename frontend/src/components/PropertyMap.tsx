import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Locate, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  title: string;
  location: string;
  sub_location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  is_premium: boolean;
  latitude: number;
  longitude: number;
  property_type: string;
  status: string;
}

interface PropertyMapProps {
  properties: Property[];
  selectedId?: string | null;
  onSelectProperty?: (id: string | null) => void;
  showClustering?: boolean;
  showHeatmap?: boolean;
}

const MAP_TILES = [
  { id: "osm", name: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  { id: "cartodb", name: "CartoDB Positron", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' },
  { id: "cartodb-dark", name: "CartoDB Dark", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' },
  { id: "esri", name: "Esri World Imagery", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: 'Tiles &copy; Esri' },
];

const PROPERTY_ICONS: Record<string, string> = {
  apartment: "🏢",
  bedsitter: "🏠",
  house: "🏡",
  villa: "🏰",
  studio: "🏠",
  single: "🏚️",
};

function createCustomIcon(property: Property, isSelected: boolean): L.DivIcon {
  const bgColor = isSelected ? "#FF385C" : (property.is_premium ? "#059669" : "#222222");
  const borderColor = isSelected ? "#FF385C" : "white";
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 8px 12px;
        border-radius: 22px;
        font-weight: 600;
        font-size: 13px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid ${borderColor};
        cursor: pointer;
        transition: all 0.2s ease;
        transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        KSh ${property.price >= 1000 ? `${(property.price / 1000).toFixed(0)}K` : property.price.toLocaleString()}
      </div>
    `,
    iconSize: [90, 36],
    iconAnchor: [45, 18],
  });
}

function MapEventsHandler({ onSelectProperty }: { onSelectProperty?: (id: string | null) => void }) {
  useMapEvents({
    click: () => {
      if (onSelectProperty) onSelectProperty(null);
    },
  });
  return null;
}

function FlyToSelected({ selectedId, properties }: { selectedId: string | null; properties: Property[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!selectedId) return;
    const property = properties.find((p) => p.id === selectedId);
    if (property) {
      map.flyTo([property.latitude, property.longitude], 14, { duration: 1 });
    }
  }, [selectedId, properties, map]);
  
  return null;
}

export default function PropertyMap({ 
  properties, 
  selectedId, 
  onSelectProperty,
  showHeatmap = true,
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapTile, setMapTile] = useState(MAP_TILES[0]);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isClient) return;
    
    if (heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap) {
      const heatmapLayer = L.layerGroup();
      const maxPrice = Math.max(...properties.map(p => p.price), 1);
      
      properties.forEach((property) => {
        const intensity = 0.3 + (property.price / maxPrice) * 0.7;
        const circle = L.circleMarker([property.latitude, property.longitude], {
          radius: 20 + (property.price / maxPrice) * 30,
          fillColor: `rgba(255, 100, 50, ${intensity})`,
          color: 'rgba(255, 100, 50, 0.5)',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.6,
        });
        heatmapLayer.addLayer(circle);
      });
      
      heatmapLayer.addTo(mapRef.current!);
      heatmapLayerRef.current = heatmapLayer;
    }
  }, [showHeatmap, properties, isClient]);

  const center: [number, number] = properties.length > 0
    ? [properties[0].latitude, properties[0].longitude]
    : [-1.35, 36.78];

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!isClient) {
    return <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url={mapTile.url}
          attribution={mapTile.attribution}
        />
        <MapEventsHandler onSelectProperty={onSelectProperty} />
        <FlyToSelected selectedId={selectedId} properties={properties} />
        
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createCustomIcon(property, property.id === selectedId)}
            eventHandlers={{
              click: () => {
                if (onSelectProperty) onSelectProperty(property.id);
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: 220, fontFamily: "system-ui, sans-serif", padding: 4 }}>
                <div style={{ position: "relative", margin: "-4px -4px 8px -4px" }}>
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: "8px 8px 0 0" }} 
                  />
                  {property.is_premium && (
                    <span style={{ position: "absolute", top: 6, left: 6, background: "#059669", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                      PREMIUM
                    </span>
                  )}
                  <span style={{ position: "absolute", top: 6, right: 6, background: "#22C55E", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>
                    AVAILABLE
                  </span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px 0" }}>{property.title}</h3>
                <p style={{ fontSize: 12, color: "#666", margin: "0 0 8px 0" }}>📍 {property.location} • {property.sub_location}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>
                    KSh {property.price.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400 }}>/mo</span>
                  </span>
                  <span style={{ fontSize: 11, color: "#666" }}>🛏️ {property.bedrooms} • 🚿 {property.bathrooms}</span>
                </div>
                <a 
                  href={`/properties/${property.id}`}
                  style={{ display: "block", padding: "8px", background: "#059669", color: "white", textAlign: "center", borderRadius: 6, textDecoration: "none", fontSize: 12 }}
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
        <div className="bg-white rounded-lg shadow-md">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="h-8 w-8"
            >
              <Layers className="w-4 h-4" />
            </Button>
            {showLayerMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border p-2 min-w-32">
                {MAP_TILES.map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => {
                      setMapTile(tile);
                      setShowLayerMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded ${
                      mapTile.id === tile.id ? "bg-primary text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {tile.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const map = document.querySelector(".leaflet-container");
                  if (map) {
                    (map as any).flyTo([pos.coords.latitude, pos.coords.longitude], 14);
                  }
                },
                (err) => console.error("Geolocation error:", err)
              );
            }
          }}
          className="bg-white rounded-lg shadow-md h-8 w-8"
        >
          <Locate className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-white rounded-lg shadow-md h-8 w-8"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 text-xs z-[1000]">
        <div className="font-semibold mb-2">Property Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
