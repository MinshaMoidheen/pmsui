'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import { useGetSubscriptionPlansQuery, useCreateSubscriptionMutation } from '@/store/services/subscriptionsApiSlice'

const SubscriptionForm = () => {
  const router = useRouter()
  const [planId, setPlanId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('')
  const [autoRenew, setAutoRenew] = useState(false)

  const { data: plansData, isLoading: plansLoading, isError: plansError } = useGetSubscriptionPlansQuery()
  const [createSubscription, { isLoading: creating, isError: createError, error: createErr }] = useCreateSubscriptionMutation()

  const plans = plansData?.data?.plans ?? []

  useEffect(() => {
    if (planId && plans.length) {
      const plan = plans.find(p => p._id === planId)
      if (plan && paymentAmount === '') setPaymentAmount(plan.price)
    }
  }, [planId, plans, paymentAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId) return
    try {
      await createSubscription({
        planId,
        ...(paymentId && { paymentId }),
        ...(typeof paymentAmount === 'number' && { paymentAmount }),
        autoRenew
      }).unwrap()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { title: 'Success', description: 'Subscription created.', variant: 'default' } }))
      }
      router.push('/subscriptions')
    } catch {
      // Error handled by mutation
    }
  }

  if (plansLoading) {
    return (
      <Card>
        <CardContent className='flex justify-center p-8'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Create Subscription' subheader='Choose a plan and optionally add payment details to activate immediately.' />
      <CardContent>
        {plansError && (
          <Alert severity='error' className='mbe-4'>
            Failed to load plans
          </Alert>
        )}
        {createError && (
          <Alert severity='error' className='mbe-4'>
            {(createErr as { data?: { message?: string } })?.data?.message ?? 'Failed to create subscription'}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <TextField
            select
            fullWidth
            required
            label='Plan'
            value={planId}
            onChange={e => setPlanId(e.target.value)}
          >
            <MenuItem value=''>Select a plan</MenuItem>
            {plans.map(plan => (
              <MenuItem key={plan._id} value={plan._id}>
                {plan.name} — {plan.currency} {plan.price} / {plan.duration} days
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label='Payment ID (optional)'
            value={paymentId}
            onChange={e => setPaymentId(e.target.value)}
            placeholder='Leave empty to create as Pending Payment'
          />

          <TextField
            fullWidth
            type='number'
            label='Payment amount (optional)'
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
            inputProps={{ min: 0 }}
          />

          {/* <FormControlLabel
            control={<Checkbox checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} />}
            label='Auto renew'
          /> */}

          <div className='flex gap-2'>
            <Button type='submit' variant='contained' disabled={creating || !planId}>
              {creating ? <CircularProgress size={24} /> : 'Create Subscription'}
            </Button>
            <Button type='button' variant='outlined' onClick={() => router.push('/subscriptions')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default SubscriptionForm
