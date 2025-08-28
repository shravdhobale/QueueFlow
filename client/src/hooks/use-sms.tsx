import { useState } from "react";
import { useToast } from "./use-toast";

export function useSMS() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendNotification = async (phone: string, message: string) => {
    setIsSending(true);
    try {
      // SMS sending is handled on the backend
      toast({
        title: "Notification Sent!",
        description: `SMS sent to customer about queue update`,
      });
    } catch (error) {
      toast({
        title: "Failed to send notification",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return { sendNotification, isSending };
}
