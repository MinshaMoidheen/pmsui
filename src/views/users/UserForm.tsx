'use client'

// React Imports
import { useEffect, useState } from 'react'
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
import { useGetUserByIdQuery, useUpdateUserMutation } from '@/store/services/usersApiSlice'

// Types
import type { UpdateUserRequest } from '@/types/users'
import { USER_ROLE_OPTIONS } from '@/types/users'

const inputSx = {
  '& .MuiInputBase-input': { py: 0.875, px: 1.25, fontSize: '0.9375rem', minHeight: 38 },
  '& .MuiInputLabel-root': { fontSize: '0.875rem', fontWeight: 500 },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: 0.5 },
  '& .MuiOutlinedInput-root': { borderRadius: 1.25 }
}

const sectionSx = { mb: 3 }

interface UserFormProps {
  id: string
}

const UserForm = ({ id }: UserFormProps) => {
  const router = useRouter()

  const [formData, setFormData] = useState<UpdateUserRequest>({
    role: 'USER',
    isActive: true,
    profile: {
      firstName: '',
      lastName: ''
    }
  })
  const [error, setError] = useState('')

  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(id)
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  useEffect(() => {
    const user = userData?.data?.user
    if (user) {
      setFormData({
        role: user.role,
        isActive: user.isActive,
        profile: {
          firstName: user.profile?.firstName ?? '',
          lastName: user.profile?.lastName ?? '',
          profilePicture: user.profile?.profilePicture
        }
      })
    }
  }, [userData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await updateUser({ id, data: formData }).unwrap()
      router.push('/users')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message ?? 'Operation failed'
          : 'Operation failed'
      setError(message)
    }
  }

  if (isLoadingUser) {
    return (
      <div className='flex justify-center p-8'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardHeader
        title='Edit User'
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
              Basic Info
            </Typography>
            <Grid container spacing={2.5}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label='Role'
                  value={formData.role ?? 'USER'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      role: e.target.value as UpdateUserRequest['role']
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
                  select
                  label='Status'
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isActive: e.target.value === 'true'
                    }))
                  }
                  sx={inputSx}
                >
                  <MenuItem value='true'>Active</MenuItem>
                  <MenuItem value='false'>Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box component='div' sx={sectionSx}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button variant='contained' type='submit' disabled={isUpdating} size='small'>
                  {isUpdating ? <CircularProgress size={20} /> : 'Save'}
                </Button>
                <Button variant='outlined' onClick={() => router.push('/users')} size='small'>
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

export default UserForm

