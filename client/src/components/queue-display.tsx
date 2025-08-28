import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface QueueDisplayProps {
  queueItemId: string;
}

export function QueueDisplay({ queueItemId }: QueueDisplayProps) {
  const [queueData, setQueueData] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: [`/api/queue/status/${queueItemId}`],
    refetchInterval: 30000, // Refresh every 30 seconds as specified
  });

  useWebSocket({
    businessId: queueData?.business?.id,
    onMessage: (wsData) => {
      if (wsData.type === 'queue_updated') {
        // Update local queue data
        setQueueData((prev: any) => {
          if (!prev) return prev;
          const updatedItem = wsData.queue.find((item: any) => item.id === queueItemId);
          if (updatedItem) {
            return {
              ...prev,
              queueItem: updatedItem
            };
          }
          return prev;
        });
      }
    }
  });

  useEffect(() => {
    if (data) {
      setQueueData(data);
    }
  }, [data]);

  const handleShareLink = () => {
    const url = `${window.location.origin}/queue/${queueItemId}`;
    navigator.clipboard.writeText(url);
  };

  const handleLeaveQueue = () => {
    // This would trigger a mutation to remove from queue
    console.log('Leave queue');
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-pulse bg-gray-200 rounded-full w-20 h-20 mx-auto mb-6"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto mb-4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-48 mx-auto mb-8 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!queueData?.queueItem) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Queue item not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { queueItem, business } = queueData;
  const progressPercentage = queueItem.position > 1 ? 
    ((business?.averageWaitTime || 25) * (queueItem.position - 1) - queueItem.estimatedWait) / 
    ((business?.averageWaitTime || 25) * (queueItem.position - 1)) * 100 : 100;

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold" data-testid={`text-position-${queueItem.id}`}>
              {queueItem.position}
            </span>
          </div>

          <h3 className="text-3xl font-bold text-foreground mb-2">
            You're #{queueItem.position} in line
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Estimated wait time: 
            <span className="font-semibold text-foreground ml-1" data-testid={`text-wait-time-${queueItem.id}`}>
              {queueItem.estimatedWait} minutes
            </span>
          </p>

          <div className="bg-secondary border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Live Updates</span>
            </div>
            <p className="text-sm text-foreground">This page updates automatically every 30 seconds</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Queue Progress</span>
              <span data-testid={`text-progress-${queueItem.id}`}>
                {Math.max(0, Math.round(progressPercentage))}% complete
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-primary rounded-full h-3 transition-all duration-500"
                style={{ width: `${Math.max(0, Math.round(progressPercentage))}%` }}
                data-testid={`progress-bar-${queueItem.id}`}
              ></div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <Badge 
              variant={queueItem.status === 'waiting' ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
              data-testid={`badge-status-${queueItem.id}`}
            >
              <Clock className="w-4 h-4 mr-1" />
              {queueItem.status === 'waiting' ? 'Waiting' : queueItem.status}
            </Badge>
          </div>

          {/* Business Info */}
          {business && (
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold text-foreground mb-2" data-testid={`text-business-name-${business.id}`}>
                {business.name}
              </h4>
              <p className="text-muted-foreground text-sm mb-4" data-testid={`text-business-address-${business.id}`}>
                {business.address}
              </p>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareLink}
                  data-testid={`button-share-${queueItem.id}`}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLeaveQueue}
                  data-testid={`button-leave-${queueItem.id}`}
                >
                  <X className="w-4 h-4 mr-2" />
                  Leave Queue
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
