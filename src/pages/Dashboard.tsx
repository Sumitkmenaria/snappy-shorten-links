import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Copy, ExternalLink, Trash2, LogOut, Plus, Link as LinkIcon, StickyNote, Calendar, Eye } from 'lucide-react';
import { URLShortener } from '@/components/URLShortener';
import { NoteShortener } from '@/components/NoteShortener';

interface Link {
  id: string;
  slug: string;
  original_url: string;
  click_count: number;
  created_at: string;
}

interface Note {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  click_count: number;
  created_at: string;
}

const Dashboard = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShortener, setShowShortener] = useState(false);
  const [showNoteCreator, setShowNoteCreator] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch user's links
  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchNotes();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      console.log('Fetching links for user:', user?.id);
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched links:', data);
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      console.log('Fetching notes for user:', user?.id);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched notes:', data);
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your notes',
        variant: 'destructive',
      });
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinks(links.filter(link => link.id !== id));
      toast({
        title: 'Success',
        description: 'Link deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete link',
        variant: 'destructive',
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLinkCreated = () => {
    setShowShortener(false);
    fetchLinks(); // Refresh the links list
  };

  const handleNoteCreated = () => {
    setShowNoteCreator(false);
    fetchNotes(); // Refresh the notes list
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your shortened URLs and notes</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              URLs ({links.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Your Links</h2>
                <p className="text-sm text-muted-foreground">{links.length} shortened URL{links.length !== 1 ? 's' : ''}</p>
              </div>
              <Button onClick={() => setShowShortener(!showShortener)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {showShortener ? 'Hide' : 'Create New'}
              </Button>
            </div>

            {showShortener && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Short URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <URLShortener onLinkCreated={handleLinkCreated} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-3 sm:p-6">
                {links.length === 0 ? (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No links created yet</p>
                    <Button onClick={() => setShowShortener(true)} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Link
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Short URL</TableHead>
                            <TableHead>Original URL</TableHead>
                            <TableHead>Clicks</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {links.map((link) => (
                            <TableRow key={link.id}>
                              <TableCell className="font-mono text-xs break-all">
                                {window.location.host}/{link.slug}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-xs">
                                {link.original_url}
                              </TableCell>
                              <TableCell>{link.click_count}</TableCell>
                              <TableCell className="text-xs">
                                {new Date(link.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(`https://${window.location.host}/${link.slug}`)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(link.original_url, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteLink(link.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {links.map((link) => (
                        <Card key={link.id} className="border">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-1">Short URL</p>
                                  <p className="font-mono text-sm text-primary break-all">
                                    {window.location.host}/{link.slug}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted-foreground">Clicks</p>
                                  <p className="font-semibold">{link.click_count}</p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Original URL</p>
                                <p className="text-sm break-all line-clamp-2">{link.original_url}</p>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <span>{new Date(link.created_at).toLocaleDateString()}</span>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(`https://${window.location.host}/${link.slug}`)}
                                  className="flex-1"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(link.original_url, '_blank')}
                                  className="flex-1"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteLink(link.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Your Notes</h2>
                <p className="text-sm text-muted-foreground">{notes.length} shared note{notes.length !== 1 ? 's' : ''}</p>
              </div>
              <Button onClick={() => setShowNoteCreator(!showNoteCreator)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                {showNoteCreator ? 'Hide' : 'Create New'}
              </Button>
            </div>

            {showNoteCreator && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoteShortener onNoteCreated={handleNoteCreated} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-3 sm:p-6">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <StickyNote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No notes created yet</p>
                    <Button onClick={() => setShowNoteCreator(true)} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Note
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <Card key={note.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="mb-2">
                                <span className="font-mono text-xs sm:text-sm bg-primary/10 text-primary px-2 py-1 rounded break-all inline-block">
                                  {window.location.host}/note/{note.slug}
                                </span>
                              </div>
                              {note.title && (
                                <h3 className="font-semibold text-base sm:text-lg mb-2 break-words">
                                  {note.title}
                                </h3>
                              )}
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3 break-words">
                                {note.content}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(note.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {note.click_count} views
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(`https://${window.location.host}/note/${note.slug}`)}
                                className="flex-1 sm:flex-initial"
                              >
                                <Copy className="w-4 h-4 sm:mr-0" />
                                <span className="ml-2 sm:hidden">Copy</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/note/${note.slug}`, '_blank')}
                                className="flex-1 sm:flex-initial"
                              >
                                <ExternalLink className="w-4 h-4 sm:mr-0" />
                                <span className="ml-2 sm:hidden">Open</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteNote(note.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;