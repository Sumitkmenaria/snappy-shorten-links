import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export const GoToCuteLink = () => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const handleGoToLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) {
      try {
        const url = new URL(value);
        const path = url.pathname.slice(1); // Remove leading '/'
        if (path) {
          navigate(`/${path}`);
        } else {
          // Handle case where only the domain is entered
          navigate('/');
        }
      } catch (error) {
        // If the input is not a valid URL, assume it's a slug
        navigate(`/${value}`);
      }
    }
  };

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <Card className="p-6 sm:p-8 bg-gradient-card shadow-soft border-primary/20">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 text-center">
              Have a{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Cute Link
              </span>
              ?
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              Enter the slug or full URL to go to the destination website.
            </p>
            <form onSubmit={handleGoToLink} className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-1 items-center rounded-md border-2 bg-background/80 border-border focus-within:border-primary transition-colors h-14 hover:border-primary/50 backdrop-blur-sm">
                <Input
                  type="text"
                  placeholder="https://cutelinks.vercel.app/your-slug"
                  value={value}
                  onChange={(e) => setValue(e.target.value.toLowerCase())}
                  className="h-full flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base sm:text-lg min-w-0 pl-4"
                />
              </div>

              <Button
                type="submit"
                className="h-14 px-6 sm:px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base sm:text-lg font-semibold"
                disabled={!value}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                <span>Go</span>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
