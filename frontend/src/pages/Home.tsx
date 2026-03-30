import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Home, ArrowRight, Star, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPES, LOCATIONS } from "@/lib/index";

const featuredProperties = [
  {
    id: "1",
    title: "Modern Apartment in Ongata Rongai",
    location: "Ongata Rongai",
    price: 25000,
    bedrooms: 2,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    is_premium: true,
    status: "AVAILABLE" as const,
  },
  {
    id: "2",
    title: "Cozy Bedsitter near Kiserian",
    location: "Kiserian",
    price: 12000,
    bedrooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
    is_premium: false,
    status: "AVAILABLE" as const,
  },
  {
    id: "3",
    title: "Spacious 3BR House with Garden",
    location: "Ngong",
    price: 45000,
    bedrooms: 3,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    is_premium: true,
    status: "AVAILABLE" as const,
  },
  {
    id: "4",
    title: "Luxury Villa with Pool",
    location: "Karen",
    price: 85000,
    bedrooms: 4,
    bathrooms: 3,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    is_premium: true,
    status: "AVAILABLE" as const,
  },
];

const features = [
  { icon: Shield, title: "Verified Listings", description: "All properties verified by our team" },
  { icon: Clock, title: "Instant Booking", description: "Book viewings instantly online" },
  { icon: Users, title: "Direct Contact", description: "Connect directly with landlords" },
  { icon: Star, title: "Reviews & Ratings", description: "Honest reviews from verified tenants" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 md:p-12">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Find Your Perfect Home in <span className="text-primary">Ongata Rongai</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-6"
          >
            Discover the best rental properties in Ongata Rongai and surrounding areas.
            From cozy bedsitters to luxury villas, find your ideal home today.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-4 rounded-lg shadow-lg border border-border"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Property Type</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <Button size="lg" className="w-full md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {LOCATIONS.slice(0, 6).map((location, index) => (
          <motion.div
            key={location.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/properties?location=${location.value}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium truncate">{location.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Featured Properties */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Properties</h2>
          <Link to="/properties">
            <Button variant="ghost">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/properties/${property.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    {property.is_premium && (
                      <Badge className="absolute top-2 left-2 bg-primary">Premium</Badge>
                    )}
                    <Badge
                      variant="available"
                      className="absolute top-2 right-2"
                    >
                      {property.status === "AVAILABLE" ? "Available" : property.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate mb-1">{property.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {property.location}
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
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Are You a Landlord?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          List your property on RentalHunters and reach thousands of potential tenants.
          Get started today and manage your listings easily.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard/add-property">
            <Button size="lg">
              <Home className="w-4 h-4 mr-2" />
              List Your Property
            </Button>
          </Link>
          <Link to="/subscriptions">
            <Button size="lg" variant="outline">
              View Pricing Plans
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
