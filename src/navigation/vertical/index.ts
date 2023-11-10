import webApps from './web-apps'
import loyaltySystem from './loyalty-system'
import dashboard from './dashboard'
import reports from './report'
import wedding from './wedding'

// import forms from './forms'
import settings from './settings'

// import uiElements from './ui-elements'
import type { VerticalNavItems } from '@/@layouts/types'

export default [...dashboard, ...webApps, ...loyaltySystem, ...wedding, ...reports, ...settings] as VerticalNavItems
