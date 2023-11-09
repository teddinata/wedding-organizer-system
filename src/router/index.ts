import NProgress from 'nprogress'
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { canNavigate } from '@layouts/plugins/casl'
import { useCookies } from '@vueuse/integrations/useCookies'
import { isUserLoggedIn } from './utils'
import routes from '~pages'

const cookies = useCookies(['role', 'userData', 'accessToken', 'userAbilities'])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {
        const userData = cookies.get('userData')
        const userRole: string[] = (userData && userData.roles) ? userData.roles.map((role: { name: string }) => role.name) : null

        if (userRole !== null && userRole.includes('Super Admin')) {
          return { name: 'dashboards-waiting-approval' }
        }

        return { name: 'auth-login', query: to.query }
      },
    },
    // {
    //   path: '/pages/user-profile',
    //   redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
    // },
    // {
    //   path: '/pages/account-settings',
    //   redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
    // },
    ...setupLayouts(routes),
  ],
})

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach(to => {
  NProgress.start()
  const isLoggedIn = isUserLoggedIn()
  if (canNavigate(to)) {
    if (to.meta.redirectIfLoggedIn && isLoggedIn)
      return '/'
  }
  else {
    if (isLoggedIn)
      return { name: 'not-authorized' }
    else
      return { name: 'login', query: { to: to.name !== 'index' ? to.fullPath : undefined } }
  }
})

router.afterEach(() => NProgress.done())

export default router
