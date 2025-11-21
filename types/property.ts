import { Types } from 'mongoose';

export interface IProperty {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  type: string;
  name: string;
  description?: string;
  images: string[];
  amenities: string[];
  beds: number;
  baths: number;
  square_feet: number;
  rates: {
    nightly?: number;
    weekly?: number;
    monthly?: number;
  };
  location: {
    street: string;
    zipcode: string;
    city: string;
    state: string;
  };
  seller_info: {
    name?: string;
    email?: string;
    phone?: string;
  };
  is_featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}



// // Type definitions
// interface PropertyLocation {
//   street?: string;
//   city?: string;
//   state?: string;
//   zipcode?: string;
// }

// interface PropertyRates {
//   nightly?: number;
//   weekly?: number;
//   monthly?: number;
// }

// interface SellerInfo {
//   name?: string;
//   email?: string;
//   phone?: string;
// }

// interface PropertyDocument {
//   _id: Types.ObjectId;
//   owner: Types.ObjectId;
//   name: string;
//   type: string;
//   description?: string;
//   location: PropertyLocation;
//   beds: number;
//   baths: number;
//   square_feet: number;
//   amenities?: string[];
//   rates: PropertyRates;
//   seller_info?: SellerInfo;
//   images?: string[];
//   is_featured: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
