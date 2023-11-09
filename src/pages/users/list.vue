<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }
type FlashMessageType = 'success' | 'info' | 'warning' | 'error'

const isAlertVisible = ref<boolean>(false)
const flashMessage = ref<{ message: string; type: FlashMessageType }>({
    message: '',
    type: 'success'
})
const search = ref<string>()
const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })

const userHeaders = [
    { title: 'USER', key: 'name' },
    { title: 'ROLE', key: 'roles' }, // Sementara
    { title: 'STATUS', key: 'status' },
    { title: 'ACTION', key: 'actions', sortable: false }
]

const users = ref()
const totalUsers = ref<number>(0)
const toPage = ref<number>(0)

const resolveUserStatusVariant = (stat: string) => {
    const statLowerCase = stat.toLowerCase()
    if (statLowerCase === 'pending')
        return 'secondary'
    if (statLowerCase === 'active')
        return 'success'

    return 'primary'
}

const fetchUsers = () => {
    axios.get('/user', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            users.value = response.data.data.data
            totalUsers.value = response.data.data.total
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => fetchUsers())

// Delete user
const user = ref()
const isDeleteDialogVisible = ref<boolean>(false)
const isDeleteLoading = ref<boolean>(false)

const deleteUser = () => {
    isDeleteLoading.value = true
    axios.delete(`/user/${user.value.id}`)
        .then((response) => {
            isDeleteLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            if(users.value.data.length <= 1) toPage.value -= 1
            fetchUsers()
        })
        .catch((e) => {
            isDeleteLoading.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
        })
}
</script>

<template>
    <VRow class="match-height">
        <VBreadcrumbs :items="['User', 'List']" />

        <VCol cols="12" class="h-full">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
            <VCard class="mt-5">
                <VCardItem>
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
                                    <VBtn @click="() => $router.push({
                                        name: 'users-form'
                                    })">Add User</VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="users">
                        <VDivider />
                        <VDataTable :headers="userHeaders" hide-default-footer :search="search" :items="users"
                            :items-per-page="options.per_page">
                            <!-- Name -->
                            <template #item.name="{ item }">
                                <div class="d-flex flex-row gap-4 align-items-center">
                                    <VImg :src="item.props.title.profile_photo_path ?? item.props.title.profile_photo_url"
                                        max-width="30" max-height="30" cover class="rounded-circle my-2" />
                                    <div class="d-flex flex-column gap-1">
                                        <span class="font-weight-bold">{{ item.props.title.name }}</span>
                                        <span class="text-lead">{{ item.props.title.email }}</span>
                                    </div>
                                </div>
                            </template>
                            <!-- Role -->
                            <template #item.roles="{ item }">
                                <!-- <span>{{ item.props.title.type_user ?? '-' }}</span> -->
                                <span v-for="(role, index) in item.raw.roles" :key="index">{{ role.name }}</span>
                            </template>
                            <template #item.status="{ item }">
                                <VChip label size="small" class="text-capitalize"
                                    :color="resolveUserStatusVariant(item.raw.status)">{{ item.raw.status }}</VChip>
                            </template>
                            <template #item.actions="{ item }">
                                <VMenu location="start">
                                    <template #activator="{ props }">
                                        <VBtn v-bind="props" variant="plain">
                                            <VIcon icon="tabler-dots-vertical" />
                                        </VBtn>
                                    </template>

                                    <VList>
                                        <VListItem class="cursor-pointer" v-if="item.props.title.status === 'active'"
                                            @click="() => $router.push({
                                                name: 'users-detail-id',
                                                params: { id: item.raw.id }
                                            })">Detail</VListItem>
                                        <VListItem class="cursor-pointer" v-else>Resend aktivasi</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            $router.push({
                                                name: 'users-form',
                                                query: { id: item.raw.id }
                                            })
                                        }">Edit</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDeleteDialogVisible = true
                                            user = item.raw
                                        }">Delete</VListItem>
                                    </VList>
                                </VMenu>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalUsers) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalUsers / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalUsers / options.per_page), options.last_page)" @next="(val) => toPage = val"
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

        <!-- Delete Limit Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete User">
            Are you sure want to delete user
            <span class="font-weight-bold">{{ user.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="isDeleteDialogVisible = false" :disabled="isDeleteLoading">Cancel</VBtn>
                        <VBtn :loading="isDeleteLoading" :disabled="isDeleteLoading" color="error" @click="deleteUser()">
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