import { z } from 'zod'
import { INTERVIEW_STATUS, INTERVIEW_TYPES } from '@/types/interviewSchedule'

const interviewStatusValues = INTERVIEW_STATUS.map(st => st.value) as [string, ...string[]]
const interviewTypeValues = INTERVIEW_TYPES.map(it => it.value) as [string, ...string[]]


export const interviewScheduleFormSchema = z.object({
    jobPostId: z.string().min(1, 'Job Post is required'),
    applicantId: z.string().min(1, 'Applicant is required'),
  
    interviewType: z.enum(interviewTypeValues),
  
    scheduledAt: z
      .date()
      .refine(date => date > new Date(), {
        message: 'Interview must be scheduled in the future',
      }),
  
    duration: z
      .number()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours'),
  
    location: z.string().optional(),
  
    meetingLink: z
      .string()
      .url('Meeting link must be a valid URL')
      .optional(),
  
    contactNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10 digit mobile number')
      .optional(),
  
    instructions: z.string().max(1000, 'Instructions too long').optional(),
  
    status: z.enum(interviewStatusValues),
  
    notes: z.string().max(2000, 'Notes too long').optional(),
  
    paymentRequired: z.boolean(),
  
    paymentAmount: z
      .number()
      .min(1, 'Payment amount must be greater than 0')
      .optional(),
  
    paymentStatus: z.enum(['PENDING', 'PAID', 'REFUNDED']).optional(),
  
    paymentId: z.string().optional(),
  })
  .refine(
    data => !data.paymentRequired || !!data.paymentAmount,
    {
      message: 'Payment amount is required when payment is enabled',
      path: ['paymentAmount'],
    }
  )
  .refine(
    data => {
      if (data.interviewType === 'ONLINE') return !!data.meetingLink
      if (data.interviewType === 'OFFLINE') return !!data.location
      return true
    },
    {
      message: 'Location is required for offline interviews and meeting link for online interviews',
      path: ['location'],
    }
  )

  export type InterviewScheduleFormValues = z.infer<typeof interviewScheduleFormSchema>