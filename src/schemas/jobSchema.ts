import { z } from 'zod'
import { EMPLOYMENT_TYPE_OPTIONS } from '@/types/job'

const employmentTypeValues = EMPLOYMENT_TYPE_OPTIONS.map(et => et.value) as [string, ...string[]]

export const jobFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description too long'),
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
  employmentType: z.enum(employmentTypeValues),
  location: z.object({
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    address: z.string().max(500).optional().default('')
  }),
  salary: z
    .object({
      min: z.coerce.number().min(0, 'Minimum salary must be positive').optional(),
      max: z.coerce.number().min(0, 'Maximum salary must be positive').optional(),
      currency: z.string().default('INR'),
      period: z.string().default('per month')
    })
    .optional(),
  requirements: z.array(z.string().min(1)).optional().default([]),
  responsibilities: z.array(z.string().min(1)).optional().default([]),
  contact: z.object({
    name: z.string().min(1, 'Contact name is required').max(100),
    mobileNumber: z.string().regex(/^[0-9]{10,15}$/, 'Please enter a valid mobile number'),
    email: z.union([z.string().email('Invalid email'), z.literal('')]).optional().default(''),
    whatsappNumber: z.string().regex(/^[0-9]{10,15}$/, 'Please enter a valid WhatsApp number')
  }),
  expiresAt: z.string().optional()
})

export type JobFormValues = z.infer<typeof jobFormSchema>

