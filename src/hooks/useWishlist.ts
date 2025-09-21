import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      fetchWishlist();
    }
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await auth.fetchWithAuth('/my-wishlist-flats');
      if (response.ok) {
        const flats: { id: number }[] = await response.json();
        const ids = new Set(flats.map(flat => flat.id));
        setWishlistIds(ids);
      }
    } catch (error) {
      // Silent fail for initial fetch
    }
  };

  const toggleWishlist = async (flatId: number) => {
    if (!auth.isAuthenticated()) {
      toast({
        title: 'Login required',
        description: 'Please login to save flats to your wishlist.',
      });
      return;
    }

    setLoading(true);
    const isInWishlist = wishlistIds.has(flatId);

    try {
      const endpoint = isInWishlist ? `/wishlist/remove/${flatId}` : `/wishlist/add/${flatId}`;
      const method = isInWishlist ? 'DELETE' : 'POST';
      
      const response = await auth.fetchWithAuth(endpoint, { method });
      
      if (response.ok) {
        const newWishlistIds = new Set(wishlistIds);
        if (isInWishlist) {
          newWishlistIds.delete(flatId);
        } else {
          newWishlistIds.add(flatId);
        }
        setWishlistIds(newWishlistIds);
        
        toast({
          title: isInWishlist ? 'Removed from favorites' : 'Added to favorites',
          description: isInWishlist 
            ? 'Flat removed from your favorites' 
            : 'Flat saved to your favorites',
        });
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update your wishlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (flatId: number) => wishlistIds.has(flatId);

  return {
    isInWishlist,
    toggleWishlist,
    loading,
  };
};