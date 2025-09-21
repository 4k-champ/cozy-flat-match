import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalityModal } from '@/components/personality/PersonalityModal';
import { auth } from '@/lib/auth';
import { Brain, ArrowRight, CheckCircle, Users, Home } from 'lucide-react';

const PersonalityTest = () => {
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [hasPersonality, setHasPersonality] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPersonalityProfile = async () => {
      if (!auth.isAuthenticated()) {
        navigate('/');
        return;
      }

      try {
        const response = await auth.fetchWithAuth('/personalityProfile/fetchUserPersonality');
        if (response.ok) {
          const data = await response.json();
          setHasPersonality(!!data && Object.keys(data).length > 0);
        }
      } catch (error) {
        console.error('Error checking personality profile:', error);
      }
    };

    checkPersonalityProfile();
  }, [navigate]);

  const handleStartTest = () => {
    setShowPersonalityModal(true);
  };

  const handlePersonalitySaved = () => {
    setHasPersonality(true);
    setShowPersonalityModal(false);
  };

  const handleFindFlats = () => {
    navigate('/flats');
  };

  if (!auth.isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Personality Assessment
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us understand your lifestyle preferences to find the perfect flatmate matches
            </p>
          </div>

          {!hasPersonality ? (
            <>
              {/* Why Take the Test */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Why take the personality test?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Better Matches</h3>
                      <p className="text-sm text-muted-foreground">
                        Find flatmates who share similar lifestyles and habits
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Harmonious Living</h3>
                      <p className="text-sm text-muted-foreground">
                        Reduce conflicts by matching compatible personalities
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Higher Success</h3>
                      <p className="text-sm text-muted-foreground">
                        Increased satisfaction in flatmate relationships
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Overview */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">What we'll assess:</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Sleep schedule preferences</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Cleanliness standards</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Guest and party policies</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Lifestyle choices</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Household chore preferences</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">Pet and smoking policies</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Start Test Button */}
              <div className="text-center">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleStartTest}
                  className="text-lg px-8"
                >
                  Start Personality Test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Takes about 2-3 minutes to complete
                </p>
              </div>
            </>
          ) : (
            /* Test Completed */
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Personality Profile Complete!
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your personality profile has been saved. You can now find flats with compatible flatmates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleFindFlats}
                  >
                    Find Compatible Flats
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartTest}
                  >
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PersonalityModal
        open={showPersonalityModal}
        onOpenChange={setShowPersonalityModal}
        onSave={handlePersonalitySaved}
      />
    </div>
  );
};

export default PersonalityTest;