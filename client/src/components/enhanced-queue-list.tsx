import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, Play, UserCheck, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueueItem {
  id: string;
  position: number;
  customerName: string;
  customerPhone: string;
  serviceType?: string | null;
  notes?: string | null;
  status: string;
  approved: boolean;
  estimatedWait?: number | null;
  estimatedServiceTime: number;
  joinedAt: string;
  approvedAt?: string | null;
  serviceStartedAt?: string | null;
}

interface EnhancedQueueListProps {
  approvedQueue: QueueItem[];
  pendingQueue: QueueItem[];
  businessId: string;
}

export function EnhancedQueueList({ approvedQueue, pendingQueue, businessId }: EnhancedQueueListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [serviceTimeInputs, setServiceTimeInputs] = useState<Record<string, string>>({});

  const approveCustomerMutation = useMutation({
    mutationFn: async ({ id, estimatedServiceTime }: { id: string; estimatedServiceTime?: number }) => {
      const response = await apiRequest('PUT', `/api/queue/${id}/approve`, { estimatedServiceTime });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer approved",
        description: "Customer has been approved and added to the queue",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${businessId}`] });
    },
    onError: () => {
      toast({
        title: "Failed to approve customer",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const startServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PUT', `/api/queue/${id}/start-service`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service started",
        description: "Customer service has been started",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${businessId}`] });
    },
    onError: () => {
      toast({
        title: "Failed to start service",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const serveCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PUT', `/api/queue/${id}/serve`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer served",
        description: "Customer marked as served successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${businessId}`] });
    },
    onError: () => {
      toast({
        title: "Failed to serve customer",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const removeCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/queue/${id}`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer removed",
        description: "Customer removed from queue successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${businessId}`] });
    },
    onError: () => {
      toast({
        title: "Failed to remove customer",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1m ago';
    return `${diffInMinutes}m ago`;
  };

  const getStatusBadge = (item: QueueItem) => {
    switch (item.status) {
      case 'pending':
        return <Badge variant="secondary" data-testid={`badge-status-${item.id}`}>Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default" data-testid={`badge-status-${item.id}`}>Approved</Badge>;
      case 'in_service':
        return <Badge variant="outline" className="border-green-500 text-green-700" data-testid={`badge-status-${item.id}`}>In Service</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`badge-status-${item.id}`}>{item.status}</Badge>;
    }
  };

  const handleApprove = (id: string) => {
    const estimatedServiceTime = serviceTimeInputs[id] ? parseInt(serviceTimeInputs[id]) : undefined;
    approveCustomerMutation.mutate({ id, estimatedServiceTime });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approved" data-testid="tab-approved">
            Active Queue ({approvedQueue.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending Approval ({pendingQueue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Active Queue Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p data-testid="text-empty-approved-queue">No approved customers in queue</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedQueue.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 hover:bg-secondary transition-colors"
                      data-testid={`approved-item-${item.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold">
                            <span data-testid={`text-position-${item.id}`}>{item.position}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground" data-testid={`text-name-${item.id}`}>
                              {item.customerName}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span data-testid={`text-phone-${item.id}`}>{item.customerPhone}</span>
                            </div>
                            {item.serviceType && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-service-${item.id}`}>
                                Service: {item.serviceType}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-notes-${item.id}`}>
                                Notes: {item.notes}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(item)}
                              <span className="text-xs text-muted-foreground">
                                Est. wait: {item.estimatedWait || 0} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground" data-testid={`text-approved-time-${item.id}`}>
                            {formatTimeAgo(item.approvedAt || item.joinedAt)}
                          </span>
                          <div className="flex space-x-1">
                            {item.status === 'approved' && (
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => startServiceMutation.mutate(item.id)}
                                disabled={startServiceMutation.isPending}
                                data-testid={`button-start-service-${item.id}`}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {item.status === 'in_service' && (
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => serveCustomerMutation.mutate(item.id)}
                                disabled={serveCustomerMutation.isPending}
                                data-testid={`button-complete-${item.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeCustomerMutation.mutate(item.id)}
                              disabled={removeCustomerMutation.isPending}
                              data-testid={`button-remove-approved-${item.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p data-testid="text-empty-pending-queue">No pending customer requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingQueue.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 hover:bg-secondary transition-colors"
                      data-testid={`pending-item-${item.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground" data-testid={`text-pending-name-${item.id}`}>
                              {item.customerName}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span data-testid={`text-pending-phone-${item.id}`}>{item.customerPhone}</span>
                            </div>
                            {item.serviceType && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-pending-service-${item.id}`}>
                                Service: {item.serviceType}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-pending-notes-${item.id}`}>
                                Notes: {item.notes}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <Input
                                type="number"
                                placeholder="Service time (min)"
                                value={serviceTimeInputs[item.id] || ''}
                                onChange={(e) => setServiceTimeInputs(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))}
                                className="w-32"
                                data-testid={`input-service-time-${item.id}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                Default: {item.estimatedServiceTime} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground" data-testid={`text-pending-time-${item.id}`}>
                            {formatTimeAgo(item.joinedAt)}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleApprove(item.id)}
                              disabled={approveCustomerMutation.isPending}
                              data-testid={`button-approve-${item.id}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeCustomerMutation.mutate(item.id)}
                              disabled={removeCustomerMutation.isPending}
                              data-testid={`button-reject-${item.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}