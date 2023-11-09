<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useCookies } from '@vueuse/integrations/useCookies'
import { initialAbility } from '@/plugins/casl/ability'
import { useAppAbility } from '@/plugins/casl/useAppAbility'

const router = useRouter()
const ability = useAppAbility()
const cookies = useCookies(['role', 'userData', 'accessToken', 'userAbilities'])
const userData = cookies.get('userData')

const logout = () => {
  cookies.remove('userData')
  cookies.remove('accessToken')
  cookies.remove('role')

  // Redirect to login page
  router.push('/auth/login')
    .then(() => {
      cookies.remove('userAbilities')

      // Reset ability to initial ability
      ability.update(initialAbility)
    })
}

const userProfileList = [
  { type: 'divider' },
  { type: 'navItem', icon: 'tabler-user', title: 'My Profile', to: { name: 'edit-profile' } },
  { type: 'navItem', icon: 'tabler-logout', title: 'Logout', onClick: logout },
]
</script>

<template>
  <VBadge dot bordered location="bottom right" offset-x="3" offset-y="3" color="success">
    <VAvatar
      class="cursor-pointer" :color="!(userData && userData.avatar) ? 'primary' : undefined"
      :variant="!(userData && userData.avatar) ? 'tonal' : undefined"
    >
      <VImg
        v-if="userData && userData.profile_photo_path || userData.profile_photo_url"
        :src="userData.profile_photo_path ?? userData.profile_photo_url"
      />
      <VIcon v-else icon="tabler-user" />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge dot location="bottom right" offset-x="3" offset-y="3" color="success" bordered>
                  <VAvatar
                    :color="!(userData && userData.profile_photo_path || userData.profile_photo_url) ? 'primary' : undefined"
                    :variant="!(userData && userData.profile_photo_path || userData.profile_photo_url) ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="userData && userData.profile_photo_path || userData.profile_photo_url"
                      :src="userData.profile_photo_path ?? userData.profile_photo_url"
                    />
                    <VIcon v-else icon="tabler-user" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-medium">
              {{ userData.name }}
            </VListItemTitle>
            <VListItemSubtitle v-for="(role, i) in userData.roles" :key="i">
              {{ userData.name }}
            </VListItemSubtitle>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template v-for="item in userProfileList" :key="item.title">
              <VListItem v-if="item.type === 'navItem'" :to="item.to" @click="item.onClick && item.onClick()">
                <template #prepend>
                  <VIcon class="me-2" :icon="item.icon" size="22" />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>
              </VListItem>

              <VDivider v-else class="my-2" />
            </template>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
