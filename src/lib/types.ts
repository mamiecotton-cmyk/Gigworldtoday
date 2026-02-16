// Type definitions for Gig World Today

export interface Platform {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  iosAppUrl?: string;
  androidAppUrl?: string;
  
  // Classification
  categories: string[];
  
  // Requirements
  minAge: number;
  backgroundCheckRequired: boolean;
  vehicleTypes: string[];
  licenseRequired: boolean;
  insuranceRequired: boolean;
  equipmentNeeded: string[];
  otherRequirements?: string;
  
  // Availability
  countries: string[];
  regions: {
    [country: string]: {
      status: string;
      cities?: string[];
      waitlistStatus: 'open' | 'waitlist' | 'closed' | 'unknown';
    };
  };
  
  // Compensation
  payModel: string;
  estimatedPayMin?: number;
  estimatedPayMax?: number;
  estimatedHourlyMin?: number;
  estimatedHourlyMax?: number;
  tipsAllowed: boolean;
  paymentFrequency: string;
  
  // Work details
  deliveryType: 'on_demand' | 'scheduled' | 'both';
  setupRequired: boolean;
  
  // Metadata
  lastUpdated: string;
  dataSources: string[];
  verificationStatus: 'verified' | 'community' | 'needs_verification';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
}

export interface FilterOptions {
  location?: string;
  categories?: string[];
  waitlistStatus?: ('open' | 'waitlist' | 'closed' | 'unknown')[];
  vehicleTypes?: string[];
  minAge?: number;
  backgroundCheck?: boolean;
}
