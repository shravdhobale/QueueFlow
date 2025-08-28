import { useParams, Link } from "wouter";
import { QueueDisplay } from "@/components/queue-display";
import { ArrowLeft } from "lucide-react";

export default function QueueStatus() {
  const params = useParams();
  const queueItemId = params.id;

  if (!queueItemId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Queue Link</h1>
          <p className="text-muted-foreground">The queue link you followed is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/customer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground" data-testid="link-back-dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        <QueueDisplay queueItemId={queueItemId} />
      </div>
    </div>
  );
}
