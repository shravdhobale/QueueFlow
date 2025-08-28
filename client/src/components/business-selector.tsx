import { useQuery } from "@tanstack/react-query";
import { BusinessAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Scissors, Stethoscope, Wrench } from "lucide-react";

interface BusinessSelectorProps {
  onSelect: (businessId: string) => void;
  selectedBusinessId?: string;
}

const getBusinessIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hair salon':
      return <Scissors className="h-6 w-6" />;
    case 'medical clinic':
      return <Stethoscope className="h-6 w-6" />;
    case 'auto repair':
      return <Wrench className="h-6 w-6" />;
    default:
      return <Scissors className="h-6 w-6" />;
  }
};

const getIconBgColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hair salon':
      return 'bg-primary';
    case 'medical clinic':
      return 'bg-emerald-500';
    case 'auto repair':
      return 'bg-orange-500';
    default:
      return 'bg-primary';
  }
};

export function BusinessSelector({ onSelect, selectedBusinessId }: BusinessSelectorProps) {
  const { data: businesses, isLoading } = useQuery({
    queryKey: ["/api/businesses"],
  });

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-semibold text-foreground mb-6">Select Your Business</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h3 className="text-2xl font-semibold text-foreground mb-6">Select Your Business</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses?.map((business: any) => (
            <div
              key={business.id}
              className={`bg-secondary border border-border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer ${
                selectedBusinessId === business.id ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelect(business.id)}
              data-testid={`card-business-${business.id}`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${getIconBgColor(business.type)} text-white rounded-full w-12 h-12 flex items-center justify-center`}>
                  {getBusinessIcon(business.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground" data-testid={`text-business-name-${business.id}`}>
                    {business.name}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-business-type-${business.id}`}>
                    {business.type}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current wait:</span>
                <span className="font-semibold text-foreground" data-testid={`text-current-wait-${business.id}`}>
                  {business.currentWait || 0} min
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">People in queue:</span>
                <span className="font-semibold text-foreground" data-testid={`text-queue-count-${business.id}`}>
                  {business.queueCount || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
