import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Calendar,
  MessageCircle,
  Heart,
  Share,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Shield,
  Refrigerator,
  WashingMachine,
  Tv,
  AirVent
} from 'lucide-react';
import { Flat } from '@/types/flatfit';
import { auth } from '@/lib/auth';
import { LoginModal } from '@/components/auth/LoginModal';
import { useToast } from '@/hooks/use-toast';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Security': Shield,
  'Fridge': Refrigerator,
  'Washing Machine': WashingMachine,
  'TV': Tv,
  'AC': AirVent,
};

interface FlatDetailsModalProps {
  flat: Flat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FlatDetailsModal = ({ flat, open, onOpenChange }: FlatDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const images = flat.imageUrls.length > 0 ? flat.imageUrls : [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleChat = () => {
    if (!auth.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    toast({
      title: 'Starting chat',
      description: `Opening chat with ${flat.postedBy?.name || flat.postedByEmail}`,
    });
    // Chat functionality would be implemented here
  };

  const handleInterest = () => {
    if (!auth.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    toast({
      title: 'Interest expressed',
      description: 'The flat owner will be notified of your interest.',
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied',
      description: 'Flat link copied to clipboard',
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? 'Removed from favorites' : 'Added to favorites',
      description: isLiked ? 'Flat removed from your favorites' : 'Flat saved to your favorites',
    });
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'MALE': return '👨';
      case 'FEMALE': return '👩';
      default: return '👥';
    }
  };

  const getLifestyleIcon = (allowed: boolean) => {
    return allowed ? (
      <Check className="h-4 w-4 text-accent" />
    ) : (
      <X className="h-4 w-4 text-destructive" />
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Flat Details</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={`Flat image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <div className="absolute top-3 left-3 text-xl">
                  {getGenderIcon(flat.genderPreference)}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-12 rounded flex-shrink-0 overflow-hidden ${
                        index === currentImageIndex ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Flat Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{flat.address}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{flat.city}</span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-bold text-primary">
                    ₹{flat.monthlyRent.toLocaleString()}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {flat.roomType.toLowerCase()} room
                  </Badge>
                  <Badge variant="secondary">
                    {flat.genderPreference === 'ANY' ? 'Any gender' : flat.genderPreference.toLowerCase()}
                  </Badge>
                </div>

                {flat.availableFrom && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Available from {new Date(flat.availableFrom).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Posted By */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {flat.postedBy?.name?.[0] || flat.postedByEmail[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{flat.postedBy?.name || 'Flat Owner'}</p>
                  <p className="text-sm text-muted-foreground">{flat.postedByEmail}</p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {flat.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity];
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        {IconComponent ? (
                          <IconComponent className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="w-4 h-4 bg-primary/20 rounded-full flex-shrink-0" />
                        )}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mock Lifestyle Preferences */}
              <div>
                <h3 className="font-semibold mb-3">Lifestyle Preferences</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    {getLifestyleIcon(true)}
                    <span>Guests allowed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getLifestyleIcon(false)}
                    <span>Smoking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getLifestyleIcon(false)}
                    <span>Pets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getLifestyleIcon(true)}
                    <span>Late night parties</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Owner
                </Button>
                <Button variant="outline" onClick={handleInterest}>
                  Express Interest
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
};