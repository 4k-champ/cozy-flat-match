import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FilterCriteria,
  SLEEP_SCHEDULE_OPTIONS, 
  CLEANLINESS_OPTIONS, 
  CHORES_OPTIONS,
  INDIAN_CITIES 
} from '@/types/flatfit';
import { X } from 'lucide-react';

const filterSchema = z.object({
  sleepSchedule: z.enum(['LATE_NIGHT', 'EARLY_TO_BED', 'FLEXIBLE']).optional(),
  cleanliness: z.enum(['VERY_TIDY', 'MODERATE', 'CHILL']).optional(),
  guestsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  petAllowed: z.boolean().optional(),
  alcoholAllowed: z.boolean().optional(),
  nonVegFoodAllowed: z.boolean().optional(),
  lateNightPartyAllowed: z.boolean().optional(),
  choresPreference: z.enum(['WASHING', 'CLEANING', 'FINANCE_MANAGEMENT', 'SHARED_ALL', 'NOT_INTERESTED']).optional(),
  minRent: z.number().optional(),
  maxRent: z.number().optional(),
  city: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FlatFiltersProps {
  onSearch: (filters: FilterCriteria) => void;
  selectedCity?: string | null;
}

export const FlatFilters = ({ onSearch, selectedCity }: FlatFiltersProps) => {
  const [priceRange, setPriceRange] = useState([5000, 50000]);
  
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      city: selectedCity || undefined,
      minRent: 5000,
      maxRent: 50000,
    },
  });

  const handleSearch = (data: FilterFormData) => {
    const filters: FilterCriteria = {
      ...data,
      minRent: priceRange[0],
      maxRent: priceRange[1],
    } as FilterCriteria;

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof FilterCriteria] === undefined) {
        delete filters[key as keyof FilterCriteria];
      }
    });

    onSearch(filters);
  };

  const clearFilters = () => {
    form.reset({
      city: selectedCity || undefined,
      minRent: 5000,
      maxRent: 50000,
    });
    setPriceRange([5000, 50000]);
  };

  const hasActiveFilters = () => {
    const values = form.getValues();
    return Object.values(values).some(value => 
      value !== undefined && value !== false
    ) || priceRange[0] !== 5000 || priceRange[1] !== 50000;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Manual Filters</h3>
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
          {/* City */}
          {!selectedCity && (
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any city" />
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
                </FormItem>
              )}
            />
          )}

          {selectedCity && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                📍 {selectedCity}
              </Badge>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-3">
            <FormLabel>Price Range</FormLabel>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100000}
                min={1500}
                step={1000}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Sleep Schedule */}
          <FormField
            control={form.control}
            name="sleepSchedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sleep Schedule</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Any schedule" />
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
              </FormItem>
            )}
          />

          {/* Cleanliness */}
          <FormField
            control={form.control}
            name="cleanliness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleanliness</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
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
              </FormItem>
            )}
          />

          {/* Chores Preference */}
          <FormField
            control={form.control}
            name="choresPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chores Preference</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Any preference" />
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
              </FormItem>
            )}
          />

          {/* Lifestyle Preferences */}
          <div className="space-y-3">
            <FormLabel>Lifestyle Preferences</FormLabel>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="guestsAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Guests allowed
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="petAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Pets allowed
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smokingAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Smoking allowed
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alcoholAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Alcohol allowed
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nonVegFoodAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Non-veg food allowed
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lateNightPartyAllowed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Late night parties allowed
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Apply Filters
          </Button>
        </form>
      </Form>
    </div>
  );
};