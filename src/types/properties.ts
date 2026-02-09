export type PropertyType = 'SALE' | 'RENT'

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'SALE', label: 'Sale' },
  { value: 'RENT', label: 'Rent' }
]

export type PropertyCategory = 
  | 'HOUSE_VILLA' 
  | 'APARTMENT' 
  | 'STUDIO' 
  | 'PG' 
  | 'COMMERCIAL_BUILDING' 
  | 'COMMERCIAL_PROJECT'
| 'COWORKING_SPACE'
| 'SHOP_ROOM'

export const PROPERTY_CATEGORIES: { value: PropertyCategory; label: string }[] = [
  { value: 'HOUSE_VILLA', label: 'House/Villa' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'PG', label: 'PG' },
  { value: 'COMMERCIAL_BUILDING', label: 'Commercial Building' },
  { value: 'COMMERCIAL_PROJECT', label: 'Commercial Project' },
  { value: 'COWORKING_SPACE', label: 'Coworking Space' },
  { value: 'SHOP_ROOM', label: 'Shop/Room' }
]

export const AREA_UNITS = ['sqft', 'sqm', 'acre']

export interface IProperty {
    _id: string;
  type: PropertyType; 
  category: PropertyCategory;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price: number;
  priceUnit?: string;
  area: {
    value: number;
    unit: string; 
  };

  flexibleFields: {
    [key: string]: any; 
  };
  images: string[];
  contact: {
    name: string;
    mobileNumber: string;
    email?: string;
    whatsappNumber: string;
  };
  postedBy: string; 
  createdBy:string;
  updatedBy?: string; 
  isDeleted: {
    status: boolean;
    deletedBy?: string;
    deletedAt?: Date;
  };
  isFeatured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface getPropertiesResponse {
    success: boolean;
    message: string;
    data:{
        properties: IProperty[];
        pagination: {
            page: number,
            limit: number,
            total: number,
            pages: number,
          },
    };
}

export interface getPropertyByIdResponse {
    success: boolean;
    message: string;
    data: {
        property: IProperty;
    };
}

export interface createPropertyRequest {
    type: PropertyType;
    category: PropertyCategory;
    title: string;
    description: string;
    location: {
        address: string;
        city: string;
        state: string;
        pincode?: string;
    };
    price: number;
    priceUnit?: string;
    area: {
        value: number;
        unit: string;
    };
    flexibleFields: {
        [key: string]: any;
    };
    images: string[];
    contact: {
        name: string;
        mobileNumber: string;
        email?: string;
        whatsappNumber: string;
    };
}

export interface createPropertyResponse {
    success: boolean;
    message: string;
    data: IProperty;
}
