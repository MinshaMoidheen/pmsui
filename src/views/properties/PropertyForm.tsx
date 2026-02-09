'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Store Imports
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetPropertyByIdQuery
} from '@/store/services/propertiesApiSlice'

// Type Imports
import type { createPropertyRequest } from '@/types/properties'
import { PROPERTY_TYPES, PROPERTY_CATEGORIES, AREA_UNITS } from '@/types/properties'

// Schema Imports
import { propertyFormSchema } from '@/schemas/propertySchema'

// Component Imports
import ImageUploader from '@components/ImageUploader'

const defaultFormValues: createPropertyRequest = {
  type: 'SALE',
  category: 'APARTMENT',
  title: '',
  description: '',
  location: {
    address: '',
    city: '',
    state: '',
    pincode: ''
  },
  price: 0,
  priceUnit: 'INR',
  area: {
    value: 0,
    unit: 'sqft'
  },
  flexibleFields: {},
  images: [],
  contact: {
    name: '',
    mobileNumber: '',
    email: '',
    whatsappNumber: ''
  }
}

const inputSx = {
  '& .MuiInputBase-input': { py: 0.875, px: 1.25, fontSize: '0.9375rem', minHeight: 38 },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', fontWeight: 500 },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: 0.5 },
  '& .MuiOutlinedInput-root': { borderRadius: 1.25 }
}

const sectionSx = { mb: 3 }

interface PropertyFormProps {
  id?: string
}

