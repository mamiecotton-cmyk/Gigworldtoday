// Constants for Gig World Today

export const VEHICLE_TYPES = {
  NONE: 'none',
  BIKE: 'bike',
  CAR: 'car',
  SUV: 'suv',
  VAN: 'van',
} as const;

export const WAITLIST_STATUS = {
  OPEN: 'open',
  WAITLIST: 'waitlist',
  CLOSED: 'closed',
  UNKNOWN: 'unknown',
} as const;

export const DELIVERY_TYPE = {
  ON_DEMAND: 'on_demand',
  SCHEDULED: 'scheduled',
  BOTH: 'both',
} as const;

export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  COMMUNITY: 'community',
  NEEDS_VERIFICATION: 'needs_verification',
} as const;

export const PAY_MODEL = {
  PER_DELIVERY: 'per_delivery',
  HOURLY: 'hourly',
  PER_TASK: 'per_task',
  PER_ORDER: 'per_order',
} as const;

export const PAYMENT_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  INSTANT: 'instant',
  MONTHLY: 'monthly',
} as const;

export const WAITLIST_STATUS_COLORS = {
  open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepting' },
  waitlist: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Waitlist' },
  closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' },
} as const;
