// Type definitions for Gig World Today

export interface Platform {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  applyUrl?: string;
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
      counties?: { county: string; state: string }[];
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
  rating?: number;
  
  // Work details
  deliveryType: 'on_demand' | 'scheduled' | 'both';
  setupRequired: boolean;
  
  // Metadata
  lastUpdated: string;
  dataSources: string[];
  verificationStatus: 'verified' | 'community' | 'needs_verification';
  // Optional fields for special platform statuses and UI
  usesThirdPartyDelivery?: boolean;
  deliveryPartners?: string[];
  driverStatus?: string;
  mergedWith?: string;
  redirectMessage?: string;
  instantPayAvailable?: boolean;
  instantPayLimit?: string;
  proTierProgram?: string;
  proTierBenefits?: string;
  notes?: string;
  // Add these for compatibility with autosuggestions/search
  cities?: string[];
  locations?: string[];
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
  search?: string;
  vehicles?: string[];
  categories?: string[];
  countries?: string[];
  statuses?: string[];
  deliveryType?: string;
  availability?: string;
}
