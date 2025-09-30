import React from "react";
import { Link } from "react-router-dom";
import { URLShortener } from "@/components/URLShortener";
import { GoToCuteLink } from "@/components/GoToCuteLink";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Share2, ChartBar as BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <div className="absolute top-4 right-4 z-10">
        {user ? (
          <Link to="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Content */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
                Short Links That Are{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Actually Cute
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Instead of random gibberish, get memorable links like{" "}
                <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono">
                  sweetpotato
                </code>{" "}
                and{" "}
                <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono">
                  happypanda
                </code>{" "}
                that are easy to remember, say aloud, and share.
              </p>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center mb-12">
              <img
                src={heroImage}
                alt="Cute URL shortening illustration"
                className="max-w-md w-full h-auto rounded-2xl shadow-soft"
              />
            </div>

            {/* URL Shortener Component */}
            <URLShortener />
            
            {!user && (
              <p className="mt-8 text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">
                  Sign up
                </Link>{" "}
                to save and manage your shortened URLs
              </p>
            )}
          </div>
        </div>
      </div>

      <GoToCuteLink />

      {/* Features Section */}
      <div className="py-16 lg:py-24 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Why Choose Cute Links?
              </h2>
              <p className="text-xl text-muted-foreground">
                Make your links as memorable as your content
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center space-y-4 bg-gradient-card shadow-soft border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Easy to Remember</h3>
                <p className="text-muted-foreground text-sm">
                  "sweetpotato" sticks in your mind better than "x7k9mq2"
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4 bg-gradient-card shadow-soft border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Easy to Say</h3>
                <p className="text-muted-foreground text-sm">
                  Perfect for podcasts, videos, and conversations
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4 bg-gradient-card shadow-soft border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Instant Trust</h3>
                <p className="text-muted-foreground text-sm">
                  Friendly words feel safer than mysterious codes
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4 bg-gradient-card shadow-soft border-primary/10 hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Track & Analyze</h3>
                <p className="text-muted-foreground text-sm">
                  See how your cute links perform (coming soon!)
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-primary text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready for Cuter Links?
            </h2>
            <p className="text-xl text-white/90">
              that are easy to remember, say aloud, and share. Each link gets a cuteness rating too!
            </p>
            <div className="pt-4">
              <a
                href="#top"
                className="inline-flex items-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 shadow-glow"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Start Shortening Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Created by Sumit Menaria with ❤️ for better links
          </p>
          <p className="text-muted-foreground text-sm">
            v1.1.6
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;