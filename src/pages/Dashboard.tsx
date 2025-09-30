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

  // Fetch user's links and notes
  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchNotes();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
      setLinks(links.filter(link => link.id !== id));
      toast({ title: 'Success', description: 'Link deleted successfully' });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({ title: 'Error', description: 'Failed to delete link', variant: 'destructive' });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
      toast({ title: 'Success', description: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Link copied to clipboard' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLinkCreated = () => {
    setShowShortener(false);
    fetchLinks();
  };

  const handleNoteCreated = () => {
    setShowNoteCreator(false);
    fetchNotes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold break-words">My Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground break-words">Manage your shortened URLs and notes</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto flex-shrink-0">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="truncate">URLs ({links.length})</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              <span className="truncate">Notes ({notes.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold break-words">Your Links</h2>
                <Button onClick={() => setShowShortener(!showShortener)} className="w-full sm:w-auto flex-shrink-0">
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
                    <p className="text-muted-foreground mb-4 break-words">No links created yet</p>
                    <Button onClick={() => setShowShortener(true)} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Link
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Short URL</TableHead>
                          <TableHead>Original URL</TableHead>
                          <TableHead className="text-center">Clicks</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {links.map((link) => (
                          <TableRow key={link.id} className="text-sm">
                            <TableCell className="font-mono text-xs break-all min-w-[150px]">
                              {window.location.host}/{link.slug}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {link.original_url}
                              </a>
                            </TableCell>
                            <TableCell className="text-center">{link.click_count}</TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{new Date(link.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end flex-wrap">
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(`https://${window.location.host}/${link.slug}`)}><Copy className="w-4 h-4" /></Button>
                                <Button size="sm" variant="outline" onClick={() => window.open(link.original_url, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteLink(link.id)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold break-words">Your Notes</h2>
                <Button onClick={() => setShowNoteCreator(!showNoteCreator)} className="w-full sm:w-auto flex-shrink-0">
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
                    <p className="text-muted-foreground mb-4 break-words">No notes created yet</p>
                    <Button onClick={() => setShowNoteCreator(true)} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Note
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note) => (
                      <Card key={note.id} className="flex flex-col">
                        <CardContent className="p-4 flex flex-col flex-grow">
                          <div className="flex-grow space-y-3">
                            <div className="font-mono text-xs sm:text-sm bg-primary/10 text-primary px-2 py-1 rounded break-all">
                              {window.location.host}/note/{note.slug}
                            </div>
                            {note.title && <h3 className="font-semibold text-base sm:text-lg break-words">{note.title}</h3>}
                            <p className="text-muted-foreground text-sm line-clamp-3 break-words flex-grow">{note.content}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{new Date(note.created_at).toLocaleDateString()}</span></div>
                              <div className="flex items-center gap-1"><Eye className="w-3 h-3" /><span>{note.click_count} views</span></div>
                            </div>
                            <div className="flex gap-2 justify-end flex-wrap">
                              <Button size="sm" variant="outline" onClick={() => copyToClipboard(`https://${window.location.host}/note/${note.slug}`)}><Copy className="w-4 h-4" /></Button>
                              <Button size="sm" variant="outline" onClick={() => window.open(`/note/${note.slug}`, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)}><Trash2 className="w-4 h-4" /></Button>
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
