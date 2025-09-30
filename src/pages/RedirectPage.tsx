import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, AlertTriangle, Loader2, Home, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/Logo';

const RedirectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          .eq('slug', slug)
          .single();

        if (dbError || !data) {
          throw new Error('Link not found or expired.');
        }

        setOriginalUrl(data.original_url);
        
        const screenshotServiceUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(data.original_url)}?w=400&h=300`;
        setScreenshotUrl(screenshotServiceUrl);

      } catch (err) {
        console.error('Error fetching link:', err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [slug]);

  const handleGoToUrl = () => {
    if (originalUrl) {
      window.location.href = originalUrl;
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="mb-8"><Logo /></div>
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg">Loading your link...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 space-y-8">
            <Logo />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Something went wrong</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-muted-foreground">{error}</p>
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900 space-y-8">
        <Logo />
        <Card className="w-full max-w-lg">
            <CardHeader>
            <CardTitle className="text-center text-xl font-bold">Proceed to external site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
                    Website Preview
                </div>
                <div className="p-2 bg-background relative aspect-video">
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
                                setScreenshotUrl(null);
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
                Create Your Own Cute Link!
                </Button>
            </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default RedirectPage;
