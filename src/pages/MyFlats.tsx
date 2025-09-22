import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  MapPin, 
  Trash2, 
  Eye,
  Loader2,
  Home,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Flat } from '@/types/flatfit';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { FlatDetailsModal } from '@/components/flats/FlatDetailsModal';
import { FlatCard } from '@/components/flats/FlatCard';
import { FlatCardSkeleton } from '@/components/layout/FlatCardSkeleton';

const MyFlats = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyFlats();
  }, []);

  const fetchMyFlats = async () => {
    try {
      const response = await auth.fetchWithAuth('/flat/fetchFlats-postedBy');
      if (response.ok) {
        const data = await response.json();
        setFlats(data);
      } else {
        throw new Error('Failed to fetch my flats');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your posted flats.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flatId: number) => {
    try {
      const response = await auth.fetchWithAuth(`/flat/${flatId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFlats(flats.filter(flat => flat.id !== flatId));
        toast({
          title: 'Flat deleted',
          description: 'Your flat listing has been removed successfully.',
        });
      } else {
        throw new Error('Failed to delete flat');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the flat listing.',
        variant: 'destructive',
      });
    }
  };

  if (!auth.isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please login to view your flats.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            My Flats
          </h1>
          <p className="text-muted-foreground">Loading your posted flats...</p>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <FlatCardSkeleton key={i} viewMode="list" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Home className="h-8 w-8 text-primary" />
          My Flats
        </h1>
        <p className="text-muted-foreground">
          {flats.length === 0 ? 'No flats posted yet' : `${flats.length} flat${flats.length === 1 ? '' : 's'} posted`}
        </p>
      </div>

      {flats.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flats posted yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by posting your first flat to find the perfect roommate.
            </p>
            <Button asChild variant="primary">
              <Link to="/list-new-flat">
                <Plus className="h-4 w-4 mr-2" />
                Post a Flat
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flats.map((flat) => (
            <Card key={flat.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative w-48 h-32 flex-shrink-0">
                    <img
                      src={flat.imageUrls[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
                      alt="Flat"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{flat.address}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{flat.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">
                        ₹{flat.monthlyRent.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                      <Badge variant="outline">
                        {flat.roomType.toLowerCase()}
                      </Badge>
                      <Badge variant="secondary">
                        {flat.genderPreference === 'ANY' ? 'Any gender' : flat.genderPreference.toLowerCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {flat.postedBy?.name?.[0] || flat.postedByEmail[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          Posted by you
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFlat(flat)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Flat Listing</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this flat listing? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(flat.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedFlat && (
        <FlatDetailsModal
          flat={selectedFlat}
          open={!!selectedFlat}
          onOpenChange={() => setSelectedFlat(null)}
        />
      )}
    </div>
  );
};

export default MyFlats;