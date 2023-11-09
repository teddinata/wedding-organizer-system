<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import roles from '@images/illustrations/roles.png'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const users = ref()
const search = ref<string>()
const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const toPage = ref<number>(0)

const fetchUsers = () => {
    axios.get('/user')
        .then((response) => {
            console.log(response.data.data)
            users.value = response.data.data
            console.log(users.value.total)
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => fetchUsers())

const roleHeaders = [
    { title: 'PERMISSION', key: 'permission' }, // Sementara
    { title: 'ASSIGNED TO', key: 'assigned_to' },
    { title: 'ACTIONs', key: 'actions', sortable: false }
]

const resolveUserStatusVariant = (stat: string) => {
    const statLowerCase = stat.toLowerCase()
    if (statLowerCase === 'Manager')
        return 'warning'
    if (statLowerCase === 'Super Admin')
        return 'primary'
    if (statLowerCase === 'Admin Vendor')
        return 'info'

    return 'primary'
}
</script>

<template>
    <VRow class="match-height" v-if="users">
        <VBreadcrumbs :items="['Roles & Permissions', 'List']" />
        <VCol cols="12">
            <VRow>
                <VCol cols="12" sm="6" lg="4">
                    <VCard>
                        <VCardText class="d-flex align-center pb-1">
                            <span>Total {{ users.total }} users</span>
                            <VSpacer />

                            <div class="v-avatar-group">
                                <template v-for="(user, index) in users.data" :key="user">
                                    <VAvatar v-if="users.data.length > 4 && users.data.length !== 4 && index < 3" size="36"
                                        :image="user.profile_photo_path ?? user.profile_photo_url" />

                                    <VAvatar v-if="users.data.length === 4" size="36"
                                        :image="user.profile_photo_path ?? user.profile_photo_url" />
                                </template>
                                <VAvatar v-if="users.data.length > 4"
                                    :color="$vuetify.theme.current.dark ? '#4A5072' : '#f6f6f7'">
                                    <span>
                                        +{{ users.data.length - 3 }}
                                    </span>
                                </VAvatar>
                            </div>
                        </VCardText>

                        <VCardText class="pb-5">
                            <h4 class="text-h4">
                                Administrator
                            </h4>
                            <div class="d-flex align-center">
                                <a href="javascript:void(0)" @click="() => { }">
                                    Edit Role
                                </a>

                                <VSpacer />
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>

                <VCol cols="12" sm="6" lg="4">
                    <VCard class="h-100" :ripple="false" @click="() => { }">
                        <VRow no-gutters class="h-100">
                            <VCol cols="5" class="d-flex flex-column justify-end align-center mt-5">
                                <img width="105" :src="roles">
                            </VCol>

                            <VCol cols="7">
                                <VCardText class="d-flex flex-column align-end justify-end gap-2 h-100"
                                    style="text-align: end;">
                                    <VBtn>Add New Role</VBtn>
                                    <span>Add role, if it doesn't exist.</span>
                                </VCardText>
                            </VCol>
                        </VRow>
                    </VCard>
                </VCol>
            </VRow>
            <VRow>
                <VCol cols="12">
                    <VCard class="mt-5">
                        <VCardItem>
                            <VRow justify="space-between">
                                <VCol cols="12" md="2" sm="6">
                                    <AppSelect v-model="options.per_page" :items="[10, 20, 30, 40]" />
                                </VCol>
                                <VCol cols="12" md="6" sm="6">
                                    <VRow>
                                        <VCol cols="8">
                                            <AppTextField v-model="search" density="compact" placeholder="Search"
                                                single-line hide-details dense outlined />
                                        </VCol>
                                        <VCol cols="4">
                                            <VBtn @click="() => $router.push({
                                                name: 'users-form'
                                            })">Add Permission</VBtn>
                                        </VCol>
                                    </VRow>
                                </VCol>
                            </VRow>
                            <div class="mt-5" v-if="users">
                                <VDivider />
                                <VDataTable :headers="roleHeaders" hide-default-footer :search="search" :items="users.data"
                                    :items-per-page="options.per_page">
                                    <!-- Name -->
                                    <template #item.name="{ item }">
                                        <div class="d-flex flex-row gap-4 align-items-center">
                                            <VImg
                                                :src="item.props.title.profile_photo_path ?? item.props.title.profile_photo_url"
                                                max-width="30" max-height="30" cover class="rounded-circle my-2" />
                                            <div class="d-flex flex-column gap-1">
                                                <span class="font-weight-bold">{{ item.props.title.name }}</span>
                                                <span class="text-lead">{{ item.props.title.email }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <!-- Role -->
                                    <template #item.type_user="{ item }">
                                        <span>{{ item.props.title.type_user ?? '-' }}</span>
                                    </template>
                                    <template #item.status="{ item }">
                                        <VChip label size="small" class="text-capitalize"
                                            :color="resolveUserStatusVariant(item.raw.status)">{{ item.raw.status }}</VChip>
                                    </template>
                                    <template #item.actions="{ item }">
                                        <div class="d-flex gap-1">
                                            <IconBtn @click="() => {}">
                                                <VIcon icon="tabler-edit" />
                                            </IconBtn>
                                            <IconBtn @click="() => {}">
                                                <VIcon icon="tabler-trash" />
                                            </IconBtn>
                                        </div>
                                    </template>
                                    <template #bottom>
                                        <VDivider />

                                        <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                            <p class="text-sm text-disabled mb-0">
                                                {{ paginationMeta(options as Options, users.total) }}
                                            </p>
                                            <VPagination v-model="options.current_page"
                                                :total-visible="Math.min(Math.ceil(users.total / 10), 2)"
                                                :length="Math.min(Math.ceil(users.total / 10), 2)"
                                                @next="(val) => toPage = val" @prev="(val) => toPage = val"
                                                @update:model-value="(val) => toPage = val">
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
            </VRow>
        </VCol>
    </VRow>
</template>