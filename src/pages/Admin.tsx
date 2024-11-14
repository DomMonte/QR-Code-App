import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Copy, ExternalLink, Image as ImageIcon, Clock, Download, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import AdminNavbar from '../components/AdminNavbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface Album {
  id: string;
  created_at: string;
  name: string;
  created_by: string;
  _count?: {
    photos: number;
  };
  last_photo_at?: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [showAssignAdmin, setShowAssignAdmin] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadAlbums();
    checkUserRole();
    loadAdminUsers();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsGlobalAdmin(profile?.role === 'global_admin');
      setUserRole(profile?.role || '');
    }
  };

  const loadAdminUsers = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');

    if (!error && data) {
      setAdminUsers(data);
    } else {
      console.error('Error loading admin users:', error);
    }
  };

  const loadAlbums = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false });

    if (profile?.role !== 'global_admin') {
      query = query.eq('created_by', user.id);
    }

    const { data: albumsData, error: albumsError } = await query;

    if (albumsError || !albumsData) return;

    const albumsWithStats = await Promise.all(
      albumsData.map(async (album) => {
        const { count } = await supabase
          .from('photos')
          .select('*', { count: 'exact' })
          .eq('album_id', album.id);

        const { data: lastPhoto } = await supabase
          .from('photos')
          .select('created_at')
          .eq('album_id', album.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...album,
          _count: {
            photos: count || 0,
          },
          last_photo_at: lastPhoto?.[0]?.created_at,
        };
      })
    );

    setAlbums(albumsWithStats);
  };

  const createAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('albums')
      .insert([{ 
        name: newAlbumName,
        created_by: user.id
      }])
      .select();

    if (!error && data) {
      await loadAlbums();
      setNewAlbumName('');
      setShowNewAlbum(false);
    }
  };

  const assignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('albums')
      .update({ created_by: selectedAdminId })
      .eq('id', selectedAlbumId);

    if (!error) {
      await loadAlbums();
      setShowAssignAdmin(false);
      setSelectedAlbumId('');
      setSelectedAdminId('');
    } else {
      console.error('Error assigning admin:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAlbumUrl = (albumId: string) => {
    return `${window.location.origin}/album/${albumId}`;
  };

  const downloadQRCode = (albumId: string, albumName: string) => {
    const canvas = document.createElement('canvas');
    const svg = document.getElementById(`qr-${albumId}`);
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg!);
    
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `qr-${albumName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.8);
      link.click();
    };
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar userEmail={userEmail} userRole={userRole} />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Your Albums</h2>
          <Button onClick={() => setShowNewAlbum(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Album
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Card key={album.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-foreground">{album.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {album._count?.photos || 0} photos
                  {album.last_photo_at && (
                    <>
                      <Clock className="w-4 h-4 ml-2" />
                      Last update: {formatDistanceToNow(new Date(album.last_photo_at))} ago
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <QRCodeSVG 
                    id={`qr-${album.id}`}
                    value={getAlbumUrl(album.id)} 
                    size={200}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(getAlbumUrl(album.id))}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadQRCode(album.id, album.name)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save QR
                </Button>
                {isGlobalAdmin && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedAlbumId(album.id);
                      setShowAssignAdmin(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* New Album Dialog */}
        <Dialog open={showNewAlbum} onOpenChange={setShowNewAlbum}>
          <DialogContent>
            <form onSubmit={createAlbum}>
              <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
                <DialogDescription>
                  Enter a name for your new photo album.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Album name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Album</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assign Admin Dialog */}
        <Dialog open={showAssignAdmin} onOpenChange={setShowAssignAdmin}>
          <DialogContent>
            <form onSubmit={assignAdmin}>
              <DialogHeader>
                <DialogTitle>Assign Album to Admin</DialogTitle>
                <DialogDescription>
                  Select an admin to assign this album to.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background text-foreground"
                  required
                >
                  <option value="">Select an admin</option>
                  {adminUsers.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.email} ({formatRole(admin.role)})
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Assign Album</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}