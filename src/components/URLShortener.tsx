import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SliderCaptcha } from "./SliderCaptcha";

// Mock word lists for demo purposes
const adjectives = [
  "sweet", "happy", "sunny", "cozy", "gentle", "bright", "calm", "fresh", 
  "warm", "soft", "cool", "smart", "kind", "quick", "brave", "funny"
];

const nouns = [
  "potato", "panda", "cloud", "moon", "star", "tree", "bird", "cat",
  "flower", "river", "mountain", "book", "coffee", "cookie", "dream", "song"
];

const generateSlug = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
};

export const URLShortener = () => {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resetCaptcha, setResetCaptcha] = useState(false);
  const { toast } = useToast();

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

    if (!isVerified) {
      toast({
        title: "Please complete verification",
        description: "Move the slider to verify you're human!",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (include https://)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // For now, simulate the database operation
    // TODO: Replace with actual Supabase calls once client is available
    setTimeout(async () => {
      try {
        const slug = generateSlug();
        setShortenedUrl(`yourdomain.com/${slug}`);
        setIsLoading(false);
        
        // Reset form
        setUrl("");
        setIsVerified(false);
        setResetCaptcha(prev => !prev);
        
        toast({
          title: "Link shortened! ✨",
          description: "Your cute link is ready to share!",
        });
      } catch (error) {
        console.error('Error shortening URL:', error);
        setIsLoading(false);
        toast({
          title: "Something went wrong",
          description: "Please try again in a moment",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${shortenedUrl}`);
    toast({
      title: "Copied! 📋",
      description: "Your cute link is now in your clipboard",
    });
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
        
        {/* Human Verification */}
        <SliderCaptcha 
          onVerified={setIsVerified} 
          isReset={resetCaptcha}
        />
      </form>

      {shortenedUrl && (
        <Card className="p-6 bg-gradient-card shadow-soft border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Your cute short link is ready!
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border">
              <div className="flex-1">
                <div className="text-2xl font-bold text-primary">
                  {shortenedUrl}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {url}
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
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};