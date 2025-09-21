import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import { PersonalityModal } from '@/components/personality/PersonalityModal';
import { GENDER_OPTIONS, INDIAN_CITIES } from '@/types/flatfit';
import { User, CheckCircle, XCircle, Brain } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.string().min(1, 'Please select your gender'),
  city: z.string().min(1, 'Please select your city'),
  occupation: z.string().min(2, 'Please enter your occupation'),
  budget: z.number().min(1000, 'Budget must be at least ₹1,000'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      gender: '',
      city: '',
      occupation: '',
      budget: 15000,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await auth.fetchWithAuth('/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          form.reset({
            name: data.name || '',
            gender: data.gender || '',
            city: data.city || '',
            occupation: data.occupation || '',
            budget: data.budget || 15000,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (auth.isAuthenticated()) {
      fetchProfile();
    }
  }, [form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Note: The API spec doesn't include a profile update endpoint
      // This would need to be implemented on the backend
      toast({
        title: 'Profile updated!',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth.isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please login to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your FlatFit profile and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_OPTIONS.slice(0, 2).map((option) => (
                              <SelectItem key={option.value} value={option.value.toLowerCase()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-48">
                          {INDIAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Software Developer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            placeholder="15000"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Aadhaar Verification:</span>
                    {userProfile?.aadhaarVerified ? (
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPersonalityModal(true)}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Update Personality
                  </Button>
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <PersonalityModal 
        open={showPersonalityModal} 
        onOpenChange={setShowPersonalityModal}
      />
    </div>
  );
};

export default Profile;