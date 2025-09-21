import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlatCard } from '@/components/flats/FlatCard';
import { FlatDetailsModal } from '@/components/flats/FlatDetailsModal';
import { Flat } from '@/types/flatfit';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';

const MyFavs = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyFavs();
  }, []);

  const fetchMyFavs = async () => {
    try {
      const response = await auth.fetchWithAuth('/wishlist/myFavs');
      if (response.ok) {
        const data = await response.json();
        setFlats(data);
      } else {
        throw new Error('Failed to fetch favorites');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your favorite flats.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please login to view your favorites.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-destructive" />
          My Favorite Flats
        </h1>
        <p className="text-muted-foreground">
          {flats.length === 0 ? 'No favorite flats yet' : `${flats.length} flat${flats.length === 1 ? '' : 's'} saved`}
        </p>
      </div>

      {flats.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground">
              Start exploring flats and save your favorites by clicking the heart icon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flats.map((flat) => (
            <FlatCard
              key={flat.id}
              flat={flat}
              onViewDetails={() => setSelectedFlat(flat)}
            />
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

export default MyFavs;