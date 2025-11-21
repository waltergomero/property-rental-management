'use server';

import connectDB from '@/config/database';
import Property from '@/models/Property';
import { revalidatePath } from 'next/cache';
import {IProperty} from '@/types/property';


/** 
 * add property actions here 
 * */
 export async function addProperty(data: FormData | IProperty) {
  try {
    await connectDB();
    console.log('Form Data Received:', data);

    // Handle both FormData and plain object
    const isFormData = data instanceof FormData;
    
    const amenities = isFormData 
      ? data.getAll('amenities') as string[]
      : data.amenities || [];
      
    const images = isFormData
      ? (data.getAll('images') as string[]).filter((img: string) => img.trim() !== '')
      : data.images || [];
                      
    const newProperty = new Property({
      type: isFormData ? data.get('type') as string : data.type,
      name: isFormData ? data.get('name') as string : data.name,
      description: isFormData ? data.get('description') as string : data.description,
      location: {
        street: isFormData ? data.get('street') as string : data.location.street,
        city: isFormData ? data.get('city') as string : data.location.city,
        state: isFormData ? data.get('state') as string : data.location.state,
        zipcode: isFormData ? data.get('zipcode') as string : data.location.zipcode,
      },
      beds: isFormData ? Number(data.get('bedrooms')) : Number(data.beds),
      baths: isFormData ? Number(data.get('bathrooms')) : Number(data.baths),
      square_feet: isFormData ? Number(data.get('square_feet')) : Number(data.square_feet),
      amenities: amenities,
      rates: {
        nightly: isFormData ? Number(data.get('rate_nightly')) : Number(data.rates.nightly),
        weekly: isFormData ? Number(data.get('rate_weekly')) : Number(data.rates.weekly),
        monthly: isFormData ? Number(data.get('rate_monthly')) : Number(data.rates.monthly),
      },
      seller_info: {
        name: isFormData ? data.get('seller_info.name') : data.seller_info.name,
        email: isFormData ? data.get('seller_info.email') : data.seller_info.email,
        phone: isFormData ? data.get('seller_info.phone') : data.seller_info.phone,
      },
      owner: isFormData ? data.get('ownerid') as string : data.owner,
    });
    console.log('New Property to be saved:', newProperty);

    //await newProperty.save();
    revalidatePath('/properties');
    revalidatePath('/');
  }
  catch (error) {
    console.error('Error adding property:', error);
  }
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
    const plainProperties = properties.map((property) => (property));
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

    return property || null;

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