# RentalHunters Frontend Revamp Implementation Plan

## Executive Summary

This document outlines a comprehensive frontend revamp implementation plan for the RentalHunters real estate platform. The revamp addresses critical UI/UX issues, implements Airbnb-inspired features, and establishes a scalable architecture.

**Current Application State:**
- Frontend Completeness: 50% (UI scaffolded, hardcoded data, no API integration)
- Backend Completeness: 60% (route stubs, no logic)
- Overall: ~47% production-ready

**Target State:**
- Professional, Airbnb-inspired interface
- Split-view Map page (60% properties / 40% map)
- Fully functional navigation
- API-driven data
- Responsive, fluid UX

---

## Part 1: Current Issues Analysis

### 1.1 Code Structure Problems

| Issue | File(s) | Impact | Priority |
|-------|---------|--------|----------|
| Multiple property pages with duplicate logic | `Properties.tsx`, `PropertiesMap.tsx`, `PropertiesBrowse.tsx` | Maintenance nightmare | Critical |
| No split-view map layout | `PropertiesMap.tsx` | Missing core feature | Critical |
| Hardcoded mock data everywhere | All pages | No real functionality | Critical |
| Incomplete routing | `App.tsx` | Missing pages | High |
| No auth state management | All pages | Can't track users | High |
| Forms don't submit to backend | `Login.tsx`, `AddProperty.tsx` | Broken flows | High |
| No loading/error states | All pages | Poor UX | Medium |
| Duplicate property data | `Home.tsx`, `Properties.tsx`, etc. | Data inconsistency | Medium |
| Missing Components | - | Incomplete UI | Medium |

### 1.2 Navigation Issues

**Current Routes (from [`frontend/src/App.tsx`](frontend/src/App.tsx:1)):**
```
/                     → Home
/properties           → Properties
/properties/:id       → PropertyDetail
/properties?view=map  → Redirects to Properties (broken)
/dashboard            → Dashboard
/dashboard/add-property → AddProperty
/subscriptions        → Subscriptions
/profile              → Profile
/login                → Login
```

**Missing Routes:**
- `/map` - Dedicated map view page
- `/favorites` - Saved properties
- `/messages` - Messaging
- `/bookings` - User bookings
- `/dashboard/properties` - Landlord properties
- `/dashboard/bookings` - Landlord bookings
- `/dashboard/analytics` - Analytics

### 1.3 Map View Current State

The [`PropertiesMap.tsx`](frontend/src/pages/PropertiesMap.tsx:1) page has:
- Hardcoded `allProperties` array with 6 properties
- Basic filter sidebar
- Map component on full page
- No split layout (property list separate from map)
- No grid/list toggle

---

## Part 2: New File Structure

