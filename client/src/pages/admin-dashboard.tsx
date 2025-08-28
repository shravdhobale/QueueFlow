import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Building, 
  ArrowLeft,
  Search,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  type: z.string().min(1, "Business type is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  rating: z.string().default("0.0"),
  description: z.string().optional(),
  averageServiceTime: z.number().min(1, "Service time must be at least 1 minute"),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      type: "",
      phone: "",
      address: "",
      categoryId: "",
      rating: "0.0",
      description: "",
      averageServiceTime: 25,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminUser");

    if (!token || !adminData) {
      setLocation("/admin/login");
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
    } catch (error) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!admin,
  });

  const { data: businesses, refetch: refetchBusinesses } = useQuery({
    queryKey: ["/api/admin/businesses"],
    enabled: !!admin,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: !!admin,
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      const response = await apiRequest('POST', '/api/admin/businesses', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Business created",
        description: "New business has been added successfully",
      });
      form.reset();
      refetchBusinesses();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
    },
    onError: () => {
      toast({
        title: "Failed to create business",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      const response = await apiRequest('PUT', `/api/admin/businesses/${selectedBusiness.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Business updated",
        description: "Business has been updated successfully",
      });
      setSelectedBusiness(null);
      setIsEditing(false);
      form.reset();
      refetchBusinesses();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
    },
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/businesses/${businessId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Business deleted",
        description: "Business has been removed successfully",
      });
      refetchBusinesses();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
    },
    onError: () => {
      toast({
        title: "Failed to delete business",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setLocation("/");
  };

  const onSubmit = (data: BusinessFormData) => {
    if (isEditing && selectedBusiness) {
      updateBusinessMutation.mutate(data);
    } else {
      createBusinessMutation.mutate(data);
    }
  };

  const handleEdit = (business: any) => {
    setSelectedBusiness(business);
    setIsEditing(true);
    form.reset({
      name: business.name,
      type: business.type,
      phone: business.phone || "",
      address: business.address || "",
      categoryId: business.categoryId,
      rating: business.rating,
      description: business.description || "",
      averageServiceTime: business.averageServiceTime,
    });
  };

  const handleCancelEdit = () => {
    setSelectedBusiness(null);
    setIsEditing(false);
    form.reset();
  };

  const filteredBusinesses = (businesses || []).filter((business: any) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-red-600 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Link href="/" className="inline-flex items-center text-red-100 hover:text-white mb-4" data-testid="link-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-red-700 rounded-full p-3">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
                  Admin Dashboard
                </h1>
                <p className="text-red-100 mt-1">
                  System administration and business management
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-100 hover:bg-red-700"
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Businesses</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(businesses || []).length}
                  </p>
                </div>
                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Building className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Queues</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(analytics as any)?.activeQueues || 0}
                  </p>
                </div>
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(analytics as any)?.totalCustomers || 0}
                  </p>
                </div>
                <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold text-foreground">
                    {(categories || []).length}
                  </p>
                </div>
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Business Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>{isEditing ? "Edit Business" : "Add New Business"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Hair Salon, Clinic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category: any) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="averageServiceTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avg Service Time (min)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="25" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street, City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Business description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={createBusinessMutation.isPending || updateBusinessMutation.isPending}
                          className="flex-1"
                        >
                          {isEditing ? "Update Business" : "Create Business"}
                        </Button>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Business List */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Businesses</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search businesses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredBusinesses.map((business: any) => (
                    <div
                      key={business.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{business.name}</h4>
                        <p className="text-sm text-muted-foreground">{business.type}</p>
                        <p className="text-xs text-muted-foreground">{business.address}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={business.isActive ? "default" : "secondary"}>
                            {business.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Rating: {business.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(business)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBusinessMutation.mutate(business.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}