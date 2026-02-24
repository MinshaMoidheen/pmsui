export type ReviewTargetType = 'PROPERTY' | 'JOB' | 'AGENT'

export interface IReview {
    _id: string
  targetType: ReviewTargetType // What is being reviewed
  targetId: string // ID of the Property, JobPost, or User (BROKER)
  owner: string // User who owns the product (postedBy / agent) — for profile aggregation
  reviewer: string // User who wrote the review
  rating: number // 1 to 5
  comment?: string
  isDeleted: {
    status: boolean
    deletedBy?: string
    deletedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface getAllReviewsResponse {
  success: boolean
  message: string
  data: {
    reviews: IReview[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export interface updateReviewResponse {
  success: boolean
  message: string
  data: {
    review: IReview
    productStats: number
  }
}
