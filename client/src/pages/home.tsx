import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Bell, ArrowRight, Users, TrendingUp, Star, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Skip the Wait, Not the Service
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
              Join queues digitally and get notified when it's your turn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/customer/login">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100" data-testid="button-find-services">
                  <Users className="h-5 w-5 mr-2" />
                  Find Services
                </Button>
              </Link>
              <Link href="/business/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-business-login">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Business Login
                </Button>
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <p className="text-lg" data-testid="text-hero-description">
                No app required - just use your phone's browser!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-how-it-works-title">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="text-step1-title">Choose Your Service</h3>
                <p className="text-muted-foreground" data-testid="text-step1-description">
                  Browse categories and find the business that suits your needs
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="text-step2-title">Join the Queue</h3>
                <p className="text-muted-foreground" data-testid="text-step2-description">
                  Add yourself to the digital queue with just a few taps
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="text-step3-title">Get Notified</h3>
                <p className="text-muted-foreground" data-testid="text-step3-description">
                  Receive updates and alerts when your turn approaches
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid="text-step4-title">Arrive on Time</h3>
                <p className="text-muted-foreground" data-testid="text-step4-description">
                  Show up exactly when it's your turn - no waiting around
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-features-title">Why Choose QueueFlow?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of queue management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl p-6 mb-4">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-feature1-title">Real-time Queue Updates</h3>
              <p className="text-muted-foreground text-sm" data-testid="text-feature1-description">
                Stay informed with live updates on your position and wait times
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-4">
                <Bell className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-feature2-title">Smart Notifications</h3>
              <p className="text-muted-foreground text-sm" data-testid="text-feature2-description">
                Get notified 15 minutes before your turn to plan your arrival
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-feature3-title">No More Waiting Rooms</h3>
              <p className="text-muted-foreground text-sm" data-testid="text-feature3-description">
                Skip crowded waiting areas and join from anywhere
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 mb-4">
                <TrendingUp className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-feature4-title">Multi-business Support</h3>
              <p className="text-muted-foreground text-sm" data-testid="text-feature4-description">
                Manage queues for multiple locations from one platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6" data-testid="text-business-title">For Businesses</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Transform your customer experience with digital queue management
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" data-testid="text-business-benefit1">Reduce No-shows by 40%</h3>
                    <p className="text-muted-foreground text-sm">Smart notifications keep customers engaged and informed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" data-testid="text-business-benefit2">Improve Customer Satisfaction</h3>
                    <p className="text-muted-foreground text-sm">Eliminate wait time frustration with transparency</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" data-testid="text-business-benefit3">Manage Queues Digitally</h3>
                    <p className="text-muted-foreground text-sm">Complete control over your queue from any device</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" data-testid="text-business-benefit4">Analytics & Insights</h3>
                    <p className="text-muted-foreground text-sm">Track performance metrics and optimize operations</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link href="/business/login">
                  <Button size="lg" data-testid="button-get-started">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:text-right">
              <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-0">
                <CardContent className="p-8">
                  <div className="text-6xl font-bold mb-2">40%</div>
                  <div className="text-xl mb-4">Reduction in no-shows</div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm opacity-90">Customer satisfaction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3x</div>
                      <div className="text-sm opacity-90">Faster turnaround</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-cta-title">Ready to Transform Your Queue Experience?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers and businesses using QueueFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/customer/login">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100" data-testid="button-cta-customer">
                <Users className="h-5 w-5 mr-2" />
                Join as Customer
              </Button>
            </Link>
            <Link href="/business/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" data-testid="button-cta-business">
                <BarChart3 className="h-5 w-5 mr-2" />
                Start Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}