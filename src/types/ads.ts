export type AdType = 'PROPERTY_SALE' | 'PROPERTY_RENT' | 'JOB'
export type AdRequestStatus = 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'CANCELLED'
export type PropertyUserRole = 'LANDLORD' | 'AGENT'

export interface IValidatedInfoItem {
  label: string
  value: string
}

export interface IAdRequest {
  _id: string
  adType: AdType
  title: string
  category?: string // For JOB
  images?: string[] // Extra for JOB
  amenities?: string[] // Flexible list of amenities / offerings
  validatedInfo?: IValidatedInfoItem[] // Flexible key-value validated details
  userRole?: PropertyUserRole // For PROPERTY
  contact: {
    name: string
    email: string
    phone: string
  }
  status: AdRequestStatus
  // Tracking / audit fields
  adminNotes?: string
  contactedAt?: Date
  contactedBy?: string
  resolvedAt?: Date
  resolvedBy?: string
  cancelledAt?: Date
  cancelledBy?: string
  createdBy?: string // User who submitted if logged in
  isDeleted: {
    status: boolean
    deletedBy?: string
    deletedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateAdRequestRequest {
  adType: AdType
  title: string
  category?: string // For JOB
  images?: string[] // Extra for JOB
  amenities?: string[] // Flexible list of amenities / offerings
  validatedInfo?: IValidatedInfoItem[] // Flexible key-value validated details
  userRole?: PropertyUserRole // For PROPERTY
  contact: {
    name: string
    email: string
    phone: string
  }
  status: AdRequestStatus
  adminNotes?: string
}

export interface CreateAdRequestResponse {
  success: boolean
  message: string
  data: {
    adRequest: IAdRequest
  }
}

export interface getAdRequestsResponse {
  success: boolean
  message: string
  data: {
    requests: IAdRequest[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}
