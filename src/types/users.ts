export type UserRole = 'SUPER_ADMIN' | 'BROKER' | 'USER'

export interface UserProfile {
  firstName?: string
  lastName?: string
  profilePicture?: string
}

export interface IUser {
  _id: string
  mobileNumber?: string
  role: UserRole
  isMobileVerified: boolean
  isActive: boolean
  profile?: UserProfile
  createdAt?: string
  updatedAt?: string
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
  profile?: UserProfile
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
  profile?: UserProfile
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

