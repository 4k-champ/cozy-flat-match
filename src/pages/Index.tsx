import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Brain, MapPin, Home, Plus, Heart, Users } from 'lucide-react';
import { auth } from '@/lib/auth';
import { LoginModal } from '@/components/auth/LoginModal';
import { INDIAN_CITIES } from '@/types/flatfit';
import heroImage from '@/assets/hero-home.jpg';

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();

  const handlePersonalityTest = () => {
    if (isAuthenticated) {
      navigate('/personality-test');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleCitySelect = (city: string) => {
    setShowCityModal(false);
    navigate(`/flats?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find your perfect
            <span className="block bg-gradient-warm bg-clip-text text-transparent">
              flatmate match
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Take a personality test to find flats that suit your lifestyle
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="xl"
              onClick={handlePersonalityTest}
              className="w-full sm:w-auto"
            >
              <Brain className="mr-2 h-5 w-5" />
              Take Personality Test
            </Button>
            
            <Button
              variant="outline"
              size="xl"
              onClick={() => setShowCityModal(true)}
              className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Locate flats near you
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why choose FlatFit?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our personality-based matching ensures you find flatmates who truly complement your lifestyle
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-card">
              <CardContent className="pt-8">
                <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Personality Matching</h3>
                <p className="text-muted-foreground">
                  Our advanced algorithm matches you based on sleep schedules, cleanliness, and lifestyle preferences
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-none shadow-card">
              <CardContent className="pt-8">
                <div className="h-12 w-12 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Profiles</h3>
                <p className="text-muted-foreground">
                  All users go through our verification process to ensure authentic and trustworthy connections
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-none shadow-card">
              <CardContent className="pt-8">
                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Local Focus</h3>
                <p className="text-muted-foreground">
                  Find flats and flatmates in your preferred neighborhoods across major Indian cities
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="group hover:shadow-card transition-smooth cursor-pointer border-none overflow-hidden">
              <Link to="/flats">
                <CardContent className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary-accent/10">
                  <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">Find a Flat</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse through hundreds of verified flat listings with personality-matched flatmates
                  </p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Start exploring
                  </Badge>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="group hover:shadow-card transition-smooth cursor-pointer border-none overflow-hidden">
              <Link to="/list-new-flat">
                <CardContent className="p-8 text-center bg-gradient-to-br from-secondary/20 to-accent/10">
                  <Plus className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">List a Flat</h3>
                  <p className="text-muted-foreground mb-4">
                    Post your flat listing and find the perfect flatmate through our matching system
                  </p>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                    List now
                  </Badge>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* City Selection Modal */}
      <Dialog open={showCityModal} onOpenChange={setShowCityModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your City</DialogTitle>
            <DialogDescription>
              Choose a city to find available flats in your area
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
            {INDIAN_CITIES.map((city) => (
              <Button
                key={city}
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => handleCitySelect(city)}
              >
                {city}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </div>
  );
};

export default Index;