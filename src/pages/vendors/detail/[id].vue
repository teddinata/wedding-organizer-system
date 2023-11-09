<script setup lang="ts">
import axios from '@axios'

const currentTab = ref<number>(0)
const route = useRoute()

const vendor = ref()
const fetchVendor = () => {
    axios.get('/vendor', { params: { id: route.params?.id } })
        .then((response) => {
            vendor.value = response.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => fetchVendor())
</script>

<template>
  <VRow>
    <VCol cols="12" md="4">
      <VCard v-if="vendor">
        <VCardItem>
          <VRow>
            <VCol cols="12">
              <div class="d-flex flex-column justify-content-center gap-3">
                <VImg
                  src="https://avatars.githubusercontent.com/u/33148052?v=4" :width="100" cover
                  aspect-ratio="4/3" class="rounded mx-auto"
                />
                <span class="text-xl font-weight-bold mx-auto">{{ vendor.name }}</span>
                <span class="text-md mx-auto">Vendor ID #{{ vendor.code }}</span>

                <VRow>
                  <VCol cols="12" md="6">
                    <div class="d-flex flex-row align-content-center gap-1">
                      <VIcon icon="tabler-clipboard-check" size="x-large" />
                      <div class="d-flex flex-column">
                        <span class="text-md font-weight-bold">25</span>
                        <span class="text-lead">Total Order</span>
                      </div>
                    </div>
                  </VCol>
                  <VCol cols="12" md="6">
                    <div class="d-flex flex-row align-content-center gap-1">
                      <VIcon icon="tabler-report-analytics" size="x-large" />
                      <div class="d-flex flex-column">
                        <span class="text-md font-weight-bold">105.8M</span>
                        <span class="text-lead">Total Sales</span>
                      </div>
                    </div>
                  </VCol>
                  <VCol cols="12" md="6">
                    <div class="d-flex flex-row align-content-center gap-1">
                      <VIcon icon="tabler-file-dollar" size="x-large" />
                      <div class="d-flex flex-column">
                        <span class="text-md font-weight-bold">57.3M</span>
                        <span class="text-lead">Outstanding</span>
                      </div>
                    </div>
                  </VCol>
                </VRow>
                <VDivider />
                <div class="d-flex flex-column gap-3">
                  <span class="text-uppercase text-lead">details</span>
                  <span class="font-weight-bold">CP: <span class="font-weight-medium">{{ vendor.contact_person }}</span></span>
                  <span class="font-weight-bold">Email: <span class="font-weight-medium">{{ vendor.email }}</span></span>
                  <span class="font-weight-bold">Contact: <span class="font-weight-medium">{{ vendor.contact_number }}</span></span>
                  <span class="font-weight-bold">Instagram: <span class="font-weight-medium">{{ vendor.instagram }}</span></span>
                  <span class="font-weight-bold">Address: <span class="font-weight-medium">{{ vendor.address }}</span></span>
                  <span class="font-weight-bold">City: <span class="font-weight-medium">{{ vendor.city }}</span></span>
                </div>
                <RouterLink :to="{ name: 'vendors-form', query: { id: route.params.id } }" class="mx-auto">
                  <VBtn>Edit</VBtn>
                </RouterLink>
              </div>
            </VCol>
          </VRow>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12" md="8">
      <VRow>
        <VCol cols="12">
          <VTabs v-model="currentTab" class="v-tabs-pill">
            <VTab>Overview</VTab>
            <VTab>Unpaid</VTab>
            <VTab>Paid</VTab>
            <VTab>History Points</VTab>
          </VTabs>
        </VCol>
        <VWindow v-model="currentTab" class="mt-4">
          <VWindowItem>
            <VendorOverview :data="vendor" />
          </VWindowItem>

          <VWindowItem>
            <VendorUnpaid />
          </VWindowItem>

          <VWindowItem>
            <VendorPaid />
          </VWindowItem>

          <VWindowItem>
            <VendorHistoryPoints />
          </VWindowItem>
        </VWindow>
      </VRow>
    </VCol>
  </VRow>
</template>

<style scoped>
.v-window {
    width: 100%;
}
</style>