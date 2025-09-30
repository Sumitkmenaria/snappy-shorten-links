import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Sparkles, Share2, StickyNote } from "lucide-react";
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

const calculateCuteness = (slug: string) => {
  const cuteWords = [
    'fluffy', 'sparkly', 'bubbly', 'giggly', 'snuggly', 'cuddly', 'fuzzy', 'cozy',
    'sweet', 'lovely', 'pretty', 'cute', 'tiny', 'mini', 'soft', 'warm',
    'happy', 'sunny', 'bright', 'cheerful', 'jolly', 'merry', 'glad', 'peppy',
    'kitten', 'puppy', 'bunny', 'panda', 'unicorn', 'rainbow', 'star', 'moon',
    'flower', 'rose', 'daisy', 'lily', 'cherry', 'peach', 'honey', 'sugar',
    'cookie', 'cupcake', 'candy', 'marshmallow', 'cotton', 'cloud', 'dream', 'wish'
  ];
  
  let cutenessScore = 75; // Base cuteness
  
  cuteWords.forEach(word => {
    if (slug.toLowerCase().includes(word)) {
      cutenessScore += Math.random() * 10 + 5; // Add 5-15 points for cute words
    }
  });
  
  // Add some randomness but keep it between 75-100
  cutenessScore += Math.random() * 10;
  return Math.min(100, Math.floor(cutenessScore));
};

interface NoteShortenenerProps {
  onNoteCreated?: () => void;
}

export const NoteShortener = ({ onNoteCreated }: NoteShortenenerProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resetCaptcha, setResetCaptcha] = useState(false);
  const [cuteness, setCuteness] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Please enter note content",
        description: "We need some content to create your cute note link!",
        variant: "destructive",
      });
      return;
    }

    if (!isVerified) {
      toast({
        title: "Please complete verification",
        description: "Move the slider to verify you're not a potato!",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { slug: newSlug } = generateSlug();
      const cutenessRating = calculateCuteness(newSlug);
      
      setSlug(newSlug);
      setCuteness(cutenessRating);
      
      const currentDomain = window.location.host; 
      const shortUrl = `${currentDomain}/note/${newSlug}`;
      
      const { error } = await supabase
        .from('notes')
        .insert({
          slug: newSlug,
          content: content.trim(),
          title: title.trim() || null,
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
          return;
        }
        throw error;
      }

      if (user) {
        toast({
          title: `Note Created! ✨ (${cutenessRating}% cute)`,
          description: `Your note has been saved to your dashboard.`,
        });
        onNoteCreated?.();
      } else {
        toast({
          title: `Note Created! ✨ (${cutenessRating}% cute)`,
          description: `Sign up to save and manage your notes.`,
        });
      }
      
      setShortenedUrl(shortUrl);
      
      setTitle("");
      setContent("");
      setIsVerified(false);
      setResetCaptcha(prev => !prev);
    } catch (error) {
      console.error('Error creating note:', error);
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
      description: "Your cute note link is now in your clipboard",
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: title || "My Cute Note",
        text: "Check out this cute note I created!",
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
      <form onSubmit={handleCreateNote} className="space-y-4">
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Note title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 px-4 text-base bg-background/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-300"
          />
          <Textarea
            placeholder="Write your note here... Share thoughts, ideas, or anything you want to remember!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] px-4 py-3 text-base bg-background/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-300 resize-none"
            rows={5}
          />
        </div>
        
        <SliderCaptcha 
          onVerified={setIsVerified} 
          isReset={resetCaptcha}
        />
        
        <Button
          type="submit"
          disabled={isLoading || !isVerified}
          className="w-full h-14 px-6 bg-gradient-primary hover:shadow-glow transition-all duration-300 text-base font-semibold disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Note...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Create Cute Note Link!
            </div>
          )}
        </Button>
      </form>

      {shortenedUrl && (
        <Card className="p-6 bg-gradient-card shadow-soft border-primary/20 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StickyNote className="w-4 h-4 text-primary" />
              Your cute note link is ready! ({cuteness}% cute)
            </div>
            
            <div className="text-center mb-4">
              <p className="text-lg text-muted-foreground">Your cute note slug is:</p>
              <p className="text-4xl font-bold text-primary break-all p-4 bg-primary/10 rounded-lg">{slug}</p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border">
              <div className="flex-1 min-w-0">
                <div className="text-xl font-bold text-primary break-all mb-1">
                  {shortenedUrl}
                </div>
                <div className="text-sm text-muted-foreground">
                  {title ? `Note: "${title}"` : "Your note is ready to share!"}
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
      )}
    </div>
  );
};