// Subscription plan (from GET /subscriptions/plans)
export type SubscriptionType = 'BASIC' | 'PREMIUM' | 'ENTERPRISE'

export interface ISubscriptionPlanFeatures {
  ensuredInterviewCalls: boolean
  priorityApplication: boolean
  unlimitedApplications: boolean
  cvVisibility: boolean
  featuredProfile: boolean
  directEmployerContact: boolean
  interviewScheduling: boolean
  analytics: boolean
  support: string
}

export interface ISubscriptionPlan {
  _id: string
  name: string
  type: SubscriptionType
  description: string
  price: number
  currency: string
  duration: number
  features: ISubscriptionPlanFeatures
  isActive: boolean
}

// User subscription (from GET /subscriptions/my or /all)
export type UserSubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_PAYMENT'

export interface IUserSubscription {
  _id: string
  user?: { _id: string; profile?: { firstName?: string; lastName?: string }; mobileNumber?: string }
  subscriptionPlan: ISubscriptionPlan | string
  subscriptionType: SubscriptionType
  status: UserSubscriptionStatus
  startDate: string
  endDate: string
  autoRenew: boolean
  paymentAmount: number
  paymentCurrency: string
  paymentDate?: string
  cancelledAt?: string
  cancellationReason?: string
  interviewCallsUsed?: number
  applicationsCount?: number
  createdAt: string
  updatedAt: string
}

// Active subscription benefits (from GET /subscriptions)
export interface ISubscriptionBenefits {
  type: SubscriptionType
  daysRemaining: number
  interviewCallsUsed: number
  applicationsCount: number
  endDate: string
  features?: ISubscriptionPlanFeatures
}

// API responses
export interface GetPlansResponse {
  success: boolean
  data: { plans: ISubscriptionPlan[] }
  message?: string
}

export interface GetUserSubscriptionResponse {
  success: boolean
  data: { subscription: ISubscriptionBenefits | null }
  message?: string
}

export interface GetSubscriptionsResponse {
  success: boolean
  data: {
    subscriptions: IUserSubscription[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }
  message?: string
}

export interface GetSubscriptionByIdResponse {
  success: boolean
  data: { subscription: IUserSubscription }
  message?: string
}

export interface CreateSubscriptionRequest {
  planId: string
  paymentId?: string
  paymentAmount?: number
  autoRenew?: boolean
}

export interface CreateSubscriptionResponse {
  success: boolean
  data: { subscription: Partial<IUserSubscription> & { id: string; type: string; daysRemaining?: number; features?: ISubscriptionPlanFeatures } }
  message?: string
}

export interface ActivateSubscriptionRequest {
  subscriptionId: string
  paymentId: string
}

export interface CancelSubscriptionRequest {
  subscriptionId: string
  reason?: string
}

// Query params (backend uses PENDING for filter; DB has PENDING_PAYMENT - we send status as-is)
export type SubscriptionStatusFilter = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'PENDING_PAYMENT'

export interface GetUserSubscriptionsParams {
  status?: SubscriptionStatusFilter
  page?: number
  limit?: number
}

export interface GetAllSubscriptionsParams {
  status?: SubscriptionStatusFilter
  subscriptionType?: SubscriptionType
  page?: number
  limit?: number
}

export const SUBSCRIPTION_STATUS_OPTIONS: { value: UserSubscriptionStatus | 'PENDING'; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

export const SUBSCRIPTION_TYPE_OPTIONS: { value: SubscriptionType; label: string }[] = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'ENTERPRISE', label: 'Enterprise' }
]
