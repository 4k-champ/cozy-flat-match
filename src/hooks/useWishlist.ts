import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (auth.isAuthenticated() && !hasFetched.current) {
      fetchWishlist();
    }
  }, []);

  const fetchWishlist = async () => {
    if (hasFetched.current) return;
    
    try {
      hasFetched.current = true;
      const response = await auth.fetchWithAuth('/wishlist/my-wishlist-flats');
      if (response.ok) {
        const flatIds: number[] = await response.json();
        const ids = new Set(flatIds);
        setWishlistIds(ids);
      }
    } catch (error) {
      hasFetched.current = false; // Reset on error to allow retry
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