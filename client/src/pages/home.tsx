import { useState } from "react";
import { useLocation } from "wouter";
import { BusinessSelector } from "@/components/business-selector";
import { CustomerJoinForm } from "@/components/customer-join-form";
import { QueueDisplay } from "@/components/queue-display";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [queueItemId, setQueueItemId] = useState<string>("");

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
  };

  const handleJoinSuccess = (itemId: string) => {
    setQueueItemId(itemId);
    setLocation(`/queue/${itemId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
              Skip the Wait
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90" data-testid="text-hero-subtitle">
              Join the queue digitally and get notified when it's your turn
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <i className="fas fa-mobile-alt text-6xl mb-4 opacity-80"></i>
              <p className="text-lg" data-testid="text-hero-description">
                No app required - just use your phone's browser!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BusinessSelector
          onSelect={handleBusinessSelect}
          selectedBusinessId={selectedBusinessId}
        />

        {selectedBusinessId && (
          <CustomerJoinForm
            businessId={selectedBusinessId}
            onSuccess={handleJoinSuccess}
          />
        )}

        {queueItemId && <QueueDisplay queueItemId={queueItemId} />}
      </div>
    </div>
  );
}
