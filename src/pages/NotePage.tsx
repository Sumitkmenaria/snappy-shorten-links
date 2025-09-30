import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, StickyNote, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NotePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const hasIncrementedViews = useRef(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!slug) {
        setError('Invalid note link');
        setLoading(false);
        return;
      }

      try {
        console.log('Looking for note with slug:', slug);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Database error:', error);
          setError('Database error occurred');
          setLoading(false);
          return;
        }

        if (!data) {
          console.log('No note found for slug:', slug);
          setError('Note not found');
          setLoading(false);
          return;
        }

        console.log('Found note:', data);
        setNote(data);

        // Update view count (only once per page load)
        if (!hasIncrementedViews.current) {
          hasIncrementedViews.current = true;
          await supabase
            .from('notes')
            .update({ click_count: data.click_count + 1 })
            .eq('slug', slug);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };

    fetchNote();
  }, [slug]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(note.content);
    toast({
      title: "Copied! 📋",
      description: "Note content copied to clipboard",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied! 🔗",
      description: "Note link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your note...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl">📝</div>
            <h1 className="text-2xl font-bold text-foreground">Note Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Create Your Own Note
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            ← Create Your Own Note
          </Button>
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <StickyNote className="w-6 h-6" />
            <span className="text-lg font-semibold">Cute Note</span>
          </div>
        </div>

        {/* Note Content */}
        <Card className="bg-gradient-card shadow-soft border-primary/20 mb-6">
          <CardHeader className="pb-4">
            {note.title && (
              <CardTitle className="text-2xl text-foreground mb-2">
                {note.title}
              </CardTitle>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(note.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {note.click_count} views
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {note.content}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Note
              </Button>
              <Button
                onClick={copyLink}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Want to create your own cute note links?
          </p>
          <Button onClick={() => navigate('/')} size="lg">
            Create Note Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotePage;