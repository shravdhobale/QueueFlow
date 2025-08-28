import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueueAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueueListProps {
  queue: Array<{
    id: string;
    position: number;
    customerName: string;
    customerPhone: string;
    serviceType?: string;
    joinedAt: string;
    estimatedWait: number;
  }>;
  businessId: string;
}

export function QueueList({ queue, businessId }: QueueListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const serveCustomerMutation = useMutation({
    mutationFn: QueueAPI.serveCustomer,
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
    mutationFn: QueueAPI.removeCustomer,
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

  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p data-testid="text-empty-queue">No customers in queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queue.map((item) => (
        <div
          key={item.id}
          className="border border-border rounded-lg p-4 hover:bg-secondary transition-colors"
          data-testid={`queue-item-${item.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                <span data-testid={`text-position-${item.id}`}>{item.position}</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground" data-testid={`text-name-${item.id}`}>
                  {item.customerName}
                </h4>
                {item.serviceType && (
                  <p className="text-sm text-muted-foreground" data-testid={`text-service-${item.id}`}>
                    {item.serviceType}
                  </p>
                )}
                <p className="text-xs text-muted-foreground" data-testid={`text-phone-${item.id}`}>
                  {item.customerPhone}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground" data-testid={`text-time-ago-${item.id}`}>
                {formatTimeAgo(item.joinedAt)}
              </span>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white p-2 text-xs"
                  title="Mark as Served"
                  onClick={() => serveCustomerMutation.mutate(item.id)}
                  disabled={serveCustomerMutation.isPending}
                  data-testid={`button-serve-${item.id}`}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="p-2 text-xs"
                  title="Remove from Queue"
                  onClick={() => removeCustomerMutation.mutate(item.id)}
                  disabled={removeCustomerMutation.isPending}
                  data-testid={`button-remove-${item.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
