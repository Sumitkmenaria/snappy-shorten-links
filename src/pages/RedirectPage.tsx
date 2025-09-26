import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RedirectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchLink = async () => {
      if (!slug) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        // Fetch the original URL
        const { data, error } = await supabase
          .from('links')
          .select('original_url, click_count')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          setError('Link not found');
          setLoading(false);
          return;
        }

        setOriginalUrl(data.original_url);

        // Update click count
        await supabase
          .from('links')
          .update({ click_count: data.click_count + 1 })
          .eq('slug', slug);

        setLoading(false);

        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = data.original_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err) {
        console.error('Error fetching link:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };

    fetchLink();
  }, [slug]);

  const handleSkip = () => {
    if (originalUrl) {
      window.location.href = originalUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your destination...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl">😿</div>
            <h1 className="text-2xl font-bold text-foreground">Oops!</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main redirect card */}
        <Card className="bg-gradient-card shadow-soft border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-3xl font-bold text-foreground">
                Taking you to your destination!
              </h1>
              <p className="text-muted-foreground">
                You'll be redirected in <span className="font-bold text-primary">{countdown}</span> seconds
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-4 border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ExternalLink className="w-4 h-4" />
                Destination:
              </div>
              <div className="font-mono text-sm break-all text-foreground">
                {originalUrl}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleSkip} className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Skip ({countdown}s)
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              This brief pause helps support our service
            </div>
          </CardContent>
        </Card>

        {/* Ad space */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-2xl">✨</div>
            <h2 className="text-lg font-semibold text-purple-800">
              Love cute short links?
            </h2>
            <p className="text-purple-600 text-sm">
              Create your own memorable URLs with our free service!
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Try it now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RedirectPage;