# Frontend Revamp Implementation Plan - RentalHunters

## Executive Summary

This comprehensive implementation plan outlines the complete frontend revamp for the RentalHunters real estate platform. The revamp focuses on creating a professional, Airbnb-inspired interface with enhanced user experience, proper state management, and scalable architecture.

## Current State Analysis

### Existing Structure
- **Framework**: React 19.2.0 with TypeScript, Vite, Tailwind CSS 4.2.1
- **Routing**: React Router DOM with basic route configuration
- **State Management**: React Query for server state, local state with useState
- **UI Components**: Radix UI primitives with custom styling
- **Maps**: Leaflet with React-Leaflet integration
- **Animation**: Framer Motion for smooth transitions

### Issues Identified
1. **Multiple Property Pages**: Properties.tsx, PropertiesMap.tsx, PropertiesBrowse.tsx contain similar functionality
2. **No Split-View Map**: Missing the requested 60/40 vertical split layout
3. **Hardcoded Data**: No API integration, using mock data
4. **Inconsistent Navigation**: Some links may not be fully functional
5. **Limited State Management**: Basic filtering without persistent state
6. **No Loading/Error States**: Missing UX feedback for async operations

## Implementation Plan

### Phase 1: Foundation & Architecture (Week 1-2)

#### 1.1 File Organization Restructure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Layout.tsx
│   ├── ui/ (existing)
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyList.tsx
│   │   ├── PropertyFilters.tsx
│   │   ├── PropertyMap.tsx (enhanced)
│   │   └── PropertyDetail.tsx
│   ├── map/
│   │   ├── MapContainer.tsx
│   │   ├── MapControls.tsx
│   │   ├── MapMarker.tsx
│   │   └── MapPopup.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── LocationAutocomplete.tsx
│   │   └── AdvancedFilters.tsx
│   ├── booking/
│   │   ├── BookingModal.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingCalendar.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── Pagination.tsx
├── pages/
│   ├── Home.tsx
│   ├── Properties.tsx (unified)
│   ├── PropertyDetail.tsx
│   ├── MapView.tsx (new split-view)
│   ├── Dashboard.tsx
│   ├── AddProperty.tsx
│   ├── Profile.tsx
│   ├── Subscriptions.tsx
│   ├── Login.tsx
│   └── NotFound.tsx
├── hooks/
│   ├── useProperties.ts
│   ├── useFilters.ts
│   ├── useAuth.ts
│   ├── useBookings.ts
│   └── useMap.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── properties.ts
│   ├── bookings.ts
│   └── maps.ts
├── stores/
│   ├── authStore.ts
│   ├── propertyStore.ts
│   ├── filterStore.ts
│   └── uiStore.ts
├── types/
│   ├── property.ts
│   ├── user.ts
│   ├── booking.ts
│   ├── filter.ts
│   └── api.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validation.ts
│   └── formatters.ts
└── lib/
    ├── queryClient.ts
    ├── router.tsx
    └── index.ts (updated)
```

#### 1.2 State Management Architecture

**Global State (Zustand)**
```typescript
// stores/propertyStore.ts
interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  filters: PropertyFilters;
  viewMode: 'grid' | 'list' | 'map' | 'split';
  loading: boolean;
  error: string | null;
}

