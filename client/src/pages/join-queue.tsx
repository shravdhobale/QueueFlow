import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, MapPin, Phone, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const joinQueueSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  serviceType: z.string().optional(),
  notes: z.string().optional(),
  businessId: z.string(),
});

type JoinQueueFormData = z.infer<typeof joinQueueSchema>;

export default function JoinQueue() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const businessId = params.id;
  
  // Get customer data from localStorage
  const getCustomerData = () => {
    try {
      const customerData = localStorage.getItem("customerData");
      return customerData ? JSON.parse(customerData) : null;
    } catch {
      return null;
    }
  };

  const customerData = getCustomerData();
  
  const form = useForm<JoinQueueFormData>({
    resolver: zodResolver(joinQueueSchema),
    defaultValues: {
      customerName: customerData?.name || "",
      customerPhone: customerData?.phone || "",
      serviceType: "",
      notes: "",
      businessId: businessId || "",
    },
  });

  // Get business details
  const { data: business, isLoading } = useQuery({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: !!businessId,
  });

  const businessData = business as any;

  const queryClient = useQueryClient();

  const joinQueueMutation = useMutation({
    mutationFn: async (data: JoinQueueFormData) => {
      const response = await apiRequest('POST', '/api/queue/join', {
        ...data,
        businessId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate business and category queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      toast({
        title: "Successfully joined queue",
        description: "You'll receive SMS updates about your position",
      });
      setLocation(`/queue/${data.queueItem.id}`);
    },
    onError: () => {
      toast({
        title: "Failed to join queue",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JoinQueueFormData) => {
    joinQueueMutation.mutate(data);
  };

  if (!businessId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Business Link</h1>
          <p className="text-muted-foreground">The business link you followed is invalid.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
          <p className="text-muted-foreground mb-4">The business you're looking for doesn't exist or is temporarily unavailable.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/customer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground" data-testid="link-back-dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{businessData?.rating || '4.0'}</span>
                </div>
                <span className="text-lg" data-testid="text-business-name">{businessData?.name || 'Business'}</span>
              </CardTitle>
              <p className="text-muted-foreground" data-testid="text-business-type">{businessData?.type || 'Service Provider'}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessData?.description && (
                <p className="text-muted-foreground" data-testid="text-business-description">
                  {businessData.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {businessData?.address && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span data-testid="text-business-address">{businessData.address}</span>
                  </div>
                )}
                {businessData?.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span data-testid="text-business-phone">{businessData.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Current Wait
                  </div>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-current-wait">
                    {businessData?.currentWait || 0} min
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    In Queue
                  </div>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-queue-count">
                    {businessData?.queueCount || 0}
                  </div>
                </div>
              </div>

              <Badge 
                variant={businessData?.queueCount && businessData.queueCount > 5 ? "secondary" : "default"}
                className="w-full justify-center"
                data-testid="badge-business-status"
              >
                {businessData?.queueCount && businessData.queueCount > 5 ? "Currently Busy" : "Available Now"}
              </Badge>
            </CardContent>
          </Card>

          {/* Join Queue Form */}
          <Card>
            <CardHeader>
              <CardTitle>Join Queue</CardTitle>
              <p className="text-muted-foreground">
                Fill in your details to join the digital queue
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            data-testid="input-customer-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter your phone number"
                            {...field}
                            data-testid="input-customer-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-service-type">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="haircut">Haircut</SelectItem>
                            <SelectItem value="styling">Styling</SelectItem>
                            <SelectItem value="coloring">Coloring</SelectItem>
                            <SelectItem value="treatment">Treatment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requests or notes..."
                            className="resize-none"
                            {...field}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={joinQueueMutation.isPending}
                    data-testid="button-join-queue"
                  >
                    {joinQueueMutation.isPending ? "Joining..." : "Join Queue"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💬 You'll receive SMS updates about your queue position and when it's your turn
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}