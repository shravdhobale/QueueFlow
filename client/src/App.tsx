import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import Home from "@/pages/home";
import QueueStatus from "@/pages/queue-status";
import BusinessLogin from "@/pages/business-login";
import BusinessDashboard from "@/pages/business-dashboard";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <div className="bg-primary text-primary-foreground rounded-lg p-2">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">QueueFlow</h1>
          </Link>
          <div className="flex space-x-4">
            <Link href="/" data-testid="link-customer-view">
              <Button
                variant={location === "/" ? "default" : "outline"}
                size="sm"
                className="transition-colors"
              >
                Customer View
              </Button>
            </Link>
            <Link href="/business/login" data-testid="link-business-view">
              <Button
                variant={location.startsWith("/business") ? "default" : "outline"}
                size="sm"
                className="transition-colors"
              >
                Business Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/queue/:id" component={QueueStatus} />
      <Route path="/business/login" component={BusinessLogin} />
      <Route path="/business/dashboard" component={BusinessDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
