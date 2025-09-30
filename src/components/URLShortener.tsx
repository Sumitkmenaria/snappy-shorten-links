import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Sparkles, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SliderCaptcha } from "./SliderCaptcha";
import { adjectives, nouns } from "@/lib/words";

const generateSlug = () => {
  let slug = "";
  let adjective = "";
  let noun = "";

  for (let len = 9; len >= 4; len--) {
    const adjectivesByLength = adjectives.filter(a => a.length < len);
    const nounsByLength = nouns.filter(n => n.length < len);

    adjective = adjectivesByLength[Math.floor(Math.random() * adjectivesByLength.length)];
    noun = nounsByLength[Math.floor(Math.random() * nounsByLength.length)];

    if (adjective.length + noun.length < 10) {
      slug = `${adjective}${noun}`;
      break;
    }
  }

  return { slug };
};


interface URLShortenerProps {
  onLinkCreated?: () => void;
}

export const URLShortener = ({ onLinkCreated }: URLShortenerProps) => {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resetCaptcha, setResetCaptcha] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "Please enter a URL",
        description: "We need a URL to create your cute short link!",
        variant: "destructive",
      });
      return;
    }
    
    if (url.includes('cutelinks.vercel.app')) {
      toast({
        title: "This is already a Cute Link!",
        description: "You can't shorten a link that is already short.",
        action: (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">Go to Link</Button>
          </a>
        ),
      });
      return;
    }

    if (!isVerified) {
      toast({
        title: "Please complete verification",
        description: "Move the slider to verify you\'re human!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const urlPattern = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/.*)?$/i;
      if (!urlPattern.test(url)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL (e.g., example.com or https://example.com)",
          variant: "destructive",
        });
        return;
      }

      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      setOriginalUrl(url);

      // Check if the URL already exists
      const { data: existingLink, error: selectError } = await supabase
        .from('links')
        .select('slug')
        .eq('original_url', fullUrl)
        .single();

      if (existingLink) {
        const currentDomain = window.location.host;
        const shortUrl = `${currentDomain}/${existingLink.slug}`;
        setSlug(existingLink.slug);
        setShortenedUrl(shortUrl);
        toast({
          title: "Link already exists!",
          description: "We found a cute link for that URL already.",
        });
        return;
      }
      
      const { slug: newSlug } = generateSlug();
      setSlug(newSlug);
      const currentDomain = window.location.host; 
      const shortUrl = `${currentDomain}/${newSlug}`;
      
      const { error } = await supabase
        .from('links')
        .insert({
          slug: newSlug,
          original_url: fullUrl,
          user_id: user?.id || null,
        });

      if (error) {
        console.error('Database error:', error);
        if (error.code === '23505') { // Unique constraint violation for slug
          toast({
            title: "Slug already exists",
            description: "This cute combination already exists. Trying again...",
            variant: "destructive",
          });
          // Could implement retry logic here
          return;
        }
        throw error;
      }

      if (user) {
        toast({
          title: "URL Shortened! ✨",
          description: `Your URL has been saved to your dashboard.`,
        });
        onLinkCreated?.();
      } else {
        toast({
          title: "URL Shortened! ✨",
          description: `Sign up to save and manage your URLs.`,
        });
      }
      
      setShortenedUrl(shortUrl);
      
      setUrl("");
      setIsVerified(false);
      setResetCaptcha(prev => !prev);
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${shortenedUrl}`);
    toast({
      title: "Copied! 📋",
      description: "Your cute link is now in your clipboard",
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Cute Link",
        text: "Check out this cute link I created!",
        url: `https://${shortenedUrl}`,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "Share not supported",
        description: "Your browser does not support the Web Share API.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <form onSubmit={handleShorten} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="https://your-super-long-url.com/with/lots/of/parameters"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-14 px-4 sm:px-6 text-base sm:text-lg bg-background/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-300 min-w-0"
          />
          <Button
            type="submit"
            disabled={isLoading || !isVerified}
            className="h-14 px-6 sm:px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base sm:text-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Shorten it!
              </div>
            )}
          </Button>
        </div>
        
        <SliderCaptcha 
          onVerified={setIsVerified} 
          isReset={resetCaptcha}
        />
      </form>

      {shortenedUrl && (
          <> 
            <Card className="p-6 bg-gradient-card shadow-soft border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Your cute short link is ready!
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-lg text-muted-foreground">Your cute link slug is:</p>
                  <p className="text-5xl font-bold text-primary break-all p-4 bg-primary/10 rounded-lg">{slug}</p>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border">
                <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-primary break-all">
                    {shortenedUrl}
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                    Your original URL was: {originalUrl}
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="hover:bg-primary/10"
                    >
                    <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${shortenedUrl}`, '_blank')}
                    className="hover:bg-primary/10"
                    >
                    <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={shareLink}
                    className="hover:bg-primary/10"
                    >
                    <Share2 className="w-4 h-4" />
                    </Button>
                </div>
                </div>
            </div>
            </Card>
        </>
      )}
    </div>
  );
};
