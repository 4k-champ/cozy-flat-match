import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye,
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
import { useWishlist } from '@/hooks/useWishlist';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Security': Shield,
  'Fridge': Refrigerator,
  'Washing Machine': WashingMachine,
  'TV': Tv,
  'AC': AirVent,
};

interface FlatCardProps {
  flat: Flat;
  matchPercentage?: number;
  onViewDetails: () => void;
  viewMode?: 'grid' | 'list';
}

export const FlatCard = ({ flat, matchPercentage, onViewDetails, viewMode = 'grid' }: FlatCardProps) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const navigate = useNavigate();
  const currentUser = auth.getUser();


    const handleChat = () => {
    if (!auth.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    navigate(`/chat/${flat.id}/${currentUser?.id}`);
  };

  const handleLike = () => {
    toggleWishlist(flat.id);
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'MALE': return '👨';
      case 'FEMALE': return '👩';
      default: return '👥';
    }
  };

  const displayAmenities = flat.amenities.slice(0, 4);
  const remainingCount = flat.amenities.length - 4;

  if (viewMode === 'list') {
    return (
      <>
        <Card className="hover:shadow-card transition-smooth cursor-pointer" onClick={onViewDetails}>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Image */}
              <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
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

                <div className="flex items-center gap-4 mb-3">
                  <div className="text-2xl font-bold text-primary">
                    ₹{flat.monthlyRent.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <Badge variant="outline">
                    {flat.roomType.toLowerCase()}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getGenderIcon(flat.genderPreference)}
                    <span>{flat.genderPreference === 'ANY' ? 'Any gender' : flat.genderPreference.toLowerCase()}</span>
                  </Badge>
                  {matchPercentage && (
                    <Badge className="bg-accent text-accent-foreground">
                      {matchPercentage}% match
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {displayAmenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity];
                    return IconComponent ? (
                      <div key={amenity} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconComponent className="h-3 w-3" />
                        <span>{amenity}</span>
                      </div>
                    ) : (
                      <span key={amenity} className="text-xs text-muted-foreground">{amenity}</span>
                    );
                  })}
                  {remainingCount > 0 && (
                    <span className="text-xs text-muted-foreground">+{remainingCount} more</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {flat.postedBy?.name?.[0] || flat.postedByEmail[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {flat.postedBy?.name || flat.postedByEmail}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike();
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(flat.id) ? 'fill-destructive text-destructive' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChat();
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Chat</span>
                    </Button>
                    <Button variant="primary" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    );
  }

  return (
    <>
      <Card className="group hover:shadow-card transition-smooth cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={flat.imageUrls[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'}
            alt="Flat"
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
            onClick={onViewDetails}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(flat.id) ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-3 md:p-4 space-y-3" onClick={onViewDetails}>
          {/* Location */}
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">{flat.address}</h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-sm">{flat.city}</span>
            </div>
          </div>

          {/* Price and badges */}
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xl font-bold text-primary">
              ₹{flat.monthlyRent.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {flat.roomType.toLowerCase()}
            </Badge>
          </div>

          {/* Gender and match badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <span>{getGenderIcon(flat.genderPreference)}</span>
              <span>{flat.genderPreference === 'ANY' ? 'Any' : flat.genderPreference.toLowerCase()}</span>
            </Badge>
            {matchPercentage && (
              <Badge className="bg-accent text-accent-foreground text-xs">
                {matchPercentage}% match
              </Badge>
            )}
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 flex-wrap">
            {displayAmenities.map((amenity) => {
              const IconComponent = amenityIcons[amenity];
              return IconComponent ? (
                <div key={amenity} className="flex items-center gap-1">
                  <IconComponent className="h-3 w-3 text-muted-foreground" />
                </div>
              ) : null;
            })}
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">+{remainingCount}</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {flat.postedBy?.name?.[0] || flat.postedByEmail[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {flat.postedBy?.name || flat.postedByEmail}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChat();
                }}
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
              <Button variant="primary" size="sm" className="h-8 px-3">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  );
};