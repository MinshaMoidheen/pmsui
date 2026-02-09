'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Store Imports
import { useLogoutMutation } from '@/store/services/authApiSlice'
import { useRequestEmployerAccessMutation } from '@/store/services/jobSlice'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { user, logout } = useAuth()
  const [logoutMutation] = useLogoutMutation()
  const [requestEmployerAccess, { isLoading: isRequestingEmployerAccess }] = useRequestEmployerAccessMutation()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleLogout = async () => {
    setOpen(false)
    try {
      await logoutMutation().unwrap()
    } catch {
      // Ignore errors - we'll clear local state anyway
    }
    logout()
  }

  const handleRequestEmployerAccess = async () => {
    if (!user) return

    const companyName = typeof window !== 'undefined'
      ? window.prompt('Enter your company name to request employer access:')
      : null

    if (!companyName) {
      return
    }

    try {
      await requestEmployerAccess({
        companyName,
        contact: {
          name: displayName,
          mobileNumber: user.mobileNumber,
          whatsappNumber: user.mobileNumber
        }
      }).unwrap()

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              title: 'Request submitted',
              description: 'Your employer access request has been submitted.',
              variant: 'default'
            }
          })
        )
      }
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        const errorMessage =
          (error?.data && (error.data as { message?: string }).message) ||
          'Failed to submit employer access request.'

        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              title: 'Request failed',
              description: errorMessage,
              variant: 'destructive'
            }
          })
        )
      }
    } finally {
      setOpen(false)
    }
  }

  const displayName = user?.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ') || user.mobileNumber
    : user?.mobileNumber || 'User'
  const displayRole = user?.role || 'User'
  const avatarSrc = user?.profile?.profilePicture || undefined

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={displayName}
          src={avatarSrc}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        >
          {!avatarSrc && displayName.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={displayName} src={avatarSrc}>
                      {!avatarSrc && displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {displayName}
                      </Typography>
                      <Typography variant='caption'>{displayRole}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {user?.role === 'USER' && (
                    <MenuItem className='gap-3' onClick={handleRequestEmployerAccess} disabled={isRequestingEmployerAccess}>
                      <i className='ri-briefcase-line' />
                      <Typography color='text.primary'>
                        {isRequestingEmployerAccess ? 'Submitting...' : 'Apply for Employer'}
                      </Typography>
                    </MenuItem>
                  )}
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
