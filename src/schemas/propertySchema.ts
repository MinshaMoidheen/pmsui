import { z } from 'zod'
import { PROPERTY_TYPES, PROPERTY_CATEGORIES, AREA_UNITS } from '@/types/properties'

const propertyTypeValues = PROPERTY_TYPES.map(pt => pt.value) as [string, ...string[]]
const propertyCategoryValues = PROPERTY_CATEGORIES.map(c => c.value) as [string, ...string[]]
const areaUnitValues = AREA_UNITS as [string, ...string[]]

/** Valid image: base64 data URL or http/https URL */
const imageUrlSchema = z.string().refine(
  val => {
    if (!val?.trim()) return true
    try {
      const parsed = new URL(val)
      return ['http:', 'https:', 'data:'].includes(parsed.protocol)
    } catch {
      return false
    }
  },
  { message: 'Invalid image URL format' }
)

export const propertyFormSchema = z.object({
  type: z.enum(propertyTypeValues),
  category: z.enum(propertyCategoryValues),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000).optional().default(''),
  location: z.object({
    address: z.string().max(500).optional().default(''),
    city: z.string().max(100).optional().default(''),
    state: z.string().max(100).optional().default(''),
    pincode: z.string().max(10).optional().default(''),
    coordinates: z
      .object({
        latitude: z.coerce.number().optional().default(0),
        longitude: z.coerce.number().optional().default(0)
      })
      .optional()
  }),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  priceUnit: z.string().optional().default(''),
  area: z.object({
    value: z.coerce.number().min(0, 'Area must be 0 or greater'),
    unit: z.enum(areaUnitValues)
  }),
  flexibleFields: z.record(z.string(), z.unknown()).optional().default({}),
  amenities: z.array(z.string()).default([]),
  validatedInfo: z
    .array(
      z.object({
        label: z.string(),
        value: z.string().optional().default('')
      })
    )
    .default([]),
  images: z.array(imageUrlSchema).default([]),
  contact: z.object({
    name: z.string().min(1, 'Contact name is required').max(100),
    mobileNumber: z.string().min(10, 'Valid mobile number required').max(15),
    email: z
      .union([z.string().email('Invalid email'), z.literal('')])
      .optional()
      .default(''),
    whatsappNumber: z.string().min(10, 'Valid WhatsApp number required').max(15)
  })
})

export type PropertyFormValues = z.infer<typeof propertyFormSchema>
