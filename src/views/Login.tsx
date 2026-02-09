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
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Store Imports
import { useSendOTPMutation, useVerifyOTPMutation } from '@/store/services/authApiSlice'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [error, setError] = useState('')

  // Hooks
  const router = useRouter()
  const { setUser } = useAuth()
  const [sendOTP, { isLoading: isSendingOtp }] = useSendOTPMutation()
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const authBackground = useImageVariant(mode, '/images/pages/auth-v1-mask-light.png', '/images/pages/auth-v1-mask-dark.png')

  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number')
      return
    }
    try {
      await sendOTP({ mobileNumber: mobileNumber.trim() }).unwrap()
      setStep('otp')
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'Failed to send OTP'
        : 'Failed to send OTP'
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

  const handleBackToMobile = () => {
    setStep('mobile')
    setOtp('')
    setError('')
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
              <Typography className='mbs-1'>
                {step === 'mobile'
                  ? 'Enter your mobile number to receive an OTP'
                  : 'Enter the OTP sent to your mobile number'}
              </Typography>
            </div>

            {error && (
              <Alert severity='error' onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {step === 'mobile' ? (
              <form noValidate autoComplete='off' onSubmit={handleSendOtp} className='flex flex-col gap-5'>
                <TextField
                  autoFocus
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
                <Button fullWidth variant='contained' type='submit' disabled={isSendingOtp}>
                  {isSendingOtp ? <CircularProgress size={24} /> : 'Send OTP'}
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
                  {isVerifying ? <CircularProgress size={24} /> : 'Verify & Log In'}
                </Button>
                <Button fullWidth variant='text' onClick={handleBackToMobile}>
                  Change mobile number
                </Button>
              </form>
            )}

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href='/register' color='primary'>
                Create an account
              </Typography>
            </div>
            <Divider className='gap-3'>or</Divider>
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

export default Login
