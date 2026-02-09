// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import { AuthProvider } from '@/contexts/AuthContext'

// Component Imports
import { StoreProvider } from '@/store/storeProvider'

// Util Imports
import { getMode, getSettingsFromCookie } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = (props: Props) => {
  const { children, direction } = props
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()

  return (
    <StoreProvider>
      <AuthProvider>
        <VerticalNavProvider>
          <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
            <ThemeProvider direction={direction}>
              {children}
            </ThemeProvider>
          </SettingsProvider>
        </VerticalNavProvider>
      </AuthProvider>
    </StoreProvider>
  )
}

export default Providers
