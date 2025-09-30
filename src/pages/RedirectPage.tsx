import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, AlertTriangle, Loader2, Home, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RedirectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(true);

  useEffect(() => {
    const fetchLink = async () => {
      if (!slug) {
        setError('No short link provided.');
        setLoading(false);
        return;
      }
      try {
        const { data, error: dbError } = await supabase
          .from('links')
          .select('original_url')
          .eq('short_code', slug)
          .single();

        if (dbError || !data) {
          throw new Error('Link not found or expired.');
        }

        setOriginalUrl(data.original_url);
        
        // Generate screenshot URL using an external service
        const screenshotServiceUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(data.original_url)}?w=600&h=450`;
        setScreenshotUrl(screenshotServiceUrl);

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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg">Loading your link...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">{error}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-muted-foreground">The link you are trying to access is invalid or has expired.</p>
                    <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">You are being redirected...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p>You will be redirected in <span className="font-bold text-foreground">{countdown}</span> seconds.</p>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
                Website Preview
            </div>
            <div className="p-2 bg-background relative aspect-[4/3]">
                {isScreenshotLoading && (
                    <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                {screenshotUrl ? (
                    <img
                        src={screenshotUrl}
                        alt="Screenshot of the destination website"
                        className={`w-full h-full object-contain transition-opacity duration-300 ${isScreenshotLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setIsScreenshotLoading(false)}
                        onError={() => {
                            setIsScreenshotLoading(false);
                            setScreenshotUrl(null); // Clear broken URL to show fallback
                        }}
                    />
                ) : !isScreenshotLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-md">
                        <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
                        <span className="text-sm">Screenshot not available</span>
                    </div>
                )}
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border text-left">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ExternalLink className="w-4 h-4" />
              Destination:
            </div>
            <div className="font-mono text-sm break-all text-foreground">
              {originalUrl}
            </div>
          </div>

          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-left" role="alert">
              <p className="font-bold flex items-center">
                  <AlertTriangle className="mr-2"/>
                  Warning
              </p>
              <p className="break-words">This is an external website. Only proceed if you trust the sender.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleGoToUrl} className="flex-1">
              Go to URL now
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              Cancel & Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectPage;
