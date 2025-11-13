'use server';

import connectDB from '@/config/database';
import Property from '@/models/Property';
import { revalidatePath } from 'next/cache';
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

interface PlainProperty extends Omit<PropertyDocument, '_id' | 'owner' | 'createdAt' | 'updatedAt'> {
  _id: string;
  owner: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Convert MongoDB property document to plain object
 */
function convertToPlainProperty(property: any): PlainProperty {
  return {
    ...property,
    _id: property._id.toString(),
    owner: property.owner.toString(),
    createdAt: property.createdAt?.toString(),
    updatedAt: property.updatedAt?.toString(),
  };
}

/**
 * Fetch all properties from the database
 * @returns Object containing properties array and total count
 */
export async function fetchProperties() {
  try {
    await connectDB();

    const properties = await Property.find({})
      .lean()
      .sort({ createdAt: -1 });

    // Convert MongoDB documents to plain objects
    const plainProperties = properties.map((property) => convertToPlainProperty(property));

    return {
      properties: plainProperties,
      total: plainProperties.length,
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      properties: [],
      total: 0,
    };
  }
}

/**
 * Fetch a single property by ID
 * @param id - Property ID
 * @returns Property object or null
 */
export async function fetchPropertyById(id: string) {
  try {
    await connectDB();

    const property = await Property.findById(id).lean();

    if (!property) {
      return null;
    }

    // Convert MongoDB document to plain object
    return convertToPlainProperty(property);
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    return null;
  }
}

/**
 * Fetch featured properties
 * @param limit - Maximum number of properties to return
 * @returns Object containing featured properties array
 */
export async function fetchFeaturedProperties(limit: number = 3) {
  try {
    await connectDB();

    const properties = await Property.find({ is_featured: true })
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit);

    const plainProperties = properties.map((property) => convertToPlainProperty(property));

    return {
      properties: plainProperties,
      total: plainProperties.length,
    };
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return {
      properties: [],
      total: 0,
    };
  }
}

/**
 * Fetch properties by owner ID
 * @param ownerId - Owner's user ID
 * @returns Object containing properties array
 */
export async function fetchPropertiesByOwner(ownerId: string) {
  try {
    await connectDB();

    const properties = await Property.find({ owner: ownerId })
      .lean()
      .sort({ createdAt: -1 });

    const plainProperties = properties.map((property) => convertToPlainProperty(property));

    return {
      properties: plainProperties,
      total: plainProperties.length,
    };
  } catch (error) {
    console.error(`Error fetching properties for owner ${ownerId}:`, error);
    return {
      properties: [],
      total: 0,
    };
  }
}

/**
 * Search properties by location and type
 * @param searchParams - Search parameters (location, propertyType)
 * @returns Object containing matching properties array
 */
export async function searchProperties(searchParams: {
  location?: string;
  propertyType?: string;
}) {
  try {
    await connectDB();

    const { location, propertyType } = searchParams;
    const query: any = {};

    if (location) {
      const locationPattern = new RegExp(location, 'i');
      query.$or = [
        { 'location.street': locationPattern },
        { 'location.city': locationPattern },
        { 'location.state': locationPattern },
        { 'location.zipcode': locationPattern },
      ];
    }

    if (propertyType && propertyType !== 'All') {
      query.type = propertyType;
    }

    const properties = await Property.find(query)
      .lean()
      .sort({ createdAt: -1 });

    const plainProperties = properties.map((property) => convertToPlainProperty(property));

    return {
      properties: plainProperties,
      total: plainProperties.length,
    };
  } catch (error) {
    console.error('Error searching properties:', error);
    return {
      properties: [],
      total: 0,
    };
  }
}

/**
 * Delete a property by ID
 * @param propertyId - Property ID to delete
 * @returns Success status
 */
export async function deleteProperty(propertyId: string) {
  try {
    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    await property.deleteOne();
    
    revalidatePath('/properties');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error(`Error deleting property ${propertyId}:`, error);
    return { success: false, error: 'Failed to delete property' };
  }
}

/**
 * Toggle featured status of a property
 * @param propertyId - Property ID
 * @returns Updated property or null
 */
export async function toggleFeaturedProperty(propertyId: string) {
  try {
    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) {
      return null;
    }

    property.is_featured = !property.is_featured;
    await property.save();

    revalidatePath('/properties');
    revalidatePath('/');

    return convertToPlainProperty(property.toObject());
  } catch (error) {
    console.error(`Error toggling featured status for property ${propertyId}:`, error);
    return null;
  }
}