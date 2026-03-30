import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Building2, Users, Calendar, TrendingUp, Eye, MessageSquare, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dashboardStats = [
  { title: "Total Properties", value: "12", change: "+2", trend: "up", icon: Building2 },
  { title: "Active Bookings", value: "8", change: "+3", trend: "up", icon: Calendar },
  { title: "Total Views", value: "2,456", change: "+156", trend: "up", icon: Eye },
  { title: "Messages", value: "24", change: "-5", trend: "down", icon: MessageSquare },
];

const recentProperties = [
  { id: "1", title: "Modern Apartment", views: 450, inquiries: 12, status: "AVAILABLE", price: 25000 },
  { id: "2", title: "Cozy Bedsitter", views: 320, inquiries: 8, status: "AVAILABLE", price: 12000 },
  { id: "3", title: "3BR House", views: 280, inquiries: 5, status: "OCCUPIED", price: 45000 },
];

const recentBookings = [
  { id: "1", property: "Modern Apartment", tenant: "John Doe", date: "2026-03-05", time: "10:00 AM", status: "PENDING" },
  { id: "2", property: "Cozy Bedsitter", tenant: "Jane Smith", date: "2026-03-06", time: "2:00 PM", status: "CONFIRMED" },
  { id: "3", property: "3BR House", tenant: "Mike Johnson", date: "2026-03-07", time: "11:00 AM", status: "PENDING" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your property overview.</p>
        </div>
        <Link to="/dashboard/add-property">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-emerald-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground text-sm">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Properties</CardTitle>
              <CardDescription>Manage your listed properties</CardDescription>
            </div>
            <Link to="/properties">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{property.title}</p>
                    <p className="text-sm text-muted-foreground">KSh {property.price.toLocaleString()}/mo</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {property.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {property.inquiries}
                    </div>
                    <Badge variant={property.status === "AVAILABLE" ? "available" : "occupied"}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Upcoming property viewings</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{booking.property}</p>
                    <p className="text-sm text-muted-foreground">{booking.tenant}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{booking.date}</p>
                    <p className="text-sm text-muted-foreground">{booking.time}</p>
                  </div>
                  <Badge variant={booking.status === "CONFIRMED" ? "available" : "secondary"} className="ml-2">
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard/add-property">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Plus className="w-5 h-5" />
                <span className="text-sm">Add Property</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">View Bookings</span>
              </Button>
            </Link>
            <Link to="/subscriptions">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Upgrade Plan</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
