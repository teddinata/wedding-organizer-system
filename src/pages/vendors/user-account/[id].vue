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
  <VRow v-if="vendor" class="match-height">
    <VCol cols="12">
      <VBreadcrumbs :items="['Vendor', vendor.name, 'User account']" />
    </VCol>
    <VRow>
      <VCol cols="12">
        <VTabs v-model="currentTab" class="v-tabs-pill">
          <VTab>
            <VIcon start icon="tabler-user" />
            Account
          </VTab>
          <VTab>
            <VIcon start icon="tabler-map-pin" />
            Shipping Address
          </VTab>
        </VTabs>
      </VCol>
      <VCol cols="12">
        <VWindow v-model="currentTab" class="mt-4">
          <VWindowItem>
            <VendorUserAccount :data="vendor" />
          </VWindowItem>
          <VWindowItem>
            <UserAccountShippingAddress :data="vendor" />
          </VWindowItem>
        </VWindow>
      </VCol>
    </VRow>
  </VRow>
</template>