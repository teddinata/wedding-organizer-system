import { createMongoAbility } from '@casl/ability'
import { useCookies } from '@vueuse/integrations/useCookies'
import type { UserAbility } from './AppAbility'

const cookies = useCookies(['role', 'userData', 'accessToken', 'userAbilities'])
export const initialAbility: UserAbility[] = [
  {
    action: 'read',
    subject: 'Auth',
  },
]
const stringifiedUserAbilities = cookies.get('userAbilities')
const existingAbility = stringifiedUserAbilities ? stringifiedUserAbilities : null

export default createMongoAbility(existingAbility || initialAbility)