interface PropertyActions {
  setProperties: (properties: Property[]) => void;
  setSelectedProperty: (property: Property | null) => void;
  updateFilters: (filters: Partial<PropertyFilters>) => void;
  setViewMode: (mode: PropertyState['viewMode']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

**Server State (React Query)**
```typescript
// hooks/useProperties.ts
export const useProperties = (filters: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.getProperties(filters),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};
```

#### 1.3 API Integration Layer

**API Client Structure**
```typescript
// services/api.ts
class ApiClient {
  private baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          authStore.logout();
        }
        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = new ApiClient();
```

### Phase 2: Core Components Development (Week 3-4)

#### 2.1 Map View Page Implementation

**Split Layout Structure**
```tsx
// pages/MapView.tsx
export default function MapViewPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="h-screen flex">
      {/* Left Panel - 60% width */}
      <div className="w-3/5 flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <SearchBar />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {/* Property List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'grid' ? (
            <PropertyGrid
              properties={filteredProperties}
              selectedId={selectedProperty?.id}
              onSelect={setSelectedProperty}
            />
          ) : (
            <PropertyList
              properties={filteredProperties}
              selectedId={selectedProperty?.id}
              onSelect={setSelectedProperty}
            />
          )}
        </div>
      </div>

      {/* Right Panel - 40% width */}
      <div className="w-2/5 relative">
        <PropertyMap
          properties={filteredProperties}
          selectedId={selectedProperty?.id}
          onSelectProperty={setSelectedProperty}
          showClustering={true}
          showHeatmap={false}
        />
      </div>
    </div>
  );
}
```

**Property Grid Component**
```tsx
// components/property/PropertyGrid.tsx
interface PropertyGridProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect?: (property: Property) => void;
  loading?: boolean;
}

export function PropertyGrid({ properties, selectedId, onSelect, loading }: PropertyGridProps) {
  if (loading) {
    return <PropertyGridSkeleton />;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={cn(
              "cursor-pointer transition-all duration-200",
              selectedId === property.id && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onSelect?.(property)}
          >
            <PropertyCard property={property} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Property Card Component (Airbnb-style)**
```tsx
// components/property/PropertyCard.tsx
export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={property.primary_image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.is_premium && (
          <Badge className="absolute top-3 left-3 bg-primary">
            Premium
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{property.title}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">4.8</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-2">
          {property.location}, {property.sub_location}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.total_units} units</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">KSh {property.price.toLocaleString()}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <Badge variant={property.status === 'AVAILABLE' ? 'available' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Enhanced Property Map Component

**Map Container with Split-View Support**
```tsx
// components/map/MapContainer.tsx
interface MapContainerProps {
  properties: Property[];
  selectedId?: string | null;
  onSelectProperty?: (id: string | null) => void;
  showClustering?: boolean;
  showHeatmap?: boolean;
  className?: string;
}

export function MapContainer({
  properties,
  selectedId,
  onSelectProperty,
  showClustering = true,
  showHeatmap = false,
  className = "h-full w-full"
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  useEffect(() => {
    if (mapInstance && selectedId) {
      const property = properties.find(p => p.id === selectedId);
      if (property) {
        mapInstance.flyTo([property.latitude, property.longitude], 15, {
          duration: 1.5
        });
      }
    }
  }, [selectedId, properties, mapInstance]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <MapContainer
        center={[-1.35, 36.78]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        ref={setMapInstance}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapEventsHandler onSelectProperty={onSelectProperty} />

        {properties.map((property) => (
          <MapMarker
            key={property.id}
            property={property}
            isSelected={property.id === selectedId}
            onClick={() => onSelectProperty?.(property.id)}
          />
        ))}

        {showClustering && <MarkerClusterGroup />}
        {showHeatmap && <HeatmapLayer properties={properties} />}
      </MapContainer>

      <MapControls
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => {}}
        onLocateUser={() => {}}
      />
    </div>
  );
}
```

### Phase 3: Navigation & Routing Enhancement (Week 5-6)

#### 3.1 Unified Properties Page

**Properties Page with Multiple Views**
```tsx
// pages/Properties.tsx
export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') as 'grid' | 'list' | 'map' | 'split' | null;

  const { data: properties, isLoading, error } = useProperties(filters);
  const { data: userLocation } = useUserLocation();

  // Redirect to MapView for split view
  if (view === 'split') {
    return <Navigate to="/map" replace />;
  }

  if (view === 'map') {
    return <Navigate to="/map" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters Header */}
      <div className="bg-card rounded-lg p-6 border">
        <SearchBar />
        <PropertyFilters />
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={!view || view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchParams({ view: 'grid' })}
          >
            <Grid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchParams({ view: 'list' })}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={view === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchParams({ view: 'split' })}
          >
            <Split className="w-4 h-4 mr-2" />
            Split View
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {properties?.length || 0} properties found
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <PropertyGridSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load properties" />
      ) : view === 'list' ? (
        <PropertyList properties={properties || []} />
      ) : (
        <PropertyGrid properties={properties || []} />
      )}
    </div>
  );
}
```

#### 3.2 Enhanced Layout with Better Navigation

**Updated Layout Component**
```tsx
// components/layout/Layout.tsx
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/properties", icon: Search, label: "Browse" },
    { path: "/map", icon: MapPin, label: "Map View" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/dashboard", icon: Building2, label: "Dashboard" },
    { path: "/subscriptions", icon: CreditCard, label: "Plans" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/properties") {
      return location.pathname.startsWith("/properties") || location.pathname === "/map";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:fixed md:top-0 md:left-0 md:h-screen md:flex md:flex-col md:bg-card md:border-r md:border-border md:transition-all md:duration-300 md:z-40",
        sidebarCollapsed ? "md:w-16" : "md:w-60"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              RentalHunters
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              sidebarCollapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          {isAuthenticated ? (
            <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                {!sidebarCollapsed && "Sign In"}
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold">RentalHunters</span>
        </Link>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <span className="font-bold">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="py-4">
                <ul className="space-y-1 px-2">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                          isActive(item.path)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        "md:ml-60 pt-14 md:pt-0"
      )}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### Phase 4: Advanced Features & Polish (Week 7-8)

#### 4.1 Search & Filtering System

**Advanced Search Component**
```tsx
// components/search/AdvancedSearch.tsx
export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: locationSuggestions } = useLocationSuggestions(searchQuery);

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      search: searchQuery,
      location: location,
    };
    // Update global filters
    propertyStore.updateFilters(searchFilters);
  };

  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Location Search */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            className="pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {locationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-md shadow-lg mt-1 z-50">
              {locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full text-left px-4 py-2 hover:bg-accent"
                  onClick={() => {
                    setSearchQuery(suggestion.display_name);
                    setLocation(suggestion.place_name);
                  }}
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Type */}
        <Select value={filters.property_type} onValueChange={(value) => setFilters({...filters, property_type: value})}>
          <SelectTrigger className="w-full md:w-48 h-12">
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Range */}
        <div className="flex gap-2">
          <Input
            placeholder="Min price"
            className="w-24 h-12"
            value={filters.price_min || ''}
            onChange={(e) => setFilters({...filters, price_min: e.target.value})}
          />
          <Input
            placeholder="Max price"
            className="w-24 h-12"
            value={filters.price_max || ''}
            onChange={(e) => setFilters({...filters, price_max: e.target.value})}
          />
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-12 px-8">
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="mt-4">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-muted-foreground"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Advanced Filters
          {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <AdvancedFilters
                filters={filters}
                onChange={setFilters}
                className="mt-4 pt-4 border-t"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

#### 4.2 Loading States & Error Handling

**Loading Components**
```tsx
// components/common/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        sizeClasses[size]
      )} />
    </div>
  );
}

// components/common/PropertyGridSkeleton.tsx
export function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-48 bg-muted animate-pulse" />
          <CardContent className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
            <div className="flex justify-between">
              <div className="h-6 bg-muted rounded w-20 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Error Boundary**
```tsx
// components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">
                We encountered an error while loading this page.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Phase 5: Testing & Optimization (Week 9-10)

#### 5.1 Testing Strategy

**Component Testing**
```typescript
// __tests__/components/PropertyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard } from '@/components/property/PropertyCard';

const mockProperty: Property = {
  id: '1',
  title: 'Test Property',
  location: 'Test Location',
  price: 25000,
  bedrooms: 2,
  bathrooms: 1,
  primary_image: 'test-image.jpg',
  is_premium: true,
  status: 'AVAILABLE',
  latitude: -1.35,
  longitude: 36.78,
};

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('KSh 25,000')).toBeInTheDocument();
    expect(screen.getByText('2 beds')).toBeInTheDocument();
  });

  it('displays premium badge for premium properties', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});
```

**Integration Testing**
```typescript
// __tests__/pages/PropertiesPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PropertiesPage from '@/pages/Properties';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PropertiesPage', () => {
  it('displays loading state initially', () => {
    renderWithProviders(<PropertiesPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays properties when loaded', async () => {
    // Mock API response
    renderWithProviders(<PropertiesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });
  });
});
```

#### 5.2 Performance Optimization

**Code Splitting & Lazy Loading**
```typescript
// lib/router.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Home = lazy(() => import('@/pages/Home'));
const Properties = lazy(() => import('@/pages/Properties'));
const MapView = lazy(() => import('@/pages/MapView'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}
```

**Image Optimization**
```typescript
// components/common/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-muted-foreground" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
```

## Implementation Timeline

### Week 1-2: Foundation & Architecture
- ✅ File organization restructure
- ✅ State management setup (Zustand + React Query)
- ✅ API client implementation
- ✅ Basic component structure

### Week 3-4: Core Components Development
- ✅ PropertyCard, PropertyGrid, PropertyList components
- ✅ Enhanced PropertyMap with clustering
- ✅ MapView page with split layout (60/40)
- ✅ Search and filtering components

### Week 5-6: Navigation & Routing Enhancement
- ✅ Unified Properties page with view switching
- ✅ Enhanced Layout with better navigation
- ✅ Routing improvements and redirects
- ✅ Mobile responsiveness improvements

### Week 7-8: Advanced Features & Polish
- ✅ Advanced search with autocomplete
- ✅ Loading states and error handling
- ✅ Booking system integration
- ✅ User authentication flow

### Week 9-10: Testing & Optimization
- ✅ Component and integration tests
- ✅ Performance optimization (code splitting, lazy loading)
- ✅ Image optimization and caching
- ✅ Final UI/UX polish and accessibility

## Success Criteria

### Functional Requirements
- [ ] All navigation buttons and links are fully functional
- [ ] Map View page implements 60/40 vertical split layout
- [ ] Property browsing supports grid and list view toggles
- [ ] Search and filtering work across all views
- [ ] User authentication and authorization implemented
- [ ] Property booking system functional
- [ ] Responsive design works on all screen sizes

### Performance Requirements
- [ ] Initial page load under 3 seconds
- [ ] Property search results load under 1 second
- [ ] Map interactions are smooth (60fps)
- [ ] Memory usage stays under 100MB
- [ ] Lighthouse score above 90

### Quality Requirements
- [ ] Test coverage above 80%
- [ ] Zero critical accessibility issues
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile-first responsive design
- [ ] Error boundaries prevent app crashes

## Risk Mitigation

### Technical Risks
1. **API Integration Delays**: Implement mock data fallbacks
2. **Map Performance Issues**: Use clustering and virtualization
3. **State Management Complexity**: Start with simple Zustand stores
4. **Browser Compatibility**: Use polyfills and progressive enhancement

### Timeline Risks
1. **Scope Creep**: Strict feature prioritization
2. **Third-party Dependencies**: Vendor evaluation and fallbacks
3. **Team Learning Curve**: Comprehensive documentation and pair programming
4. **External API Limits**: Implement caching and rate limiting

## Conclusion

This implementation plan provides a comprehensive roadmap for transforming RentalHunters into a professional, Airbnb-inspired real estate platform. The phased approach ensures quality delivery while maintaining momentum, with clear success criteria and risk mitigation strategies.

The final result will be a modern, performant, and user-friendly application that provides an exceptional property browsing experience with fluid navigation, intuitive map interactions, and professional UI patterns.