### 2.1 Recommended Directory Organization

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── Sidebar.tsx             # Desktop sidebar navigation
│   │   ├── MobileMenu.tsx          # Mobile navigation drawer
│   │   ├── Layout.tsx              # Main layout wrapper
│   │   └── PageContainer.tsx       # Consistent page wrapper
│   ├── ui/                         # Existing UI components
│   ├── property/
│   │   ├── PropertyCard.tsx        # Individual property card
│   │   ├── PropertyGrid.tsx        # Grid view container
│   │   ├── PropertyList.tsx        # List view container
│   │   ├── PropertyFilters.tsx     # Filter sidebar
│   │   ├── PropertySearch.tsx      # Search bar component
│   │   ├── PropertySort.tsx        # Sort dropdown
│   │   ├── PropertyCardSkeleton.tsx # Loading skeleton
│   │   └── PropertyEmpty.tsx       # Empty state
│   ├── map/
│   │   ├── MapView.tsx             # Main map component
│   │   ├── MapControls.tsx          # Map control buttons
│   │   ├── MapMarker.tsx           # Custom property marker
│   │   ├── MapPopup.tsx            # Marker popup
│   │   ├── MapCluster.tsx          # Marker clustering
│   │   └── MapSearchArea.tsx       # Search this area button
│   ├── search/
│   │   ├── SearchBar.tsx           # Main search input
│   │   ├── LocationAutocomplete.tsx # Location suggestions
│   │   ├── DateRangePicker.tsx     # Date selection
│   │   ├── GuestSelector.tsx      # Guest/tenant count
│   │   └── FilterPanel.tsx        # Advanced filters modal
│   ├── booking/
│   │   ├── BookingCard.tsx        # Booking summary card
│   │   ├── BookingForm.tsx        # Booking request form
│   │   ├── BookingStatus.tsx      # Status badge
│   │   └── BookingList.tsx        # User's bookings
│   ├── auth/
│   │   ├── LoginForm.tsx          # Login form
│   │   ├── RegisterForm.tsx       # Registration form
│   │   ├── PasswordReset.tsx      # Password reset
│   │   └── AuthModal.tsx          # Auth modal wrapper
│   ├── dashboard/
│   │   ├── StatsCard.tsx          # Dashboard stat cards
│   │   ├── RevenueChart.tsx       # Revenue visualization
│   │   ├── PropertiesTable.tsx   # Landlord properties table
│   │   └── BookingsTable.tsx     # Bookings table
│   └── common/
│       ├── LoadingSpinner.tsx     # Reusable spinner
│       ├── PageLoader.tsx         # Full page loader
│       ├── ErrorBoundary.tsx     # Error catching
│       ├── ErrorMessage.tsx      # Error display
│       ├── EmptyState.tsx        # Empty data state
│       ├── Pagination.tsx        # Pagination controls
│       └── Toast.tsx             # Notification toasts
├── pages/
│   ├── Home.tsx                   # Landing page
│   ├── Properties.tsx             # Browse properties (grid/list)
│   ├── MapView.tsx               # Split-view map (NEW)
│   ├── PropertyDetail.tsx        # Property details
│   ├── Favorites.tsx             # Saved properties (NEW)
│   ├── Messages.tsx               # Messages inbox (NEW)
│   ├── Bookings.tsx              # User bookings (NEW)
│   ├── Login.tsx                 # Login/Register
│   ├── Dashboard.tsx             # Main dashboard
│   ├── dashboard/
│   │   ├── DashboardHome.tsx     # Dashboard overview
│   │   ├── Properties.tsx        # Manage properties
│   │   ├── AddProperty.tsx       # Add new property
│   │   ├── EditProperty.tsx      # Edit property
│   │   ├── Bookings.tsx         # View bookings
│   │   ├── Analytics.tsx        # Analytics
│   │   └── Settings.tsx         # Account settings
│   ├── Profile.tsx               # User profile
│   ├── Subscriptions.tsx         # Subscription plans
│   └── NotFound.tsx              # 404 page
├── hooks/
│   ├── useProperties.ts          # Property data fetching
│   ├── useProperty.ts            # Single property
│   ├── useFilters.ts             # Filter state management
│   ├── useAuth.ts                # Auth state
│   ├── useBookings.ts            # Booking operations
│   ├── useFavorites.ts           # Saved properties
│   ├── useMap.ts                 # Map interactions
│   ├── useSearch.ts              # Search functionality
│   └── usePagination.ts          # Pagination
├── services/
│   ├── api.ts                    # Axios instance + interceptors
│   ├── auth.ts                   # Auth endpoints
│   ├── properties.ts             # Property endpoints
│   ├── bookings.ts               # Booking endpoints
│   ├── users.ts                  # User endpoints
│   └── subscriptions.ts          # Subscription endpoints
├── stores/
│   ├── authStore.ts              # User auth state (Zustand)
│   ├── filterStore.ts            # Filter state
│   ├── mapStore.ts               # Map state
│   └── uiStore.ts                # UI state (modals, toasts)
├── types/
│   ├── property.ts               # Property types
│   ├── user.ts                   # User types
│   ├── booking.ts                # Booking types
│   ├── filter.ts                 # Filter types
│   └── api.ts                    # API response types
├── utils/
│   ├── constants.ts              # App constants
│   ├── formatters.ts              # Number/date formatters
│   ├── validation.ts             # Validation schemas
│   └── helpers.ts                # Utility functions
├── lib/
│   ├── queryClient.ts             # React Query setup
│   ├── router.tsx                 # Route definitions
│   └── utils.ts                   # Shared utilities
├── context/
│   ├── AuthContext.tsx            # Auth provider
│   └── FilterContext.tsx          # Filter provider
└── App.tsx                        # Root component
```

---

## Part 3: Map View Split-Layout Specification

### 3.1 Layout Structure

The Map View page must implement a vertical split layout:

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER (optional)                        │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│   PROPERTY LIST (60%)          │      MAP (40%)                │
│   - Scrollable                 │      - Fixed/Sticky           │
│   - Grid/List toggle           │      - Full height            │
│   - Filters header             │      - No scroll              │
│                                │                                │
│   ┌─────┐ ┌─────┐             │         📍                    │
│   │Prop │ │Prop │             │              📍              │
│   └─────┘ └─────┘             │   📍                          │
│   ┌─────┐ ┌─────┐             │                                │
│   │Prop │ │Prop │             │        📍                     │
│   └─────┘ └─────┘             │                                │
│   ┌─────┐                     │                                │
│   │Prop │                     │                                │
│   └─────┘                     │                                │
│                                │                                │
│   [Pagination]                │                                │
└────────────────────────────────┴────────────────────────────────┘
```

