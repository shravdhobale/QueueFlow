import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Scissors, 
  Stethoscope, 
  Wrench, 
  UtensilsCrossed, 
  Briefcase, 
  ShoppingBag,
  Star,
  Clock,
  Users,
  MapPin,
  Phone,
  LogOut
} from "lucide-react";


interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface Business {
  id: string;
  name: string;
  type: string;
  rating: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  queueCount?: number;
  currentWait?: number;
  averageServiceTime: number;
}

const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'Scissors': Scissors,
    'Stethoscope': Stethoscope,
    'Wrench': Wrench,
    'UtensilsCrossed': UtensilsCrossed,
    'Briefcase': Briefcase,
    'ShoppingBag': ShoppingBag,
  };

  const IconComponent = iconMap[iconName] || Scissors;
  return <IconComponent className="h-8 w-8" />;
};

const getCategoryColor = (iconName: string) => {
  const colorMap: Record<string, string> = {
    'Scissors': 'bg-pink-500',
    'Stethoscope': 'bg-green-500',
    'Wrench': 'bg-orange-500',
    'UtensilsCrossed': 'bg-red-500',
    'Briefcase': 'bg-blue-500',
    'ShoppingBag': 'bg-purple-500',
  };

  return colorMap[iconName] || 'bg-primary';
};

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const customerData = localStorage.getItem("customerData");

    if (!token || !customerData) {
      setLocation("/customer/login");
      return;
    }

    try {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
      // Invalidate all queries when dashboard loads to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    } catch (error) {
      setLocation("/customer/login");
    }
  }, [setLocation, queryClient]);

  // Refresh data when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient]);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!customer,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/categories", selectedCategory, "businesses"],
    enabled: !!customer && !!selectedCategory,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    setLocation("/");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const filteredBusinesses = businesses?.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
                Welcome back, {customer.name}!
              </h1>
              <p className="text-muted-foreground">Find and join queues from local businesses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedCategory ? (
          // Categories View
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-categories-title">Browse Services</h2>
              <p className="text-xl text-muted-foreground">Choose a category to find businesses near you</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(categories || []).map((category) => (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                    onClick={() => handleCategorySelect(category.id)}
                    data-testid={`card-category-${category.id}`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`${getCategoryColor(category.icon || '')} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                        {getCategoryIcon(category.icon || 'Scissors')}
                      </div>
                      <h3 className="text-xl font-semibold mb-2" data-testid={`text-category-name-${category.id}`}>
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-sm" data-testid={`text-category-description-${category.id}`}>
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Businesses View
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button
                  variant="outline"
                  onClick={handleBackToCategories}
                  className="mb-2"
                  data-testid="button-back-categories"
                >
                  ← Back to Categories
                </Button>
                <h2 className="text-3xl font-bold" data-testid="text-businesses-title">
                  {categories?.find(c => c.id === selectedCategory)?.name} Services
                </h2>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-businesses"
                />
              </div>
            </div>

            {businessesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-business-name-${business.id}`}>
                            {business.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground" data-testid={`text-business-type-${business.id}`}>
                            {business.type}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium" data-testid={`text-business-rating-${business.id}`}>
                            {business.rating}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {business.description && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-business-description-${business.id}`}>
                          {business.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        {business.address && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span data-testid={`text-business-address-${business.id}`}>{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            <span data-testid={`text-business-phone-${business.id}`}>{business.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span data-testid={`text-business-wait-${business.id}`}>
                              {business.currentWait || 0} min wait
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span data-testid={`text-business-queue-${business.id}`}>
                              {business.queueCount || 0} in queue
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant={business.queueCount && business.queueCount > 5 ? "secondary" : "default"}
                          data-testid={`badge-business-status-${business.id}`}
                        >
                          {business.queueCount && business.queueCount > 5 ? "Busy" : "Available"}
                        </Badge>
                      </div>

                      <Link href={`/business/${business.id}/join`}>
                        <Button className="w-full" data-testid={`button-join-queue-${business.id}`}>
                          Join Queue
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!businessesLoading && filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No businesses found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "No businesses available in this category yet"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}