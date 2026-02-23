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
  _id: string
  type: PropertyType // SALE or RENT
  category: PropertyCategory
  title: string
  description: string
  location: {
    address: string
    city: string
    state: string
    pincode?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  price: number
  priceUnit?: string // e.g., 'Lakhs', 'Crores', 'per month'
  area: {
    value: number
    unit: string // 'sqft', 'sqm', 'sqyd'
  }
  // Flexible fields stored as key-value pairs
  flexibleFields: {
    [key: string]: any // e.g., bedrooms, bathrooms, floors, parking, etc.
  }
  // Flexible amenities list (e.g. "Free Wifi", "Air conditioning")
  amenities: string[]
  // Flexible validated info key-value pairs (e.g. Developer, Ownership, Usage)
  validatedInfo: {
    label: string
    value: string
  }[]
  // Users who bookmarked this property
  bookmarks: string[]
  images: string[] // URLs to images
  contact: {
    name: string
    mobileNumber: string
    email?: string
    whatsappNumber: string
  }
  postedBy: string // User who posted
  createdBy: string // User who created
  updatedBy?: string // User who last updated
  isDeleted: {
    status: boolean
    deletedBy?: string
    deletedAt?: Date
  }
  isFeatured: boolean
  views: number
  averageRating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface getPropertiesResponse {
  success: boolean
  message: string
  data: {
    properties: IProperty[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface getPropertyByIdResponse {
  success: boolean
  message: string
  data: {
    property: IProperty
  }
}

export interface createPropertyRequest {
  type: PropertyType
  category: PropertyCategory
  title: string
  description: string
  location: {
    address: string
    city: string
    state: string
    pincode?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  price: number
  priceUnit?: string
  area: {
    value: number
    unit: string
  }
  flexibleFields: {
    [key: string]: any
  }
  amenities: string[]
  validatedInfo: {
    label: string
    value: string
  }[]
  images: string[]
  contact: {
    name: string
    mobileNumber: string
    email?: string
    whatsappNumber: string
  }
}

export interface createPropertyResponse {
  success: boolean
  message: string
  data: IProperty
}
