import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import { 
  ListFlatRequest, 
  GENDER_OPTIONS, 
  ROOM_TYPE_OPTIONS, 
  FURNISHING_OPTIONS,
  COMMON_AMENITIES,
  INDIAN_CITIES 
} from '@/types/flatfit';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Plus, Home } from 'lucide-react';

const listFlatSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(1, 'Please select a city'),
  monthlyRent: z.number().min(1000, 'Rent must be at least ₹1,000'),
  genderPreference: z.enum(['MALE', 'FEMALE', 'ANY']),
  roomType: z.enum(['SHARED', 'PRIVATE']),
  furnishing: z.enum(['SEMI', 'FULL', 'NONE']).optional(),
  availableFrom: z.date().optional(),
  amenities: z.array(z.string()).min(1, 'Please select at least one amenity'),
});

type ListFlatFormData = z.infer<typeof listFlatSchema>;

const ListNewFlat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ListFlatFormData>({
    resolver: zodResolver(listFlatSchema),
    defaultValues: {
      address: '',
      city: '',
      monthlyRent: 15000,
      genderPreference: 'ANY',
      roomType: 'PRIVATE',
      furnishing: 'SEMI',
      amenities: ['WiFi'],
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload these to a service like Cloudinary
    // For now, we'll use placeholder URLs
    const newImageUrls = Array.from(files).map((file, index) => 
      `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80&${index}`
    );
    
    setImageUrls(prev => [...prev, ...newImageUrls]);
    toast({
      title: 'Images uploaded',
      description: `${files.length} image(s) added successfully.`,
    });
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    
    const currentAmenities = form.getValues('amenities');
    if (!currentAmenities.includes(customAmenity.trim())) {
      form.setValue('amenities', [...currentAmenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    const currentAmenities = form.getValues('amenities');
    form.setValue('amenities', currentAmenities.filter(a => a !== amenity));
  };

  const onSubmit = async (data: ListFlatFormData) => {
    if (!auth.isAuthenticated()) {
      toast({
        title: 'Authentication required',
        description: 'Please login to list a flat.',
        variant: 'destructive',
      });
      return;
    }

    if (imageUrls.length === 0) {
      toast({
        title: 'Images required',
        description: 'Please upload at least one image of your flat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const listFlatData: ListFlatRequest = {
        address: data.address,
        city: data.city,
        monthlyRent: data.monthlyRent.toString(),
        genderPreference: data.genderPreference,
        roomType: data.roomType,
        amenities: data.amenities,
        imageUrls: imageUrls,
        furnishing: data.furnishing,
        availableFrom: data.availableFrom?.toISOString(),
      };

      const response = await auth.fetchWithAuth('/flat/listFlat', {
        method: 'POST',
        body: JSON.stringify(listFlatData),
      });

      if (response.ok) {
        const createdFlat = await response.json();
        toast({
          title: 'Flat listed successfully!',
          description: 'Your flat is now live and visible to potential flatmates.',
        });
        navigate('/flats');
      } else {
        throw new Error('Failed to list flat');
      }
    } catch (error) {
      console.error('Error listing flat:', error);
      toast({
        title: 'Listing failed',
        description: 'Please try again. Make sure all required fields are filled.',
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
            <p className="text-muted-foreground">Please login to list a flat.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full mb-4">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">List Your Flat</h1>
            <p className="text-muted-foreground">
              Find the perfect flatmate by listing your space on FlatFit
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flat Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter full address with landmarks"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select city" />
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

                      <FormField
                        control={form.control}
                        name="monthlyRent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Rent (₹) *</FormLabel>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="genderPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender Preference *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {GENDER_OPTIONS.map((option) => (
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

                      <FormField
                        control={form.control}
                        name="roomType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ROOM_TYPE_OPTIONS.map((option) => (
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

                      <FormField
                        control={form.control}
                        name="furnishing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Furnishing</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FURNISHING_OPTIONS.map((option) => (
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

                    <FormField
                      control={form.control}
                      name="availableFrom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Available From</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Select date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amenities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amenities *</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {COMMON_AMENITIES.map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                  id={amenity}
                                  checked={field.value?.includes(amenity)}
                                  onCheckedChange={(checked) => {
                                    const currentAmenities = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentAmenities, amenity]);
                                    } else {
                                      field.onChange(currentAmenities.filter(a => a !== amenity));
                                    }
                                  }}
                                />
                                <label htmlFor={amenity} className="text-sm font-medium">
                                  {amenity}
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          {/* Custom Amenity Input */}
                          <div className="flex gap-2 mt-3">
                            <Input
                              value={customAmenity}
                              onChange={(e) => setCustomAmenity(e.target.value)}
                              placeholder="Add custom amenity"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                            />
                            <Button type="button" variant="outline" onClick={addCustomAmenity}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Selected Amenities */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {field.value?.map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="pr-1">
                                {amenity}
                                <button
                                  type="button"
                                  onClick={() => removeAmenity(amenity)}
                                  className="ml-1 h-3 w-3 flex items-center justify-center hover:bg-destructive/20 rounded-full"
                                >
                                  <X className="h-2 w-2" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <FormLabel>Images *</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Flat image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload high-quality images to attract more potential flatmates
                    </p>
                  </div>

                  {/* Submit */}
                  <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Listing your flat...' : 'List My Flat'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListNewFlat;