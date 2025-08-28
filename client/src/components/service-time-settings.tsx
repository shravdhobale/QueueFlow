import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, Edit, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes").max(480, "Duration cannot exceed 8 hours"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface ServiceTimeSettingsProps {
  business: {
    id: string;
    name: string;
    averageServiceTime: number;
    services?: Service[];
  };
}

export function ServiceTimeSettings({ business }: ServiceTimeSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      duration: business.averageServiceTime,
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async ({ averageServiceTime }: { averageServiceTime: number }) => {
      const response = await apiRequest('PUT', `/api/business/${business.id}`, { averageServiceTime });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Default service time has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${business.id}`] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update service time settings",
        variant: "destructive",
      });
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: async (serviceData: ServiceFormData) => {
      const response = await apiRequest('POST', `/api/business/${business.id}/services`, serviceData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service added",
        description: "New service has been added successfully",
      });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${business.id}`] });
    },
    onError: () => {
      toast({
        title: "Failed to add service",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: ServiceFormData }) => {
      const response = await apiRequest('PUT', `/api/business/${business.id}/services/${serviceId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service updated",
        description: "Service has been updated successfully",
      });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${business.id}`] });
    },
    onError: () => {
      toast({
        title: "Failed to update service",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await apiRequest('DELETE', `/api/business/${business.id}/services/${serviceId}`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service deleted",
        description: "Service has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${business.id}`] });
    },
    onError: () => {
      toast({
        title: "Failed to delete service",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmitService = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ serviceId: editingService.id, data });
    } else {
      addServiceMutation.mutate(data);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      duration: service.duration,
    });
    setIsDialogOpen(true);
  };

  const handleAddService = () => {
    setEditingService(null);
    form.reset({
      name: "",
      duration: business.averageServiceTime,
    });
    setIsDialogOpen(true);
  };

  const updateDefaultTime = (newTime: number) => {
    updateBusinessMutation.mutate({ averageServiceTime: newTime });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Service Time Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Service Time */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">Default Service Time</h4>
              <p className="text-sm text-muted-foreground">
                Used when no specific service is selected
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="badge-default-time">
                {business.averageServiceTime} minutes
              </Badge>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="5"
                  max="480"
                  placeholder="Minutes"
                  className="w-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt((e.target as HTMLInputElement).value);
                      if (value >= 5 && value <= 480) {
                        updateDefaultTime(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  data-testid="input-default-time"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                    if (input) {
                      const value = parseInt(input.value);
                      if (value >= 5 && value <= 480) {
                        updateDefaultTime(value);
                        input.value = '';
                      }
                    }
                  }}
                  disabled={updateBusinessMutation.isPending}
                  data-testid="button-update-default-time"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Specific Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">Specific Services</h4>
              <p className="text-sm text-muted-foreground">
                Define custom durations for different services
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddService} data-testid="button-add-service">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitService)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Haircut, Consultation, etc."
                              {...field}
                              data-testid="input-service-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              max="480"
                              placeholder="30"
                              {...field}
                              data-testid="input-service-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={addServiceMutation.isPending || updateServiceMutation.isPending}
                        data-testid="button-save-service"
                      >
                        {editingService ? 'Update Service' : 'Add Service'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingService(null);
                          form.reset();
                        }}
                        data-testid="button-cancel-service"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {business.services && business.services.length > 0 ? (
            <div className="space-y-2">
              {business.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                  data-testid={`service-item-${service.id}`}
                >
                  <div>
                    <h5 className="font-medium" data-testid={`service-name-${service.id}`}>
                      {service.name}
                    </h5>
                    <p className="text-sm text-muted-foreground" data-testid={`service-duration-${service.id}`}>
                      {service.duration} minutes
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditService(service)}
                      data-testid={`button-edit-service-${service.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteServiceMutation.mutate(service.id)}
                      disabled={deleteServiceMutation.isPending}
                      data-testid={`button-delete-service-${service.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p data-testid="text-no-services">No specific services configured</p>
              <p className="text-sm">Add services to provide customers with more accurate wait times</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}