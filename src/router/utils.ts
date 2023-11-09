import { useCookies } from '@vueuse/integrations/useCookies'

const cookies = useCookies(['role', 'userData', 'accessToken', 'userAbilities'])
export const isUserLoggedIn = () => !!(cookies.get('userData') && cookies.get('accessToken'))
