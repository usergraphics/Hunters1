import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Calendar, ArrowLeft, Heart, Share, Phone, MessageSquare, Check } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "leaflet/dist/leaflet.css";

const propertyData = {
  id: "1",
  title: "Modern Apartment in Ongata Rongai",
  description: "Beautiful modern apartment located in the heart of Ongata Rongai. This spacious unit features an open-plan living area, modern kitchen with granite countertops, and large windows that provide ample natural light. The bedroom is well-ventilated with built-in wardrobes. The bathroom is modern with quality fixtures. Perfect for young professionals or couples.",
  property_type: "apartment",
  location: "Ongata Rongai",
  sub_location: "Kware",
  address: "Kware Road, Near St. Mary's School",
  latitude: -1.3887,
  longitude: 36.7812,
  price: 25000,
  deposit: 50000,
  bedrooms: 2,
  bathrooms: 1,
  total_units: 4,
  available_units: 2,
  status: "AVAILABLE" as const,
  is_premium: true,
  is_featured: true,
  images: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  ],
  amenities: ["parking", "water", "electricity", "security", "wifi"],
  landlord: {
    id: "1",
    name: "John Smith",
    phone: "+254 700 123 456",
    email: "john@example.com",
    avatar: "",
    response_rate: "95%",
    response_time: "Within 1 hour",
  },
};

const amenityLabels: Record<string, string> = {
  parking: "Parking",
  water: "Water Supply",
  electricity: "Electricity",
  security: "Security",
  cctv: "CCTV",
  wifi: "WiFi",
  furnished: "Furnished",
  garden: "Garden",
  gym: "Gym",
  pool: "Swimming Pool",
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const property = propertyData;

  return (
    <div className="h-screen flex flex-col">
      {/* Back Button */}
      <div className="px-6 py-4 border-b">
        <Link to="/properties">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
      </div>

      {/* Main Content - Vertical Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Left Side - Property Details */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-video rounded-xl overflow-hidden"
            >
              <img
                src={property.images[selectedImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    selectedImage === index ? "border-rose-500" : "border-transparent"
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {property.is_premium && <Badge>Premium</Badge>}
                {property.is_featured && <Badge variant="secondary">Featured</Badge>}
                <Badge variant="available">Available</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-2">
                <MapPin className="w-4 h-4" />
                {property.location} • {property.sub_location}
              </p>
              <p className="text-muted-foreground mt-1">{property.address}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-muted-foreground" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">KSh {property.price.toLocaleString()}</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setShowBookingModal(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Book Viewing
              </Button>
              <Button variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4" />
              </Button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-2">About this place</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-lg font-semibold mb-3">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">{amenityLabels[amenity] || amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Landlord Info */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Contact Host</h2>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {property.landlord.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{property.landlord.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.landlord.response_rate} response • {property.landlord.response_time}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="hidden lg:block h-full">
          <MapContainer
            center={[property.latitude, property.longitude]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <Marker position={[property.latitude, property.longitude]}>
              <Popup>
                <div style={{ fontFamily: "system-ui", padding: 4, minWidth: 180 }}>
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
                  />
                  <strong style={{ fontSize: 14 }}>{property.title}</strong>
                  <p style={{ margin: "4px 0", fontSize: 12, color: "#666" }}>{property.location}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#FF385C" }}>KSh {property.price.toLocaleString()}/mo</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Schedule Viewing</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowBookingModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => { setShowBookingModal(false); alert("Booking request sent!"); }}>
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
