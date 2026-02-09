// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu - only routes that exist in this app */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuSection label='Dashboard'>
          <MenuItem href='/' icon={<i className='ri-home-smile-line' />}>
            Analytics
          </MenuItem>
        </MenuSection>
        <MenuSection label='Apps & Pages'>
          <MenuItem href='/properties' icon={<i className='ri-building-line' />}>
            Properties
          </MenuItem>
          <MenuItem href='/jobs' icon={<i className='ri-briefcase-line' />}>
            Jobs
          </MenuItem>
          
          <MenuItem href='/users' icon={<i className='ri-group-line' />}>
            Users
          </MenuItem>

          <MenuItem href='/jobs/applications/my' icon={<i className='ri-file-user-line' />}>
            My Applications
          </MenuItem>
         
          <MenuItem href='/card-basic' icon={<i className='ri-bar-chart-box-line' />}>
            Cards
          </MenuItem>
          <SubMenu label='Auth Pages' icon={<i className='ri-shield-keyhole-line' />}>
            <MenuItem href='/login'>Login</MenuItem>
            <MenuItem href='/register'>Register</MenuItem>
            <MenuItem href='/forgot-password'>Forgot Password</MenuItem>
          </SubMenu>
          <SubMenu label='Miscellaneous' icon={<i className='ri-question-line' />}>
            <MenuItem href='/error'>Error</MenuItem>
            <MenuItem href='/under-maintenance'>Under Maintenance</MenuItem>
          </SubMenu>
        </MenuSection>
        <MenuSection label='Forms & Tables'>
          <MenuItem href='/form-layouts' icon={<i className='ri-layout-4-line' />}>
            Form Layouts
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
