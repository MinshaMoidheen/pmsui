export type UserRole = 'SUPER_ADMIN' | 'BROKER' | 'USER'

export interface IUser {
  mobileNumber?: string; // Optional for social auth users
  role: 'SUPER_ADMIN' | 'BROKER' | 'USER';
  isMobileVerified: boolean;
  isActive: boolean; // Account status (active/inactive)
  createdBy?: string; // User who created (for admin-created users)
  updatedBy?: string; // User who last updated
  isDeleted: {
    status: boolean;
    deletedBy?: string;
    deletedAt?: Date;
  };
  profile: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    bio?: string;
    isVerified?: boolean;
    serviceAreas?: string[]; // e.g. ["Bangalore", "Goa"]
    specialties?: string[]; // e.g. ["Villa", "Apartment"]
    // Job application profile fields
    cv?: string; // URL to CV file
    resume?: string; // URL to resume file
    experience?: {
      years?: number;
      months?: number;
      description?: string;
    };
    education?: {
      degree?: string;
      field?: string;
      institution?: string;
      year?: number;
    };
    skills?: string[];
    currentLocation?: {
      city?: string;
      state?: string;
    };
    expectedSalary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  socialAuth?: {
    googleId?: string;
    facebookId?: string;
    googleEmail?: string;
    facebookEmail?: string;
  };
  lastLogin?: Date;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUsersResponse {
  success: boolean
  message: string
  data: {
    users: IUser[]
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface GetUserByIdResponse {
  success: boolean
  message: string
  data: {
    user: IUser
  }
}

export interface UpdateUserRequest {
  role?: UserRole
  isActive?: boolean
  profile?: IUser['profile']
}

export interface UpdateUserResponse {
  success: boolean
  message: string
  data: IUser
}

export type GetUsersParams = {
  role?: UserRole
  search?: string
  isActive?: string
  page?: number
  limit?: number
}

export interface CreateUserRequest {
  mobileNumber: string
  role?: UserRole
  isActive?: boolean
  profile?: IUser['profile']
}

export interface CreateUserResponse {
  success: boolean
  message: string
  data: {
    user: IUser
  }
}

export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'BROKER', label: 'Broker' },
  { value: 'USER', label: 'User' }
]

