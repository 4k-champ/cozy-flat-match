export interface Flat {
  id: number;
  address: string;
  city: string;
  monthlyRent: number;
  genderPreference: 'MALE' | 'FEMALE' | 'ANY';
  roomType: 'SHARED' | 'PRIVATE';
  availableFrom?: string;
  amenities: string[];
  imageUrls: string[];
  postedByEmail: string;
  postedBy?: {
    name: string;
    email: string;
  };
}

export interface FlatWithMatch {
  flat: Flat;
  matchPercentage: number;
}

export interface PersonalityProfile {
  sleepSchedule: 'LATE_NIGHT' | 'EARLY_TO_BED' | 'FLEXIBLE';
  cleanliness: 'VERY_TIDY' | 'MODERATE' | 'CHILL';
  guestsAllowed: boolean;
  smokingAllowed: boolean;
  petAllowed: boolean;
  alcoholAllowed: boolean;
  nonVegFoodAllowed: boolean;
  lateNightPartyAllowed: boolean;
  choresPreference: 'WASHING' | 'CLEANING' | 'FINANCE_MANAGEMENT' | 'SHARED_ALL' | 'NOT_INTERESTED';
}

export interface FilterCriteria extends PersonalityProfile {
  minRent?: number;
  maxRent?: number;
  city?: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  withUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  flatId?: number;
  messages: ChatMessage[];
  unreadCount: number;
}

export interface ListFlatRequest {
  address: string;
  city: string;
  monthlyRent: string;
  genderPreference: 'MALE' | 'FEMALE' | 'ANY';
  roomType: 'SHARED' | 'PRIVATE';
  amenities: string[];
  imageUrls: string[];
  availableFrom?: string;
  furnishing?: 'SEMI' | 'FULL' | 'NONE';
}

export const SLEEP_SCHEDULE_OPTIONS = [
  { value: 'LATE_NIGHT', label: 'Late Night (11 PM - 2 AM)' },
  { value: 'EARLY_TO_BED', label: 'Early to Bed (9 PM - 11 PM)' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

export const CLEANLINESS_OPTIONS = [
  { value: 'VERY_TIDY', label: 'Very Tidy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'CHILL', label: 'Chill' },
];

export const CHORES_OPTIONS = [
  { value: 'WASHING', label: 'Washing' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'FINANCE_MANAGEMENT', label: 'Finance Management' },
  { value: 'SHARED_ALL', label: 'Share All Chores' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
];

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'ANY', label: 'Any' },
];

export const ROOM_TYPE_OPTIONS = [
  { value: 'SHARED', label: 'Shared' },
  { value: 'PRIVATE', label: 'Private' },
];

export const FURNISHING_OPTIONS = [
  { value: 'SEMI', label: 'Semi Furnished' },
  { value: 'FULL', label: 'Fully Furnished' },
  { value: 'NONE', label: 'Unfurnished' },
];

export const COMMON_AMENITIES = [
  'Fridge',
  'Washing Machine',
  'TV',
  'AC',
  'WiFi',
  'Microwave',
  'Parking',
  'Security',
  'Gym',
  'Swimming Pool',
];

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Noida',
  'Greater Noida',
  'Gurgaon',
  'Faridabad',
  'Ghaziabad',
  'Lucknow',
  'Kanpur',
  'Indore',
  'Bhopal',
  'Surat',
  'Vadodara',
];