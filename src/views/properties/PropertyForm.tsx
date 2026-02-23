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
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Autocomplete from '@mui/material/Autocomplete'

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

const AMENITIES_OPTIONS = [
  'Free Wifi',
  'Dedicated workspace',
  'Air conditioning',
  'TV',
  'Exterior security cameras on property',
  'Dedicated Parking slots',
  'Gym in building',
  'Drinking water supply',
  'Sports activity spaces'
]

const VALIDATED_INFO_LABELS = ['Developer', 'Ownership', 'Usage']

const defaultFormValues: createPropertyRequest = {
  type: 'SALE',
  category: 'APARTMENT',
  title: '',
  description: '',
  location: {
    address: '',
    city: '',
    state: '',
    pincode: '',
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  },
  price: 0,
  priceUnit: '',
  area: {
    value: 0,
    unit: 'sqft'
  },
  flexibleFields: {
    propertyAge: '3 month',
    furnishing: 'Fully Furnished',
    averageMortage: 120000,
    completionStatus: 'Ready to Move'
  },
  amenities: [],
  validatedInfo: VALIDATED_INFO_LABELS.map(label => ({ label, value: '' })),
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
          pincode: p.location?.pincode ?? '',
          coordinates: {
            latitude: p.location?.coordinates?.latitude ?? 0,
            longitude: p.location?.coordinates?.longitude ?? 0
          }
        },
        price: p.price ?? 0,
        priceUnit: p.priceUnit ?? '',
        area: {
          value: p.area?.value ?? 0,
          unit: p.area?.unit ?? 'sqft'
        },
        flexibleFields: p.flexibleFields ?? {},
        amenities: Array.isArray(p.amenities) ? [...p.amenities] : [],
        validatedInfo: VALIDATED_INFO_LABELS.map(label => ({
          label,
          value: p.validatedInfo?.find((info: any) => info.label === label)?.value ?? ''
        })),
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

  const updateCoordinates = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = Number(value) || 0
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...(prev.location.coordinates || { latitude: 0, longitude: 0 }),
          [field]: numValue
        }
      }
    }))
    const key = `location.coordinates.${field}`
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

  const addFlexibleField = () => {
    setFormData(prev => ({
      ...prev,
      flexibleFields: { ...prev.flexibleFields, '': '' }
    }))
  }

  const removeFlexibleField = (key: string) => {
    setFormData(prev => {
      const newFields = { ...prev.flexibleFields }
      delete newFields[key]
      return { ...prev, flexibleFields: newFields }
    })
  }

  const updateFlexibleField = (oldKey: string, newKey: string, value: any) => {
    setFormData(prev => {
      const newFields = { ...prev.flexibleFields }
      if (oldKey !== newKey) {
        delete newFields[oldKey]
      }
      newFields[newKey] = value
      return { ...prev, flexibleFields: newFields }
    })
  }

  const updateAmenities = (values: string[]) => {
    updateField('amenities', values)
  }

  const updateValidatedInfo = (label: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      validatedInfo: prev.validatedInfo.map(item => (item.label === label ? { ...item, value } : item))
    }))
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
      priceUnit: result.data.priceUnit ?? '',
      area: result.data.area,
      flexibleFields: result.data.flexibleFields ?? {},
      amenities: result.data.amenities ?? [],
      validatedInfo: result.data.validatedInfo ?? [],
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
          ? ((err.data as { message?: string })?.message ?? 'Operation failed')
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
            <Alert
              severity='error'
              onClose={() => setError('')}
              sx={{ mb: 2.5, py: 0.75, '& .MuiAlert-message': { fontSize: '0.875rem' } }}
            >
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='number'
                  label='Latitude'
                  placeholder='0.0000'
                  value={formData.location.coordinates?.latitude || ''}
                  onChange={e => updateCoordinates('latitude', e.target.value)}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type='number'
                  label='Longitude'
                  placeholder='0.0000'
                  value={formData.location.coordinates?.longitude || ''}
                  onChange={e => updateCoordinates('longitude', e.target.value)}
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label='Price Unit'
                  placeholder='e.g. /sqft, /month'
                  value={formData.priceUnit}
                  onChange={e => updateField('priceUnit', e.target.value)}
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
              Amenities
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={AMENITIES_OPTIONS}
                  value={formData.amenities}
                  onChange={(_, newValue) => updateAmenities(newValue as string[])}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Amenities'
                      placeholder='Select or type and press Enter'
                      sx={inputSx}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option} size='small' {...getTagProps({ index })} key={index} />
                    ))
                  }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography
                variant='subtitle2'
                fontWeight={600}
                sx={{ pl: 1.5, borderLeft: 3, borderColor: 'primary.main' }}
                color='text.primary'
              >
                Additional Features (Flexible Fields)
              </Typography>
              <Button size='small' variant='outlined' onClick={addFlexibleField}>
                Add Field
              </Button>
            </Box>
            <Grid container spacing={2}>
              {Object.entries(formData.flexibleFields).map(([key, value], index) => (
                <Grid item xs={12} key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    size='small'
                    label='Field Name'
                    value={key}
                    onChange={e => updateFlexibleField(key, e.target.value, value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size='small'
                    label='Value'
                    value={value}
                    onChange={e => updateFlexibleField(key, key, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button color='error' onClick={() => removeFlexibleField(key)}>
                    Remove
                  </Button>
                </Grid>
              ))}
              {Object.keys(formData.flexibleFields).length === 0 && (
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic', pl: 1.5 }}>
                    No additional features added yet.
                  </Typography>
                </Grid>
              )}
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
              Validated Information
            </Typography>
            <Grid container spacing={2.5}>
              {formData.validatedInfo.map((info, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <TextField
                    fullWidth
                    label={info.label}
                    placeholder={`Enter ${info.label}`}
                    value={info.value}
                    onChange={e => updateValidatedInfo(info.label, e.target.value)}
                    sx={inputSx}
                  />
                </Grid>
              ))}
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
