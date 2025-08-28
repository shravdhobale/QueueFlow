import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationToastProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function NotificationToast({ isVisible, title, message, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-full duration-300">
      <div className="flex items-center space-x-3">
        <CheckCircle className="h-5 w-5" data-testid="icon-success" />
        <div>
          <p className="font-semibold" data-testid="text-notification-title">{title}</p>
          <p className="text-sm opacity-90" data-testid="text-notification-message">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-gray-200 ml-4 h-auto p-1"
          onClick={onClose}
          data-testid="button-close-notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
