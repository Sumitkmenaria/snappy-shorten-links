import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, TriangleAlert as AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RedirectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchLink = async () => {
      if (!slug) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        console.log('Looking for slug:', slug);
        const { data, error } = await supabase
          .from('links')
          .select('original_url, click_count')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Database error:', error);
          setError('Database error occurred');
          setLoading(false);
          return;
        }

        if (!data) {
          console.log('No link found for slug:', slug);
          setError('Link not found');
          setLoading(false);
          return;
        }

        console.log('Found link:', data);
        setOriginalUrl(data.original_url);

        // Update click count
        await supabase
          .from('links')
          .update({ click_count: data.click_count + 1 })
          .eq('slug', slug);

        setLoading(false);

        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              window.location.href = data.original_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } catch (err) {
        console.error('Error fetching link:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };

    fetchLink();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slug]);

  const handleGoToUrl = () => {
    if (originalUrl) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.location.href = originalUrl;
    }
  };

  const handleGoHome = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigate('/');
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
        {/* Ad Placeholder */}
        <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Advertisement</p>
        </div>

        {/* Main redirect card */}
        <Card className="bg-gradient-card shadow-soft border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-3xl font-bold text-foreground">
                You're being redirected
              </h1>
              <p className="text-muted-foreground">
                Redirecting in <span className="font-bold text-primary">{countdown}</span> seconds...
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

            {/* Warning Message */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold flex items-center">
                    <AlertTriangle className="mr-2"/>
                    Warning
                </p>
                <p>This is an external website. Only proceed if you trust the sender.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleGoToUrl} className="w-full flex items-center gap-2">
                Go to URL now
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                Shorten your own URL
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Ad Placeholder */}
        <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Advertisement</p>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
