<script setup lang="ts">
import axios from '@axios'
import UserProfileHeaderBg from '@images/pages/user-profile-header-bg.png'

const route = useRoute()
const currentTab = ref<number>(0)

const employee = ref()
const avatar = ref()

const fetchDetailEmployee = () => {
  axios.get(`/employee/${route.params.id}`)
    .then((response) => {
      const data = response.data.data
      const urlImageEmployee = "https://dev.goodsoneid.com/storage/uploads/employee/"

      employee.value = data
      avatar.value = `${urlImageEmployee}${data.photo}`
    })
}

onMounted(() => fetchDetailEmployee())
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="employee" class="mb-5">
        <VImg :src="UserProfileHeaderBg" min-height="125" max-height="250" cover />

        <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-5">
          <div class="d-flex h-0">
            <VAvatar rounded size="120" :image="avatar" class="user-profile-avatar mx-auto" />
          </div>

          <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
            <h6 class="text-h6 text-center text-sm-start font-weight-medium mb-3">
              {{ employee?.fullname }}
            </h6>

            <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-4">
              <span class="text-body-1">
                {{ employee?.position.name }}
              </span>
            </div>
          </div>
          <VBtn prepend-icon="tabler-pencil" @click="() => {
            $router.push({
              name: 'employee-tab',
              query: { id: employee.id },
              params: { tab: 'personal-information' },
            })
          }">
            Edit Profile
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VTabs v-model="currentTab" class="v-tabs-pill">
        <VTab>Profile</VTab>
        <VTab v-if="employee?.position.name === 'PIC' ? true : false">
          Teams
        </VTab>
        <VTab>Rating & Reviews</VTab>
      </VTabs>
    </VCol>
    <VCol cols="12">
      <VWindow v-model="currentTab" class="v-tabs-pill">
        <VWindowItem v-if="employee">
          <EmployeeAbout :employee="employee" />
        </VWindowItem>
        <VWindowItem>
          <EmployeeTeam />
        </VWindowItem>
        <VWindowItem>
          <EmployeeRating />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.user-profile-avatar {
  border: 5px solid rgb(var(--v-theme-surface));
  background-color: rgb(var(--v-theme-surface)) !important;
  inset-block-start: -3rem;

  .v-img__img {
    border-radius: 0.125rem;
  }
}

.card-list {
  --v-card-list-gap: 16px;
}
</style>