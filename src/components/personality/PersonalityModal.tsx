import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import { 
  PersonalityProfile, 
  SLEEP_SCHEDULE_OPTIONS, 
  CLEANLINESS_OPTIONS, 
  CHORES_OPTIONS 
} from '@/types/flatfit';

const personalitySchema = z.object({
  sleepSchedule: z.enum(['LATE_NIGHT', 'EARLY_TO_BED', 'FLEXIBLE']),
  cleanliness: z.enum(['VERY_TIDY', 'MODERATE', 'CHILL']),
  guestsAllowed: z.boolean(),
  smokingAllowed: z.boolean(),
  petAllowed: z.boolean(),
  alcoholAllowed: z.boolean(),
  nonVegFoodAllowed: z.boolean(),
  lateNightPartyAllowed: z.boolean(),
  choresPreference: z.enum(['WASHING', 'CLEANING', 'FINANCE_MANAGEMENT', 'SHARED_ALL', 'NOT_INTERESTED']),
});

type PersonalityFormData = z.infer<typeof personalitySchema>;

interface PersonalityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export const PersonalityModal = ({ open, onOpenChange, onSave }: PersonalityModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PersonalityFormData>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      sleepSchedule: 'FLEXIBLE',
      cleanliness: 'MODERATE',
      guestsAllowed: true,
      smokingAllowed: false,
      petAllowed: false,
      alcoholAllowed: false,
      nonVegFoodAllowed: false,
      lateNightPartyAllowed: true,
      choresPreference: 'SHARED_ALL',
    },
  });

  useEffect(() => {
    const fetchPersonality = async () => {
      if (!open || !auth.isAuthenticated()) return;

      try {
        const response = await auth.fetchWithAuth('/personalityProfile/fetchUserPersonality');
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            form.reset(data);
          }
        }
      } catch (error) {
        console.error('Error fetching personality profile:', error);
      }
    };

    fetchPersonality();
  }, [open, form]);

  const onSubmit = async (data: PersonalityFormData) => {
    if (!auth.isAuthenticated()) {
      toast({
        title: 'Authentication required',
        description: 'Please login to save your personality profile.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await auth.fetchWithAuth('/personalityProfile/saveUserPersonality', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Profile saved!',
          description: 'Your personality profile has been updated successfully.',
        });
        onOpenChange(false);
        onSave?.();
      } else {
        throw new Error('Failed to save personality profile');
      }
    } catch (error) {
      console.error('Error saving personality profile:', error);
      toast({
        title: 'Save failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personality Assessment</DialogTitle>
          <DialogDescription>
            Help us understand your lifestyle preferences to find compatible flatmates
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sleep Schedule */}
              <FormField
                control={form.control}
                name="sleepSchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Schedule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SLEEP_SCHEDULE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cleanliness */}
              <FormField
                control={form.control}
                name="cleanliness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleanliness Standards</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLEANLINESS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chores Preference */}
              <FormField
                control={form.control}
                name="choresPreference"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Household Chores Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CHORES_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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

            {/* Lifestyle Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lifestyle Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestsAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Guests Allowed</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Comfortable with flatmates having guests over
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lateNightPartyAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Late Night Gatherings</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Okay with occasional late night parties or gatherings
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smokingAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Smoking Allowed</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Comfortable with smoking in common areas
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="petAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pets Allowed</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Okay with flatmates having pets
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alcoholAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Alcohol Consumption</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Comfortable with alcohol consumption at home
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nonVegFoodAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Non-Vegetarian Food</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Okay with cooking/storing non-veg food
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};