import { Types } from 'mongoose';

// Type definitions
interface PropertyLocation {
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

interface PropertyRates {
  nightly?: number;
  weekly?: number;
  monthly?: number;
}

interface SellerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface PropertyDocument {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;
  type: string;
  description?: string;
  location: PropertyLocation;
  beds: number;
  baths: number;
  square_feet: number;
  amenities?: string[];
  rates: PropertyRates;
  seller_info?: SellerInfo;
  images?: string[];
  is_featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlainProperty extends Omit<PropertyDocument, '_id' | 'owner' | 'createdAt' | 'updatedAt'> {
  _id: string;
  owner: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Property {
  _id: string;
  type: string;
  name: string;
  images: string[];
  beds: number;
  baths: number;
  square_feet: number;
  rates: {
    nightly?: number;
    weekly?: number;
    monthly?: number;
  };
  location: {
    city: string;
    state: string;
  };
}
