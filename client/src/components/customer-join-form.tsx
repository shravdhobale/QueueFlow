import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QueueAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const joinQueueSchema = z.object({
  businessId: z.string().min(1, "Please select a business"),
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  serviceType: z.string().optional(),
  notes: z.string().optional(),
  smsConsent: z.boolean().refine(val => val === true, "SMS consent is required"),
});

type JoinQueueFormData = z.infer<typeof joinQueueSchema>;

interface CustomerJoinFormProps {
  businessId?: string;
  onSuccess: (queueItemId: string) => void;
}

export function CustomerJoinForm({ businessId, onSuccess }: CustomerJoinFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<JoinQueueFormData>({
    resolver: zodResolver(joinQueueSchema),
    defaultValues: {
      businessId: businessId || "",
      customerName: "",
      customerPhone: "",
      serviceType: "",
      notes: "",
      smsConsent: false,
    },
  });

  const joinQueueMutation = useMutation({
    mutationFn: QueueAPI.joinQueue,
    onSuccess: (data) => {
      toast({
        title: "Successfully joined the queue!",
        description: `You're #${data.position} in line. We'll send you SMS updates.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      onSuccess(data.id);
    },
    onError: () => {
      toast({
        title: "Failed to join queue",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JoinQueueFormData) => {
    if (!businessId) {
      toast({
        title: "Please select a business first",
        variant: "destructive",
      });
      return;
    }

    joinQueueMutation.mutate({
      businessId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      serviceType: data.serviceType,
      notes: data.notes,
    });
  };

  if (!businessId) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center">
            <UserPlus className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground">Join the Queue</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        {...field}
                        data-testid="input-customer-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Needed</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service-type">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="haircut">Haircut</SelectItem>
                      <SelectItem value="styling">Hair Styling</SelectItem>
                      <SelectItem value="coloring">Hair Coloring</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
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
                  <FormLabel>Additional Notes</FormLabel>
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

            <FormField
              control={form.control}
              name="smsConsent"
              render={({ field }) => (
                <FormItem className="bg-secondary border border-border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-sms-consent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to receive SMS notifications about my queue status.
                        <span className="text-muted-foreground block mt-1">
                          We'll send you updates when you're 15 minutes away and when it's your turn.
                        </span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-blue-700 text-primary-foreground font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
              disabled={joinQueueMutation.isPending}
              data-testid="button-join-queue"
            >
              {joinQueueMutation.isPending ? (
                "Joining..."
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join Queue
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
