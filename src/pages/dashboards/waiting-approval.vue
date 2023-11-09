<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }
type FlashMessageType = 'success' | 'info' | 'warning' | 'error'

const search = ref<string>('')
const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const vendorList = ref()
const totalVendor = ref<number>(0)
const toPage = ref<number>(0)
const flashMessage = ref<{ message: string; type: FlashMessageType }>({
    message: '',
    type: 'success'
})
const isAlertVisible = ref<boolean>(false)
const router = useRouter()

if (router.currentRoute.value.query.message !== undefined && router.currentRoute.value.query.type !== undefined) {
    isAlertVisible.value = true
    flashMessage.value.message = router.currentRoute.value.query.message as string
    flashMessage.value.type = router.currentRoute.value.query.type as FlashMessageType
}

const vendorListHeaders = [
    { title: 'NAME', key: 'name' },
    { title: 'CONTACT PERSON', key: 'email' },
    { title: 'LIMIT', key: 'vendor_limit.name' },
    { title: 'ACTION', key: 'action', sortable: false }
]

const totalVendors = ref<number>()
const totalUseMobileApp = ref<number>()
const fetchVendorList = () => {
    axios.get('/vendor', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            vendorList.value = response.data.data
            totalVendors.value = response.data.total_data
            totalUseMobileApp.value = response.data.total_user_use_app
            totalVendor.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

// Fetch limit
const vendorLimit = ref()
const fetchVendorLimit = () => {
    axios.get(`/vendor-limit?page=${options.current_page}&per_page=${options.per_page}`)
        .then((response) => {
            vendorLimit.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

// Fetch Vendor Grade
const vendorGrade = ref()
const fetchVendorGrade = () => {
    axios.get(`/vendor-grade?page=${options.current_page}&per_page=${options.per_page}`)
        .then((response) => {
            vendorGrade.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, () => fetchVendorList())
watch(
    () => options.per_page,
    () => fetchVendorList()
)

onMounted(() => {
    fetchVendorList()
    fetchVendorGrade()
    fetchVendorLimit()
})

// delete vendor
const isDeleteDialogVisible = ref<boolean>(false)
const dataVendor = ref()
const loadingDelete = ref<boolean>(false)

const deleteVendor = () => {
    loadingDelete.value = true
    axios.delete(`/vendor/${dataVendor.value.id}`)
        .then((response) => {
            loadingDelete.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            if(vendorList.value.data.length <= 1) toPage.value -= 1
            fetchVendorList()
        })
        .catch((e) => {
            loadingDelete.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
        })
}
</script>

<template>
    <VRow class="match-height">
        <VCol cols="12">
            <VBreadcrumbs
                :items="[$route.fullPath.split('/')[1].toLocaleUpperCase(), $route.fullPath.split('/')[2].toLocaleUpperCase()]" />
        </VCol>
        <VCol cols="12" md="6">
            <VCard>
                <VCardItem>
                    <div class="d-flex justify-content-end align-items-center">
                        <VCol cols="auto" md="6">
                            <h2 class="font-weight-bold">{{ totalVendors }}</h2>
                            <span>Total Order</span>
                        </VCol>
                        <VCol cols="auto" md="6" class="my-auto">
                            <VIcon size="32" icon="tabler-shopping-cart-bolt" style="margin-left: 10rem" />
                        </VCol>
                    </div>

                </VCardItem>
            </VCard>
        </VCol>
        <VCol cols="12" md="6" sm="6">
            <VCard>
                <VCardItem>
                    <div class="d-flex justify-content-end align-items-center">
                        <VCol cols="auto" md="6">
                            <h2 class="font-weight-bold">{{ totalUseMobileApp }}</h2>
                            <span>Pending Approval</span>
                        </VCol>
                        <VCol cols="auto" md="6" class="my-auto">
                            <VIcon size="32" icon="tabler-currency-dollar" style="margin-left: 10rem" />
                        </VCol>
                    </div>

                </VCardItem>
            </VCard>
        </VCol>

        <VCol cols="12">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
        </VCol>

        <VCol cols="12">
            <VCard class="mt-5">
                <VCardItem>
                    <VRow>
                        <VCol cols="12">
                            <span class="text-lg font-weight-bold">Search Filter</span>
                        </VCol>
                    </VRow>
                    <VRow>
                        <VCol cols="12" md="6">
                            <AppSelect :items="vendorLimit" item-title="name" item-value="id"
                                :menu-props="{ maxHeight: '400' }" multiple persistent-hint placeholder="Select Limit" />
                        </VCol>
                        <VCol cols="12" md="6">
                            <AppSelect :items="vendorGrade" item-title="name" item-value="id"
                                :menu-props="{ maxHeight: '400' }" multiple persistent-hint placeholder="Select Grade" />
                        </VCol>
                    </VRow>
                    <VRow justify="space-between">
                        <VCol cols="12" md="2" sm="6">
                            <AppSelect v-model="options.per_page" :items="[10, 20, 30, 40]" />
                        </VCol>
                        <VCol cols="12" md="6" sm="6">
                            <VRow>
                                <VCol cols="8">
                                    <AppTextField v-model="search" density="compact" placeholder="Search" single-line
                                        hide-details dense outlined />
                                </VCol>
                                <VCol cols="4">
                                    <RouterLink :to="{ name: 'vendors-form' }">
                                        <VBtn>Add Vendor</VBtn>
                                    </RouterLink>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>

                    <div class="mt-5" v-if="vendorList">
                        <VDivider />
                        <VDataTable :headers="vendorListHeaders" hide-default-footer :search="search"
                            :items="vendorList.data" :items-per-page="options.per_page">
                            <template #[`item.name`]="{ item }">
                                <RouterLink :to="{ name: 'vendors-detail-id', params: { id: item.props.title.id } }">
                                    <span>{{ item.props.title.name }}</span>
                                </RouterLink>
                            </template>
                            <template #[`item.email`]="{ item }">
                                <span class="font-weight-bold">{{ item.props.title.name }}</span>
                                <br>
                                <span>{{ item.props.title.email }}</span>
                            </template>
                            <template #[`item.action`]="{ item }">
                                <VMenu location="start">
                                    <template #activator="{ props }">
                                        <VBtn v-bind="props" variant="plain">
                                            <VIcon icon="tabler-dots-vertical" />
                                        </VBtn>
                                    </template>

                                    <VList>
                                        <VListItem class="cursor-pointer" @click="() => $router.push({
                                            name: 'vendors-detail-id',
                                            params: { id: item.props.title.id }
                                        })">Detail</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            $router.push({
                                                name: 'vendors-form',
                                                query: { id: item.props.title.id }
                                            })
                                        }">Edit</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDeleteDialogVisible = true
                                            dataVendor = item.props.title
                                        }">Delete</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            router.push({
                                                name: 'vendors-user-account-id',
                                                params: { id: item.props.title.id }
                                            })
                                        }">User's Account</VListItem>
                                    </VList>
                                </VMenu>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalVendor) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalVendor / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalVendor / options.per_page), options.last_page)" @next="(val) => toPage = val"
                                        @prev="(val) => toPage = val" @update:model-value="(val) => toPage = val">
                                        <template #next="slotProps">
                                            <VBtn v-bind="slotProps" :icon="false" variant="tonal" color="default">
                                                Next
                                            </VBtn>
                                        </template>

                                        <template #prev="slotProps">
                                            <VBtn v-bind="slotProps" :icon="false" variant="tonal" color="default">
                                                Previous
                                            </VBtn>
                                        </template>
                                    </VPagination>
                                </div>
                            </template>
                        </VDataTable>
                    </div>
                </VCardItem>
            </VCard>
        </VCol>

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Vendor">
            Are you sure want to delete vendor
            <span class="font-weight-bold">{{ dataVendor.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2"
                            @click="isDeleteDialogVisible = false" :disabled="loadingDelete">Cancel</VBtn>
                        <VBtn :loading="loadingDelete" :disabled="loadingDelete" color="error" @click="deleteVendor()">
                            Delete</VBtn>
                    </div>
                </VCol>
            </VRow>
        </MainDialog>
    </VRow>
</template>

<style lang="scss">
.v-text-field .v-input__details {
    padding-inline-start: 0;
}
.match-height.v-row .v-card {
  block-size: auto;
}
</style>