### 3.2 Component: MapViewPage

**File:** `src/pages/MapView.tsx`

```typescript
interface MapViewPageProps {
  // No props needed - uses URL params for state
}

export default function MapViewPage() {
  // State from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get('view') as 'grid' | 'list' | null;
  
  // Property selection state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  // Filter state
  const filters = useFilterStore();
  
  // Fetch properties
  const { data: properties, isLoading, error } = useProperties(filters);
  
  // Selected property for map
  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
  
  // Map bounds changed handler
  const handleMapMove = (bounds: L.LatLngBounds) => {
    updateFilters({
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }
    });
  };

  return (
    <div className="h-[calc(100vh-var(--header-height))] flex">
      {/* Left Panel - 60% */}
      <div className="w-[60%] flex flex-col border-r border-border">
        {/* Search & Filters Header */}
        <PropertySearchHeader 
          onFilterChange={updateFilters}
          viewMode={viewMode}
          onViewModeChange={(mode) => setSearchParams({ view: mode })}
        />
        
        {/* Property Count */}
        <div className="px-4 py-2 border-b text-sm text-muted-foreground">
          {properties?.length || 0} stays · 
          {filters.dateFrom && filters.dateTo && ` ${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`}
        </div>
        
        {/* Property List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <PropertyListSkeleton />
          ) : error ? (
            <ErrorMessage message="Failed to load properties" />
          ) : properties?.length === 0 ? (
            <PropertyEmptyState />
          ) : viewMode === 'list' ? (
            <PropertyList
              properties={properties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
            />
          ) : (
            <PropertyGrid
              properties={properties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
            />
          )}
        </div>
        
        {/* Pagination */}
        <PropertyPagination />
      </div>
      
      {/* Right Panel - 40% */}
      <div className="w-[40%] sticky top-0 h-full">
        <PropertyMap
          properties={properties || []}
          selectedId={selectedPropertyId}
          onSelectProperty={setSelectedPropertyId}
          onBoundsChange={handleMapMove}
          showSearchAreaButton
          center={[-1.35, 36.78]} // Ongata Rongai center
          zoom={12}
        />
      </div>
    </div>
  );
}
```

### 3.3 Component: PropertyMap

**File:** `src/components/map/PropertyMap.tsx`

Key features:
- Full-height container (no scroll)
- Marker clustering for performance
- Custom markers showing price
- Popup on hover/click
- "Search this area" button
- Current location button
- Zoom controls

```typescript
interface PropertyMapProps {
  properties: Property[];
  selectedId?: string | null;
  onSelectProperty?: (id: string | null) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  showSearchAreaButton?: boolean;
  center?: [number, number];
  zoom?: number;
}

export function PropertyMap({
  properties,
  selectedId,
  onSelectProperty,
  onBoundsChange,
  showSearchAreaButton = false,
  center = [-1.35, 36.78],
  zoom = 12,
}: PropertyMapProps) {
  const mapRef = useRef<L.Map>(null);
  
  // Fly to selected property
  useEffect(() => {
    if (selectedId && mapRef.current) {
      const property = properties.find(p => p.id === selectedId);
      if (property) {
        mapRef.current.flyTo([property.latitude, property.longitude], 15, {
          duration: 1,
        });
      }
    }
  }, [selectedId, properties]);
  
  // Handle bounds change (debounced)
  const handleMoveEnd = useCallback(
    debounce(() => {
      if (mapRef.current && onBoundsChange) {
        onBoundsChange(mapRef.current.getBounds());
      }
    }, 300),
    [onBoundsChange]
  );

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="w-full h-full"
        whenReady={(map) => {
          map.instance.on('moveend', handleMoveEnd);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        
        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createPriceMarker(property.price, property.id === selectedId)}
            eventHandlers={{
              click: () => onSelectProperty?.(property.id),
            }}
          >
            <Popup>
              <PropertyPopup property={property} />
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
      
      {/* Search This Area Button */}
      {showSearchAreaButton && (
        <SearchAreaButton 
          onClick={() => {
            if (mapRef.current) {
              onBoundsChange?.(mapRef.current.getBounds());
            }
          }}
        />
      )}
      
      {/* Map Controls */}
      <MapControls map={mapRef.current} />
    </div>
  );
}
```

### 3.4 Grid/List Toggle

**File:** `src/components/property/ViewToggle.tsx`

```typescript
interface ViewToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
  counts?: { grid: number; list: number };
}

export function ViewToggle({ mode, onChange, counts }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={mode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
      >
        <Grid className="w-4 h-4" />
        <span className="ml-2 hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={mode === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
      >
        <List className="w-4 h-4" />
        <span className="ml-2 hidden sm:inline">List</span>
      </Button>
    </div>
  );
}
```

---

## Part 4: Navigation & Routing Improvements

### 4.1 Updated Route Configuration

**File:** `src/lib/router.tsx`

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import Layout from '@/components/layout/Layout';

// Lazy load all pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Properties = lazy(() => import('@/pages/Properties'));
const MapView = lazy(() => import('@/pages/MapView'));
const PropertyDetail = lazy(() => import('@/pages/PropertyDetail'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Messages = lazy(() => import('@/pages/Messages'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Subscriptions = lazy(() => import('@/pages/Subscriptions'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Dashboard lazy imports
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));
const DashboardProperties = lazy(() => import('@/pages/dashboard/Properties'));
const AddProperty = lazy(() => import('@/pages/dashboard/AddProperty'));
const EditProperty = lazy(() => import('@/pages/dashboard/EditProperty'));
const DashboardBookings = lazy(() => import('@/pages/dashboard/Bookings'));
const DashboardAnalytics = lazy(() => import('@/pages/dashboard/Analytics'));
const DashboardSettings = lazy(() => import('@/pages/dashboard/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Auth Routes (no layout) */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="properties" element={<DashboardProperties />} />
          <Route path="add-property" element={<AddProperty />} />
          <Route path="edit-property/:id" element={<EditProperty />} />
          <Route path="bookings" element={<DashboardBookings />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
```

### 4.2 Navigation Items

**File:** `src/components/layout/NavigationItems.tsx`

```typescript
export const navItems = [
  // Main navigation
  { path: '/', icon: Home, label: 'Home', public: true },
  { path: '/properties', icon: Search, label: 'Browse', public: true },
  { path: '/map', icon: MapPin, label: 'Map View', public: true },
  
  // User-specific (require auth)
  { path: '/favorites', icon: Heart, label: 'Favorites', auth: true },
  { path: '/bookings', icon: Calendar, label: 'My Bookings', auth: true },
  { path: '/messages', icon: MessageSquare, label: 'Messages', auth: true },
  
  // Landlord dashboard
  { path: '/dashboard', icon: Building2, label: 'Dashboard', landlord: true },
  
  // Account
  { path: '/subscriptions', icon: CreditCard, label: 'Plans', public: true },
  { path: '/profile', icon: User, label: 'Profile', auth: true },
];

export const mobileNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/properties', icon: Search, label: 'Search' },
  { path: '/map', icon: MapPin, label: 'Map' },
  { path: '/favorites', icon: Heart, label: 'Favorites', auth: true },
  { path: '/profile', icon: User, label: 'Profile', auth: true },
];
```

---

## Part 5: Component Hierarchy

### 5.1 Page Component Tree

```
App
└── QueryClientProvider
    └── BrowserRouter
        └── AppRoutes
            ├── Layout (public pages)
            │   ├── Header
            │   ├── Sidebar (desktop)
            │   ├── MobileMenu (mobile)
            │   ├── PageContainer
            │   └── Routes
            │       ├── Home
            │       │   ├── HeroSection
            │       │   ├── SearchBar
            │       │   ├── FeaturedProperties
            │       │   ├── LocationShowcase
            │       │   └── CTASection
            │       ├── Properties
            │       │   ├── SearchBar
            │       │   ├── FilterPanel
            │       │   ├── ViewToggle
            │       │   ├── PropertyGrid / PropertyList
            │       │   │   └── PropertyCard[]
            │       │   └── Pagination
            │       ├── MapView (SPLIT LAYOUT)
            │       │   ├── PropertySearchHeader
            │       │   ├── PropertyListContainer (scrollable)
            │       │   │   ├── PropertyGrid / PropertyList
            │       │   │   └── PropertyCard[]
            │       │   └── PropertyMap (fixed, no scroll)
            │       ├── PropertyDetail
            │       │   ├── ImageGallery
            │       │   ├── PropertyInfo
            │       │   ├── AmenitiesList
            │       │   ├── LocationMap
            │       │   ├── BookingForm
            │       │   └── LandlordInfo
            │       ├── Favorites (auth required)
            │       ├── Bookings (auth required)
            │       ├── Messages (auth required)
            │       ├── Subscriptions
            │       ├── Profile (auth required)
            │       └── NotFound
            ├── Login (no layout)
            └── Dashboard (separate layout)
                ├── DashboardHome
                ├── Properties
                ├── AddProperty
                ├── EditProperty
                ├── Bookings
                ├── Analytics
                └── Settings
```

### 5.2 PropertyCard Component

**File:** `src/components/property/PropertyCard.tsx`

```typescript
interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'horizontal';
  selected?: boolean;
  onSelect?: (property: Property) => void;
  onSave?: (property: Property) => void;
  showActions?: boolean;
}

export function PropertyCard({
  property,
  variant = 'default',
  selected = false,
  onSelect,
  onSave,
  showActions = true,
}: PropertyCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    onSelect?.(property);
  };
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(property);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary",
        variant === 'horizontal' && "flex"
      )}
      onClick={handleClick}
    >
      {/* Image */}
      <div className={cn(
        "relative",
        variant === 'default' && "aspect-[4/3]",
        variant === 'compact' && "h-32",
        variant === 'horizontal' && "w-48 shrink-0"
      )}>
        <img
          src={property.primary_image}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Premium Badge */}
        {property.is_premium && (
          <Badge className="absolute top-2 left-2 bg-primary">
            Premium
          </Badge>
        )}
        
        {/* Save Button */}
        {showActions && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleSave}
          >
            <Heart className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Content */}
      <CardContent className={cn("p-4", variant === 'horizontal' && "flex-1")}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate flex-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 fill-current text-yellow-500" />
            <span className="text-sm">{property.rating || '4.8'}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-2">
          {property.location}
          {property.sub_location && ` · ${property.sub_location}`}
        </p>
        
        {/* Property Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          {property.square_meters && <span>{property.square_meters}m²</span>}
        </div>
        
        {/* Price & Status */}
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">
              KSh {property.price.toLocaleString()}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <Badge variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Part 6: API Integration

### 6.1 API Client Setup

**File:** `src/services/api.ts`

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 6.2 Property Service

**File:** `src/services/properties.ts`

```typescript
import { api, PaginatedResponse } from './api';
import { Property, PropertyFilters } from '@/types/property';

interface GetPropertiesParams extends PropertyFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const propertiesApi = {
  getProperties: async (params: GetPropertiesParams = {}): Promise<PaginatedResponse<Property>> => {
    const { data } = await api.get<PaginatedResponse<Property>>('/properties', { params });
    return data;
  },

  getProperty: async (id: string): Promise<Property> => {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
  },

  createProperty: async (property: Partial<Property>): Promise<Property> => {
    const { data } = await api.post<Property>('/properties', property);
    return data;
  },

  updateProperty: async (id: string, property: Partial<Property>): Promise<Property> => {
    const { data } = await api.put<Property>(`/properties/${id}`, property);
    return data;
  },

  deleteProperty: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },

  getFeaturedProperties: async (limit: number = 4): Promise<Property[]> => {
    const { data } = await api.get<Property[]>('/properties/featured', { 
      params: { limit } 
    });
    return data;
  },

  searchProperties: async (query: string): Promise<Property[]> => {
    const { data } = await api.get<Property[]>('/properties/search', { 
      params: { q: query } 
    });
    return data;
  },
};
```

### 6.3 React Query Hooks

**File:** `src/hooks/useProperties.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '@/services/properties';
import { PropertyFilters } from '@/types/property';

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.getProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getProperty(id),
    enabled: !!id,
  });
}

export function useFeaturedProperties(limit: number = 4) {
  return useQuery({
    queryKey: ['featuredProperties', limit],
    queryFn: () => propertiesApi.getFeaturedProperties(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: propertiesApi.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) => 
      propertiesApi.updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: propertiesApi.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
```

---

## Part 7: Implementation Batches

### Batch 1: Foundation & Core Infrastructure (Week 1-2)

**Goal:** Set up architecture, state management, and routing

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Install Zustand | `package.json` | Critical | State management library |
| Create API client | `src/services/api.ts` | Critical | HTTP client with interceptors |
| Set up React Query | `src/lib/queryClient.ts` | Critical | Query configuration |
| Create auth store | `src/stores/authStore.ts` | Critical | User state management |
| Create filter store | `src/stores/filterStore.ts` | Critical | Filter state |
| Set up router | `src/lib/router.tsx` | Critical | Route configuration with lazy loading |
| Create AuthContext | `src/context/AuthContext.tsx` | High | Auth provider |

**Success Criteria:**
- API client makes requests with auth tokens
- React Query caching working
- Routes lazy-loaded
- Auth state persists across refreshes

### Batch 2: Layout & Navigation (Week 2)

**Goal:** Fix navigation, add missing routes, improve layout

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Refactor Layout | `src/components/layout/Layout.tsx` | Critical | Fixed sidebar, mobile menu |
| Create Header | `src/components/layout/Header.tsx` | High | Top navigation |
| Create Sidebar | `src/components/layout/Sidebar.tsx` | High | Desktop navigation |
| Create MobileMenu | `src/components/layout/MobileMenu.tsx` | High | Mobile drawer |
| Add missing routes | `src/lib/router.tsx` | Critical | All pages mapped |
| Create NotFound | `src/pages/NotFound.tsx` | Medium | 404 page |

**Navigation Links to Fix:**
- [ ] Home → `/`
- [ ] Browse → `/properties`
- [ ] Map View → `/map` (NEW dedicated page)
- [ ] Favorites → `/favorites` (NEW page)
- [ ] Dashboard → `/dashboard`
- [ ] Plans → `/subscriptions`
- [ ] Profile → `/profile`
- [ ] Login → `/login`

### Batch 3: Map View Split Layout (Week 2-3)

**Goal:** Implement the core 60/40 split-view map page

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Create MapView page | `src/pages/MapView.tsx` | Critical | Split layout container |
| Enhance PropertyMap | `src/components/map/PropertyMap.tsx` | Critical | Fixed map component |
| Create MapMarker | `src/components/map/MapMarker.tsx` | High | Custom price markers |
| Create MapPopup | `src/components/map/MapPopup.tsx` | High | Marker popup |
| Create PropertyGrid | `src/components/property/PropertyGrid.tsx` | Critical | Scrollable grid |
| Create PropertyList | `src/components/property/PropertyList.tsx` | High | List view option |
| Create PropertyCard | `src/components/property/PropertyCard.tsx` | Critical | Property card component |
| Create ViewToggle | `src/components/property/ViewToggle.tsx` | High | Grid/list toggle |
| Connect to API | All map components | Critical | Real property data |

**Success Criteria:**
- Left panel (60%) scrolls with property list
- Right panel (40%) stays fixed with full-height map
- Map markers show prices
- Clicking marker selects property
- Grid/list toggle works
- Real data from API

### Batch 4: Properties Page Refactor (Week 3)

**Goal:** Unify property browsing into single page

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Refactor Properties page | `src/pages/Properties.tsx` | Critical | Unified browse page |
| Create PropertyFilters | `src/components/property/PropertyFilters.tsx` | High | Filter sidebar |
| Create PropertySearch | `src/components/property/PropertySearch.tsx` | High | Search bar |
| Create Pagination | `src/components/common/Pagination.tsx` | High | Page navigation |
| Delete duplicate pages | `PropertiesBrowse.tsx`, `PropertiesMap.tsx` | Medium | Remove old files |

**Deprecate:**
- `src/pages/PropertiesBrowse.tsx` → Merge into `Properties.tsx`
- `src/pages/PropertiesMap.tsx` → Move to `MapView.tsx`

### Batch 5: Common Components (Week 3-4)

**Goal:** Add loading states, error handling, empty states

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Create LoadingSpinner | `src/components/common/LoadingSpinner.tsx` | High | Reusable spinner |
| Create PageLoader | `src/components/common/PageLoader.tsx` | High | Full page loader |
| Create ErrorBoundary | `src/components/common/ErrorBoundary.tsx` | High | Error catching |
| Create ErrorMessage | `src/components/common/ErrorMessage.tsx` | High | Error display |
| Create EmptyState | `src/components/common/EmptyState.tsx` | High | Empty data state |
| Create PropertyCardSkeleton | `src/components/property/PropertyCardSkeleton.tsx` | High | Loading skeleton |
| Create Toast | `src/components/common/Toast.tsx` | Medium | Notifications |

### Batch 6: Search & Filters (Week 4)

**Goal:** Advanced search functionality

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Create SearchBar | `src/components/search/SearchBar.tsx` | High | Main search input |
| Create LocationAutocomplete | `src/components/search/LocationAutocomplete.tsx` | High | Location suggestions |
| Create FilterPanel | `src/components/search/FilterPanel.tsx` | High | Advanced filters modal |
| Create DateRangePicker | `src/components/search/DateRangePicker.tsx` | Medium | Date selection |
| Implement URL sync | Filter components | High | Filters in URL params |

### Batch 7: Authentication Integration (Week 4-5)

**Goal:** Connect login/register to backend

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Enhance LoginForm | `src/components/auth/LoginForm.tsx` | Critical | Real auth |
| Enhance RegisterForm | `src/components/auth/RegisterForm.tsx` | Critical | Real registration |
| Create AuthGuard | `src/components/auth/AuthGuard.tsx` | High | Protected routes |
| Create PasswordReset | `src/components/auth/PasswordReset.tsx` | Medium | Password recovery |
| Connect Login page | `src/pages/Login.tsx` | Critical | API integration |

### Batch 8: Dashboard Pages (Week 5-6)

**Goal:** Complete landlord dashboard

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Create DashboardHome | `src/pages/dashboard/DashboardHome.tsx` | High | Overview stats |
| Create DashboardProperties | `src/pages/dashboard/Properties.tsx` | High | Property management |
| Create AddProperty | `src/pages/dashboard/AddProperty.tsx` | Critical | Property creation form |
| Create EditProperty | `src/pages/dashboard/EditProperty.tsx` | High | Property editing |
| Create DashboardBookings | `src/pages/dashboard/Bookings.tsx` | High | Booking management |
| Create DashboardAnalytics | `src/pages/dashboard/Analytics.tsx` | Medium | Charts/stats |
| Create DashboardSettings | `src/pages/dashboard/Settings.tsx` | Medium | Account settings |

### Batch 9: User Features (Week 6)

**Goal:** Complete user functionality

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Create Favorites page | `src/pages/Favorites.tsx` | High | Saved properties |
| Create Bookings page | `src/pages/Bookings.tsx` | High | User bookings |
| Create Messages page | `src/pages/Messages.tsx` | Medium | Messaging |
| Enhance Profile page | `src/pages/Profile.tsx` | High | Profile editing |
| Create BookingForm | `src/components/booking/BookingForm.tsx` | Critical | Booking requests |

### Batch 10: Polish & Testing (Week 7-8)

**Goal:** Quality assurance and final polish

| Task | Files to Create/Modify | Priority | Deliverable |
|------|------------------------|----------|-------------|
| Add animations | Framer Motion | Medium | Smooth transitions |
| Responsive testing | All components | High | Mobile/tablet/desktop |
| Performance optimization | Bundle analysis | Medium | Code splitting |
| Accessibility audit | All components | High | A11y compliance |
| E2E tests | Critical flows | High | Playwright/Cypress |

---

## Part 8: Dependencies to Add

```json
{
  "dependencies": {
    "zustand": "^5.0.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^4.1.0",
    "react-leaflet-cluster": "^2.1.0",
    "@react-hooks.org/leader": "^1.0.0"
  }
}
```

---

## Part 9: Success Criteria

### Functional Requirements
- [ ] Map View implements 60/40 vertical split layout
- [ ] Left panel (properties) scrolls independently
- [ ] Right panel (map) stays fixed at full height
- [ ] Grid/List toggle switches property display
- [ ] All navigation links work correctly
- [ ] Routes properly lazy-loaded
- [ ] Auth flow works end-to-end
- [ ] All forms submit to API
- [ ] Loading states display during API calls
- [ ] Error states display on failures
- [ ] Empty states display when no data

### Performance Requirements
- [ ] Initial bundle < 300KB gzipped
- [ ] Page transitions < 300ms
- [ ] Map interactions smooth (60fps)
- [ ] Lazy loading works for all routes

### Quality Requirements
- [ ] TypeScript strict mode
- [ ] ESLint passing
- [ ] No console errors
- [ ] Responsive on all breakpoints
- [ ] Accessible (WCAG 2.1 AA)

---

## Part 10: Migration Strategy

### Step 1: Create New Structure (Week 1)
- Add new directories
- Install dependencies
- Set up stores

### Step 2: Build Core Components (Week 2)
- Create Layout components
- Build MapView page
- Create PropertyCard, PropertyGrid

### Step 3: Integrate APIs (Week 3-4)
- Connect services
- Update hooks
- Test data flow

### Step 4: Refactor Old Pages (Week 5)
- Move functionality from old files
- Delete deprecated files
- Update imports

### Step 5: Polish & Deploy (Week 6-8)
- Add loading states
- Fix edge cases
- Test thoroughly

---

## Appendix: File Changes Summary

### Files to CREATE (New)
- `src/lib/router.tsx`
- `src/stores/authStore.ts`
- `src/stores/filterStore.ts`
- `src/stores/mapStore.ts`
- `src/stores/uiStore.ts`
- `src/services/auth.ts`
- `src/services/properties.ts`
- `src/services/bookings.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useProperties.ts`
- `src/hooks/useFilters.ts`
- `src/context/AuthContext.tsx`
- `src/pages/MapView.tsx`
- `src/pages/Favorites.tsx`
- `src/pages/Messages.tsx`
- `src/pages/Bookings.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/dashboard/*.tsx` (7 files)
- `src/components/layout/*.tsx` (5 files)
- `src/components/map/*.tsx` (6 files)
- `src/components/property/*.tsx` (8 files)
- `src/components/search/*.tsx` (5 files)
- `src/components/booking/*.tsx` (4 files)
- `src/components/auth/*.tsx` (4 files)
- `src/components/common/*.tsx` (7 files)

### Files to MODIFY
- `src/App.tsx` - Update routing
- `src/main.tsx` - Add providers
- `src/lib/index.ts` - Export new utilities

### Files to DELETE (Deprecate)
- `src/pages/PropertiesBrowse.tsx`
- `src/pages/PropertiesMap.tsx`

---

*This implementation plan provides a complete roadmap for the frontend revamp. Each batch has clear deliverables, dependencies, and success criteria.*
