import { IJobApplication, IJobPost } from "./job";
import { IUser } from "./users";

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type InterviewType = 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL';

export const INTERVIEW_STATUS: { value: InterviewStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RESCHEDULED', label: 'Rescheduled' }
]

export const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'VIDEO_CALL', label: 'Video Call' },
  { value: 'PHONE_CALL', label: 'Phone Call' }
]

export interface IInterviewSchedule {
    _id: string;
  jobPost: IJobPost | string;
  applicant: IUser | string;
  scheduledBy: string; // Admin who scheduled
  createdBy: string; // User who created
  updatedBy?: string; // User who last updated
  interviewType: InterviewType;
  scheduledAt: Date;
  duration: number; // in minutes
  location?: string; // For in-person interviews
  meetingLink?: string; // For video call interviews
  contactNumber?: string; // For phone call interviews
  instructions?: string;
  status: InterviewStatus;
  notes?: string;
  paymentRequired: boolean;
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentId?: string; // Payment gateway transaction ID
  isDeleted: {
    status: boolean;
    deletedBy?: string;
    deletedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface createInterviewScheduleRequest {
  jobPostId: string;
  applicantId: string;
  interviewType: InterviewType;
  scheduledAt: Date;
  duration: number; 
  location?: string; 
  meetingLink?: string; 
  contactNumber?: string; 
  instructions?: string;
  status: InterviewStatus;
  notes?: string;
  paymentRequired: boolean;
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  paymentId?: string; 
}

export interface createInterViewScheduleResponse {
    success: boolean;
    message: string;
    data: IInterviewSchedule;
}

export interface GetInterviewsResponse {
    success: boolean;
    message: string;
    data: {
        interviews: IInterviewSchedule[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        }
    }
}

export interface getInterviewByIdResponse {
    success: boolean;
    message: string;
    data: {
        interview: IInterviewSchedule
    }
}