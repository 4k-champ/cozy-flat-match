import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FlatCard } from '@/components/flats/FlatCard';
import { FlatFilters } from '@/components/flats/FlatFilters';
import { FlatDetailsModal } from '@/components/flats/FlatDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import { Flat, FlatWithMatch, FilterCriteria } from '@/types/flatfit';
import { Filter, Grid, List, Brain } from 'lucide-react';

const Flats = () => {
  const [searchParams] = useSearchParams();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [personalityMatches, setPersonalityMatches] = useState<FlatWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [usePersonalityFilter, setUsePersonalityFilter] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  const selectedCity = searchParams.get('city');

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    setIsLoading(true);
    try {
      const response = await auth.fetchWithAuth('/flat/fetchFlats');
      if (response.ok) {
        const data: Flat[] = await response.json();
        let filteredData = data;
        
        // Filter by city if selected
        if (selectedCity) {
          filteredData = data.filter(flat => 
            flat.city.toLowerCase().includes(selectedCity.toLowerCase())
          );
        }
        
        setFlats(filteredData);
      } else {
        throw new Error('Failed to fetch flats');
      }
    } catch (error) {
      console.error('Error fetching flats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load flats. Please try again.',
        variant: 'destructive',
      });
      
      // Mock data for development
      const mockFlats: Flat[] = [
        {
          id: 1,
          address: "Sector 18, Near Metro Station",
          city: selectedCity || "Noida",
          monthlyRent: 15000,
          genderPreference: "ANY",
          roomType: "PRIVATE",
          amenities: ["WiFi", "AC", "Fridge", "Washing Machine"],
          imageUrls: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
          postedByEmail: "user@example.com",
          postedBy: { name: "Rahul Kumar", email: "user@example.com" }
        },
        {
          id: 2,
          address: "Sector 62, IT Hub Area",
          city: selectedCity || "Noida",
          monthlyRent: 18000,
          genderPreference: "MALE",
          roomType: "SHARED",
          amenities: ["WiFi", "Parking", "Security", "Gym"],
          imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
          postedByEmail: "priya@example.com",
          postedBy: { name: "Priya Singh", email: "priya@example.com" }
        }
      ];
      setFlats(mockFlats);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPersonalityMatches = async () => {
    if (!auth.isAuthenticated()) {
      toast({
        title: 'Login Required',
        description: 'Please login to use personality-based matching.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await auth.fetchWithAuth('/flat/personality-matches');
      if (response.ok) {
        const data: FlatWithMatch[] = await response.json();
        setPersonalityMatches(data);
      } else {
        throw new Error('Failed to fetch personality matches');
      }
    } catch (error) {
      console.error('Error fetching personality matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load personality matches. Make sure your personality profile is complete.',
        variant: 'destructive',
      });
      
      // Mock personality matches
      const mockMatches: FlatWithMatch[] = flats.slice(0, 2).map((flat, index) => ({
        flat,
        matchPercentage: [85, 72][index]
      }));
      setPersonalityMatches(mockMatches);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalityToggle = async (enabled: boolean) => {
    setUsePersonalityFilter(enabled);
    if (enabled && personalityMatches.length === 0) {
      await fetchPersonalityMatches();
    }
  };

  const handleFilterSearch = async (filters: FilterCriteria) => {
    setIsLoading(true);
    try {
      const response = await auth.fetchWithAuth('/flat/filter-search', {
        method: 'POST',
        body: JSON.stringify(filters),
      });
      
      if (response.ok) {
        const data: Flat[] = await response.json();
        setFlats(data);
        setUsePersonalityFilter(false);
      } else {
        throw new Error('Failed to search flats');
      }
    } catch (error) {
      console.error('Error searching flats:', error);
      toast({
        title: 'Error',
        description: 'Failed to search flats. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayFlats = usePersonalityFilter ? personalityMatches : flats.map(flat => ({ flat, matchPercentage: 0 }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Personality Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Personality-Based</Label>
                      <p className="text-sm text-muted-foreground">Match by personality profile</p>
                    </div>
                    <Switch
                      checked={usePersonalityFilter}
                      onCheckedChange={handlePersonalityToggle}
                    />
                  </div>

                  {usePersonalityFilter && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Brain className="h-4 w-4" />
                        Showing personality matches
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on your saved personality profile
                      </p>
                    </div>
                  )}

                  {/* Manual Filters */}
                  {!usePersonalityFilter && (
                    <FlatFilters onSearch={handleFilterSearch} selectedCity={selectedCity} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                {selectedCity && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    📍 {selectedCity}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : displayFlats.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No flats found matching your criteria.
                  </p>
                  <Button variant="outline" onClick={fetchFlats}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {displayFlats.map(({ flat, matchPercentage }) => (
                  <FlatCard
                    key={flat.id}
                    flat={flat}
                    matchPercentage={matchPercentage > 0 ? matchPercentage : undefined}
                    onViewDetails={() => setSelectedFlat(flat)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flat Details Modal */}
      {selectedFlat && (
        <FlatDetailsModal
          flat={selectedFlat}
          open={!!selectedFlat}
          onOpenChange={(open) => !open && setSelectedFlat(null)}
        />
      )}
    </div>
  );
};

export default Flats;