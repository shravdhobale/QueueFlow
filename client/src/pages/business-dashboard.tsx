import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BusinessAPI, QueueAPI } from "@/lib/api";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EnhancedQueueList } from "@/components/enhanced-queue-list";
import { ServiceTimeSettings } from "@/components/service-time-settings";
import { NotificationToast } from "@/components/notification-toast";
import { Users, Clock, CheckCircle, Play, Pause, UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalkinFormData {
  customerName: string;
  customerPhone: string;
  serviceType: string;
}

export default function BusinessDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: "", message: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const walkinForm = useForm<WalkinFormData>({
    defaultValues: {
      customerName: "",
      customerPhone: "",
      serviceType: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      setLocation("/business/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      setLocation("/business/login");
    }
  }, [setLocation]);

  const { data, isLoading } = useQuery({
    queryKey: [`/api/dashboard/${user?.businessId}`],
    enabled: !!user?.businessId,
  });

  useWebSocket({
    businessId: user?.businessId,
    onMessage: (wsData) => {
      if (wsData.type === 'queue_updated') {
        setDashboardData((prev: any) => ({
          ...prev,
          queue: wsData.queue,
          stats: {
            ...prev?.stats,
            queueLength: wsData.queue.length
          }
        }));
        
        setNotificationData({
          title: "Queue Updated",
          message: "Real-time queue changes received"
        });
        setShowNotification(true);
      }
    }
  });

  useEffect(() => {
    if (data) {
      setDashboardData(data);
    }
  }, [data]);

  const addWalkinMutation = useMutation({
    mutationFn: (walkinData: any) => QueueAPI.joinQueue({
      businessId: user.businessId,
      ...walkinData
    }),
    onSuccess: () => {
      toast({
        title: "Walk-in customer added",
        description: "Customer successfully added to queue",
      });
      walkinForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${user?.businessId}`] });
    },
    onError: () => {
      toast({
        title: "Failed to add customer",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/business/login");
  };

  const onSubmitWalkin = (data: WalkinFormData) => {
    addWalkinMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { queue = [], business, stats } = dashboardData || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground" data-testid="link-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Business Dashboard
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your queue and customers - {business?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-secondary border border-border rounded-lg px-4 py-2">
                <span className="text-sm text-muted-foreground">Last updated:</span>
                <span className="text-sm font-semibold text-foreground ml-2" data-testid="text-last-updated">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Queue</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-queue-length">
                    {stats?.queueLength || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.pendingCount || 0} pending
                  </p>
                </div>
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-avg-wait">
                    {business?.averageServiceTime || 25}m
                  </p>
                </div>
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Served Today</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-served-today">
                    {stats?.servedToday || 0}
                  </p>
                </div>
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Queue Status</p>
                  <Badge 
                    variant={business?.isActive ? "default" : "secondary"}
                    data-testid="badge-queue-status"
                  >
                    {business?.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <Play className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Queue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Current Queue</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    data-testid="button-queue-active"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Active
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    data-testid="button-queue-pause"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                </div>
              </div>

              <EnhancedQueueList 
                approvedQueue={queue || []} 
                pendingQueue={dashboardData?.pendingQueue || []}
                businessId={user.businessId} 
              />
            </CardContent>
          </Card>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Add Walk-in Customer */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Add Walk-in Customer</h3>
                <form onSubmit={walkinForm.handleSubmit(onSubmitWalkin)} className="space-y-4">
                  <Input
                    placeholder="Customer Name"
                    {...walkinForm.register("customerName", { required: true })}
                    data-testid="input-walkin-name"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    {...walkinForm.register("customerPhone", { required: true })}
                    data-testid="input-walkin-phone"
                  />
                  <Select onValueChange={(value) => walkinForm.setValue("serviceType", value)}>
                    <SelectTrigger data-testid="select-walkin-service">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haircut">Haircut</SelectItem>
                      <SelectItem value="styling">Styling</SelectItem>
                      <SelectItem value="coloring">Coloring</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addWalkinMutation.isPending}
                    data-testid="button-add-walkin"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {addWalkinMutation.isPending ? "Adding..." : "Add to Queue"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Service Time Settings */}
            <ServiceTimeSettings business={business} />

            {/* Today's Overview */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Today's Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Customers</span>
                    <span className="font-semibold text-foreground" data-testid="text-total-customers">
                      31
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg Service Time</span>
                    <span className="font-semibold text-foreground" data-testid="text-avg-service-time">
                      {business?.averageServiceTime || 25} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Peak Hour</span>
                    <span className="font-semibold text-foreground" data-testid="text-peak-hour">
                      2-3 PM
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">No-shows</span>
                    <span className="font-semibold text-red-500" data-testid="text-no-shows">
                      2
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NotificationToast
        isVisible={showNotification}
        title={notificationData.title}
        message={notificationData.message}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
