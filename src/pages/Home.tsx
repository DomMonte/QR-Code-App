import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Users, Shield, Share2, ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { stripePromise } from '../lib/stripe-client';
import { createCheckoutSession } from '../lib/api';
import { useToast } from '../components/ui/use-toast';

const features = [
  "Unlimited photo uploads",
  "Real-time photo sharing",
  "Instant QR code generation",
  "Mobile-friendly interface",
  "Cloud backup & storage",
  "6 months of access",
  "High-resolution downloads",
  "Guest upload capability"
];

const reviews = [
  {
    name: "Sarah Johnson",
    role: "Wedding Planner",
    content: "This platform made sharing wedding photos so effortless. The QR code feature was a huge hit with guests!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Event Coordinator",
    content: "Perfect for corporate events. The real-time uploads and instant sharing saved us so much time.",
    rating: 5
  },
  {
    name: "Emma Davis",
    role: "Professional Photographer",
    content: "My clients love how easy it is to access and download their photos. Great platform!",
    rating: 5
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pricingRef = useRef<HTMLDivElement>(null);
  const [albumName, setAlbumName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePurchase = async () => {
    if (!albumName.trim()) {
      toast({
        title: "Album name required",
        description: "Please enter a name for your album",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { sessionId } = await createCheckoutSession(albumName);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) throw error;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-16 items-center">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />
        <img
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Wedding celebration"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-foreground tracking-tight mb-8">
                Share Your Event Photos <br />
                <span className="text-primary">Instantly</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
                Create beautiful photo albums for your events and share them instantly with guests using QR codes.
              </p>
              <Button size="lg" onClick={scrollToPricing} className="text-lg px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Instant uploads"
                className="rounded-2xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-xl font-semibold text-foreground mb-3">Instant Uploads</h3>
              <p className="text-muted-foreground">
                Upload photos directly from your phone or camera in real-time.
              </p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Easy sharing"
                className="rounded-2xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-xl font-semibold text-foreground mb-3">Easy Sharing</h3>
              <p className="text-muted-foreground">
                Share your album instantly with a unique QR code.
              </p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Secure storage"
                className="rounded-2xl mb-6 w-full h-48 object-cover"
              />
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure Storage</h3>
              <p className="text-muted-foreground">
                Your photos are safely stored and backed up in the cloud.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers who trust us with their memories
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-4">{review.content}</p>
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by Event Planners</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Join thousands of event planners who trust us with their precious memories.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Events Hosted</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">50k+</div>
                <div className="text-muted-foreground">Photos Shared</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">99%</div>
                <div className="text-muted-foreground">Satisfaction</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">4.9</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div ref={pricingRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Everything you need for your event photos</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground mb-6">Everything You Get:</h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-5xl font-bold text-foreground">$149</span>
                <span className="text-muted-foreground">per album</span>
              </div>
              <p className="text-muted-foreground mb-8 text-center">6 months access</p>

              <div className="space-y-6">
                <div>
                  <label htmlFor="albumName" className="block text-sm font-medium text-foreground text-left mb-2">
                    Album Name
                  </label>
                  <input
                    type="text"
                    id="albumName"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="Enter your album name"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={50}
                  />
                </div>

                <Button 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <ArrowRight className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Create Your Album'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 PhotoShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}