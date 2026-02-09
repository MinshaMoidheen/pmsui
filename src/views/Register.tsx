'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Store Imports
import { useRegisterMutation, useVerifyOTPMutation } from '@/store/services/authApiSlice'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [mobileNumber, setMobileNumber] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [error, setError] = useState('')

  // Hooks
  const router = useRouter()
  const { setUser } = useAuth()
  const [register, { isLoading: isRegistering }] = useRegisterMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const authBackground = useImageVariant(mode, '/images/pages/auth-v1-mask-light.png', '/images/pages/auth-v1-mask-dark.png')

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number')
      return
    }
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    try {
      await register({ mobileNumber: mobileNumber.trim(), name: name.trim() }).unwrap()
      setStep('otp')
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'Registration failed'
        : 'Registration failed'
      setError(message)
    }
  }

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }
    try {
      const result = await verifyOTP({
        mobileNumber: mobileNumber.trim(),
        otp: otp.trim()
      }).unwrap()
      setUser(result.user)
      router.replace('/')
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'Invalid OTP'
        : 'Invalid OTP'
      setError(message)
    }
  }

  const handleBackToDetails = () => {
    setStep('details')
    setOtp('')
    setError('')
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              {step === 'details'
                ? 'Create your account to get started'
                : 'Enter the OTP sent to your mobile number'}
            </Typography>

            {error && (
              <Alert severity='error' onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {step === 'details' ? (
              <form noValidate autoComplete='off' onSubmit={handleRegister} className='flex flex-col gap-5'>
                <TextField
                  autoFocus
                  fullWidth
                  label='Full Name'
                  placeholder='Enter your name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label='Mobile Number'
                  placeholder='e.g. 9876543210'
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Typography color='text.secondary'>+91</Typography>
                      </InputAdornment>
                    )
                  }}
                />
                <Button fullWidth variant='contained' type='submit' disabled={isRegistering}>
                  {isRegistering ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form noValidate autoComplete='off' onSubmit={handleVerifyOtp} className='flex flex-col gap-5'>
                <TextField
                  autoFocus
                  fullWidth
                  label='OTP'
                  placeholder='Enter 6-digit OTP'
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                />
                <Button fullWidth variant='contained' type='submit' disabled={isVerifying}>
                  {isVerifying ? <CircularProgress size={24} /> : 'Verify & Create Account'}
                </Button>
                <Button fullWidth variant='text' onClick={handleBackToDetails}>
                  Change details
                </Button>
              </form>
            )}

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href='/login' color='primary'>
                Sign in instead
              </Typography>
            </div>
            <Divider className='gap-3'>Or</Divider>
            <div className='flex justify-center items-center gap-2'>
              <Typography variant='body2' color='text.secondary'>
                Continue with social (coming soon)
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
