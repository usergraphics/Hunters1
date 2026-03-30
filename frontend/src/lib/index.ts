export const ROUTE_PATHS = {
  HOME: "/",
  PROPERTIES: "/properties",
  PROPERTY_DETAIL: "/properties/:id",
  DASHBOARD: "/dashboard",
  ADD_PROPERTY: "/dashboard/add-property",
  EDIT_PROPERTY: "/dashboard/edit-property/:id",
  SUBSCRIPTIONS: "/subscriptions",
  PROFILE: "/profile",
  LOGIN: "/login",
  FINANCE: "/finance",
} as const;

export type UserRole = "TENANT" | "LANDLORD" | "AGENT" | "ADMIN";

export type SubscriptionTier = "FREE" | "VERIFIED" | "PRIORITY" | "STARTER" | "MANAGER" | "ESTATE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  avatar_url?: string;
  phone_number?: string;
  is_phone_verified: boolean;
  is_id_verified: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  property_type: string;
  location: string;
  sub_location: string;
  address: string;
  latitude: number;
  longitude: number;
  show_exact_location: boolean;
  primary_image: string;
  images: string[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  total_units: number;
  available_units: number;
  status: "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE" | "RESERVED";
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  landlord?: User;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  deposit: number;
  status: "AVAILABLE" | "OCCUPIED" | "UNDER_MAINTENANCE" | "RESERVED";
  floor_number?: number;
  square_meters?: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  unit_id?: string;
  tenant_id: string;
  landlord_id: string;
  viewing_date: string;
  viewing_time: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  is_priority: boolean;
  created_at: string;
  property?: Property;
  tenant?: User;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: "SECURITY" | "UTILITIES" | "COMFORT" | "CONNECTIVITY";
}

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "single", label: "Single Room" },
] as const;

export const LOCATIONS = [
  { value: "ongata-rongai", label: "Ongata Rongai" },
  { value: "kiserian", label: "Kiserian" },
  { value: "magadi", label: "Magadi" },
  { value: "ngong", label: "Ngong" },
  { value: "kilimani", label: "Kilimani" },
  { value: "karen", label: "Karen" },
] as const;

export const SUBSCRIPTION_PLANS = {
  tenant: [
    { tier: "FREE", name: "Free Explorer", price: 0, features: ["Browse all listings", "Unlimited bookings", "Save unlimited properties", "Full map visibility", "Exact location access", "Advanced filters", "Property comparison", "Market insights", "SMS alerts", "Priority viewing", "Early access"] },
    { tier: "VERIFIED", name: "Verified Seeker", price: 500, features: ["Browse all listings", "Unlimited bookings", "Save unlimited properties", "Full map visibility", "Exact location access", "Advanced filters", "Property comparison", "Market insights", "SMS alerts", "Priority viewing", "Early access"] },
    { tier: "PRIORITY", name: "Priority Hunter", price: 1500, features: ["Browse all listings", "Unlimited bookings", "Save unlimited properties", "Full map visibility", "Exact location access", "Advanced filters", "Property comparison", "Market insights", "SMS alerts", "Priority viewing", "Early access"] },
  ],
  landlord: [
    { tier: "STARTER", name: "Starter Landlord", price: 0, features: ["Unlimited property listings", "Basic analytics", "Featured placement", "Advanced analytics", "Unit management", "Top placement"] },
    { tier: "MANAGER", name: "Property Manager", price: 1000, features: ["Unlimited property listings", "Basic analytics", "Featured placement", "Advanced analytics", "Unit management", "Top placement"] },
    { tier: "ESTATE", name: "Estate Pro", price: 2500, features: ["Unlimited property listings", "Basic analytics", "Featured placement", "Advanced analytics", "Unit management", "Top placement"] },
  ],
} as const;

export const PERMISSIONS = {
  exactLocation: true,
  fullMapAccess: true,
  advancedFilters: true,
  propertyComparison: true,
  marketInsights: true,
  savedSearches: true,
  virtualTours: true,
  floorPlans: true,
  neighborhoodData: true,
  unlimitedBookmarks: true,
  heatmapView: true,
  clustering: true,
  splitView: true,
} as const;

export const DEFAULT_AMENITIES: Amenity[] = [
  { id: "parking", name: "Parking", icon: "Car", category: "UTILITIES" },
  { id: "water", name: "Water Supply", icon: "Droplets", category: "UTILITIES" },
  { id: "electricity", name: "Electricity", icon: "Zap", category: "UTILITIES" },
  { id: "security", name: "Security", icon: "Shield", category: "SECURITY" },
  { id: "cctv", name: "CCTV", icon: "Camera", category: "SECURITY" },
  { id: "garden", name: "Garden", icon: "Trees", category: "COMFORT" },
  { id: "gym", name: "Gym", icon: "Dumbbell", category: "COMFORT" },
  { id: "pool", name: "Swimming Pool", icon: "Waves", category: "COMFORT" },
  { id: "wifi", name: "WiFi", icon: "Wifi", category: "CONNECTIVITY" },
  { id: "furnished", name: "Furnished", icon: "Sofa", category: "COMFORT" },
];
