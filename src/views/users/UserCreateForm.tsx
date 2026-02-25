'use client'

// React Imports
import { useState } from 'react'
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
import Box from '@mui/material/Box'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

// Store Imports
import { useCreateUserMutation } from '@/store/services/usersApiSlice'

// Types
import { USER_ROLE_OPTIONS, type CreateUserRequest } from '@/types/users'

const inputSx = {
  '& .MuiInputBase-input': { py: 0.875, px: 1.25, fontSize: '0.9375rem', minHeight: 38 },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', fontWeight: 500 },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: 0.5 },
  '& .MuiOutlinedInput-root': { borderRadius: 1.25 }
}

const UserCreateForm = () => {
  const router = useRouter()
  const [createUser, { isLoading }] = useCreateUserMutation()

  const [formData, setFormData] = useState<CreateUserRequest>({
    mobileNumber: '',
    role: 'USER',
    isActive: true,
    profile: {
      firstName: '',
      lastName: '',
      bio: '',
      serviceAreas: [],
      specialties: []
    }
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedMobile = formData.mobileNumber.trim()
    if (!/^[0-9]{10,15}$/.test(trimmedMobile)) {
      setError('Please enter a valid mobile number (10–15 digits).')
      return
    }

    try {
      await createUser({
        mobileNumber: trimmedMobile,
        role: formData.role,
        isActive: formData.isActive,
        profile: {
          firstName: formData.profile?.firstName?.trim() || undefined,
          lastName: formData.profile?.lastName?.trim() || undefined,
          bio: formData.role === 'BROKER' ? formData.profile?.bio?.trim() || undefined : undefined,
          serviceAreas: formData.role === 'BROKER' ? formData.profile?.serviceAreas : undefined,
          specialties: formData.role === 'BROKER' ? formData.profile?.specialties : undefined
        }
      }).unwrap()
      router.push('/users')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? ((err.data as { message?: string })?.message ?? 'Failed to create user')
          : 'Failed to create user'
      setError(message)
    }
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardHeader
        title='Create User'
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

          <Box component='div' sx={{ mb: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Mobile Number'
                  placeholder='9876543210'
                  value={formData.mobileNumber}
                  onChange={e => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label='Role'
                  value={formData.role ?? 'USER'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      role: e.target.value as CreateUserRequest['role']
                    }))
                  }
                  sx={inputSx}
                >
                  {USER_ROLE_OPTIONS.map(r => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='First Name'
                  value={formData.profile?.firstName ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      profile: { ...(prev.profile ?? {}), firstName: e.target.value }
                    }))
                  }
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Last Name'
                  value={formData.profile?.lastName ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      profile: { ...(prev.profile ?? {}), lastName: e.target.value }
                    }))
                  }
                  sx={inputSx}
                />
              </Grid>

              {formData.role === 'BROKER' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label='Bio'
                      placeholder='Broker biography...'
                      value={formData.profile?.bio ?? ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          profile: { ...(prev.profile ?? {}), bio: e.target.value }
                        }))
                      }
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.profile?.serviceAreas ?? []}
                      onChange={(_, newValue) =>
                        setFormData(prev => ({
                          ...prev,
                          profile: { ...(prev.profile ?? {}), serviceAreas: newValue as string[] }
                        }))
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Service Areas'
                          placeholder='Add areas and press Enter'
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
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.profile?.specialties ?? []}
                      onChange={(_, newValue) =>
                        setFormData(prev => ({
                          ...prev,
                          profile: { ...(prev.profile ?? {}), specialties: newValue as string[] }
                        }))
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='Specialties'
                          placeholder='Add specialties and press Enter'
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
                </>
              )}
            </Grid>
          </Box>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            The user will sign in using OTP verification on this mobile number.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button variant='contained' type='submit' disabled={isLoading} size='small'>
                {isLoading ? <CircularProgress size={20} /> : 'Create'}
              </Button>
              <Button variant='outlined' onClick={() => router.push('/users')} size='small'>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default UserCreateForm
