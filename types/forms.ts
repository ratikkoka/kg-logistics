// Form data types for multi-step wizard

export interface ContactInformation {
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
}

export interface VehicleInformation {
  vin?: string;
  year: string;
  make: string;
  model: string;
  transportType: 'enclosed' | 'open' | 'both';
}

export interface AddressInformation {
  pickupDate: string | Date;
  dropoffDate?: string | Date;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffState: string;
  dropoffZip: string;
}

export interface ShippingQuoteFormData
  extends ContactInformation,
    VehicleInformation,
    AddressInformation {}

export interface ContactFormData {
  contactName: string;
  contactEmail?: string;
  contactTel?: string;
  contactType: 'text' | 'email';
  contactMessage: string;
}