const PropertyForm = ({ id }: PropertyFormProps) => {
  const router = useRouter()
  const isEdit = !!id

  const [formData, setFormData] = useState<createPropertyRequest>(defaultFormValues)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: propertyData, isLoading: isLoadingProperty } = useGetPropertyByIdQuery(id!, { skip: !id })
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation()
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation()

  const isLoading = isCreating || isUpdating

  useEffect(() => {
    const p = propertyData?.data?.property
    if (p) {
      setFormData({
        type: p.type,
        category: p.category,
        title: p.title,
        description: p.description ?? '',
        location: {
          address: p.location?.address ?? '',
          city: p.location?.city ?? '',
          state: p.location?.state ?? '',
          pincode: p.location?.pincode ?? ''
        },
        price: p.price ?? 0,
        priceUnit: p.priceUnit ?? 'INR',
        area: {
          value: p.area?.value ?? 0,
          unit: p.area?.unit ?? 'sqft'
        },
        flexibleFields: p.flexibleFields ?? {},
        images: Array.isArray(p.images) ? [...p.images] : [],
        contact: {
          name: p.contact?.name ?? '',
          mobileNumber: p.contact?.mobileNumber ?? '',
          email: p.contact?.email ?? '',
          whatsappNumber: p.contact?.whatsappNumber ?? ''
        }
      })
    }
  }, [propertyData])

  const updateField = (field: keyof createPropertyRequest, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  const updateLocation = (field: keyof createPropertyRequest['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }))
    const key = `location.${field}`
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  const updateArea = (field: 'value' | 'unit', value: number | string) => {
    setFormData(prev => ({
      ...prev,
      area: { ...prev.area, [field]: field === 'value' ? Number(value) : value }
    }))
  }

  const updateContact = (field: keyof createPropertyRequest['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }))
    const key = `contact.${field}`
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = propertyFormSchema.safeParse({
      ...formData,
      contact: {
        ...formData.contact,
        email: formData.contact.email || undefined
      }
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.')
        const key = path.startsWith('images') ? 'images' : path
        if (!errors[key]) errors[key] = issue.message
      })
      setFieldErrors(errors)
      setError(result.error.issues[0]?.message ?? 'Please fix the errors below')
      return
    }

    const payload: createPropertyRequest = {
      type: result.data.type as createPropertyRequest['type'],
      category: result.data.category as createPropertyRequest['category'],
      title: result.data.title.trim(),
      description: result.data.description ?? '',
      location: result.data.location,
      price: result.data.price,
      priceUnit: result.data.priceUnit ?? 'INR',
      area: result.data.area,
      flexibleFields: result.data.flexibleFields ?? {},
      images: result.data.images ?? [],
      contact: {
        name: result.data.contact.name.trim(),
        mobileNumber: result.data.contact.mobileNumber.trim(),
        email: result.data.contact.email?.trim() || undefined,
        whatsappNumber: result.data.contact.whatsappNumber.trim()
      }
    }

    try {
      if (isEdit && id) {
        await updateProperty({ id, data: payload }).unwrap()
        router.push('/properties')
      } else {
        await createProperty(payload).unwrap()
        router.push('/properties')
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message ?? 'Operation failed'
          : 'Operation failed'
      setError(message)
    }
  }

  const getError = (path: string) => fieldErrors[path] ?? ''

  if (isEdit && isLoadingProperty) {
    return (
      <div className='flex justify-center p-8'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardHeader
        title={isEdit ? 'Edit Property' : 'Create Property'}
        sx={{ pb: 1, '& .MuiCardHeader-title': { fontSize: '1.25rem', fontWeight: 600 } }}
      />
      <CardContent sx={{ pt: 0, px: { xs: 3, sm: 4 }, pb: 4 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity='error' onClose={() => setError('')} sx={{ mb: 2.5, py: 0.75, '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
              {error}
            </Alert>
          )}

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Property Details
            </Typography>
            <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Title'
                placeholder='e.g. 3BHK Apartment'
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                error={!!getError('title')}
                helperText={getError('title')}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label='Type'
                value={formData.type}
                onChange={e => updateField('type', e.target.value as createPropertyRequest['type'])}
                sx={inputSx}
              >
                {PROPERTY_TYPES.map(pt => (
                  <MenuItem key={pt.value} value={pt.value}>
                    {pt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label='Category'
                value={formData.category}
                onChange={e => updateField('category', e.target.value as createPropertyRequest['category'])}
                sx={inputSx}
              >
                {PROPERTY_CATEGORIES.map(c => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label='Description'
                placeholder='Property details...'
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Location
            </Typography>
            <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address'
                placeholder='Street, locality'
                value={formData.location.address}
                onChange={e => updateLocation('address', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='City'
                placeholder='City'
                value={formData.location.city}
                onChange={e => updateLocation('city', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='State'
                placeholder='State'
                value={formData.location.state}
                onChange={e => updateLocation('state', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Pincode'
                placeholder='123456'
                value={formData.location.pincode}
                onChange={e => updateLocation('pincode', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Price & Area
            </Typography>
            <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='number'
                label='Price'
                placeholder='0'
                value={formData.price || ''}
                onChange={e => updateField('price', Number(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                error={!!getError('price')}
                helperText={getError('price')}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type='number'
                label='Area'
                placeholder='0'
                value={formData.area.value || ''}
                onChange={e => updateArea('value', e.target.value)}
                inputProps={{ min: 0 }}
                error={!!getError('area.value')}
                helperText={getError('area.value')}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label='Unit'
                value={formData.area.unit}
                onChange={e => updateArea('unit', e.target.value)}
                sx={inputSx}
              >
                {AREA_UNITS.map(u => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Property Images
            </Typography>
            <ImageUploader
              value={formData.images}
              onChange={urls => updateField('images', urls)}
              maxImages={10}
              disabled={isLoading}
            />
            {getError('images') && (
              <Typography variant='caption' color='error' sx={{ mt: 0.75, display: 'block' }}>
                {getError('images')}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{ mb: 1.5, pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
              color='text.primary'
            >
              Contact Details
            </Typography>
            <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Contact Name'
                placeholder='Full name'
                value={formData.contact.name}
                onChange={e => updateContact('name', e.target.value)}
                error={!!getError('contact.name')}
                helperText={getError('contact.name')}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Mobile'
                placeholder='9876543210'
                value={formData.contact.mobileNumber}
                onChange={e => updateContact('mobileNumber', e.target.value)}
                error={!!getError('contact.mobileNumber')}
                helperText={getError('contact.mobileNumber')}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='WhatsApp'
                placeholder='9876543210'
                value={formData.contact.whatsappNumber}
                onChange={e => updateContact('whatsappNumber', e.target.value)}
                error={!!getError('contact.whatsappNumber')}
                helperText={getError('contact.whatsappNumber')}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type='email'
                label='Email'
                placeholder='email@example.com'
                value={formData.contact.email}
                onChange={e => updateContact('email', e.target.value)}
                error={!!getError('contact.email')}
                helperText={getError('contact.email')}
                sx={inputSx}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button variant='contained' type='submit' disabled={isLoading} size='small'>
                {isLoading ? <CircularProgress size={20} /> : isEdit ? 'Update' : 'Create'}
              </Button>
              <Button variant='outlined' onClick={() => router.push('/properties')} size='small'>
                Cancel
              </Button>
            </Grid>
            </Grid>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default PropertyForm
