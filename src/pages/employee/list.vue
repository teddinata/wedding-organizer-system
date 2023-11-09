<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }
type FlashMessageType = 'success' | 'info' | 'warning' | 'error'

const search = ref<string>('')
const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const employees = ref()
const totalEmployee = ref<number>(0)
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

const employeeListHeaders = [
    { title: 'EMPLOYEE NUMBER', key: 'employee_number' },
    { title: 'EMPLOYEE NAME', key: 'fullname' },
    { title: 'DEPARTMENT', key: 'department.name' },
    { title: 'POSITION', key: 'position.name' },
    { title: 'STATUS', key: 'is_active' },
    { title: 'ACTION', key: 'action', sortable: false }
]

const department_id = ref<number>()
const position_id = ref<number>()

const fetchEmployees = () => {
    axios.get('/employee', {
        params: {
            page: options.current_page,
            per_page: options.per_page,
            department_id: department_id.value,
            position_id: position_id.value
        }
    })
        .then((response) => {
            employees.value = response.data.data
            totalEmployee.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data_last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

// Fetch department
const departments = ref()
const fetchDepartments = () => {
    axios.get(`/department`)
        .then((response) => {
            departments.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

// Fetch positions
const positions = ref()
const fetchPositions = () => {
    axios.get('/position')
        .then((response) => {
            positions.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(toPage, () => fetchEmployees())
watch(
    () => options.per_page,
    () => fetchEmployees()
)

watch(department_id, () => fetchEmployees())
watch(position_id, () => fetchEmployees())

onMounted(() => {
    fetchEmployees()
    fetchPositions()
    fetchDepartments()
})
const employeeData = ref()
const loadingDelete = ref<boolean>(false)
const isDeleteDialogVisible = ref<boolean>(false)

const deleteEmployee = () => {
    loadingDelete.value = true
    axios.delete(`/employee/${employeeData.value.id}`)
        .then((response) => {
            loadingDelete.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            if (employees.value.data.length <= 1) toPage.value -= 1
            fetchEmployees()
        })
        .catch((e) => {
            loadingDelete.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
        })
}

const resolveUserStatusVariant = (stat: string) => {
    if (stat == '1')
        return 'success'
    if (stat == '0')
        return 'error'
}
</script>

<template>
    <VRow class="match-height">
        <VCol cols="12">
            <VBreadcrumbs :items="['Employee', 'List']" />
        </VCol>

        <VCol cols="12">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
        </VCol>

        <VCol cols="12" class="h-full">
            <VCard>
                <VCardItem>
                    <VRow>
                        <VCol cols="12">
                            <span class="text-lg font-weight-bold">Search Filter</span>
                        </VCol>
                    </VRow>
                    <VRow class="mb-3">
                        <VCol cols="12" md="4">
                            <AppSelect v-model="department_id" :items="departments" item-title="name" item-value="id"
                                :menu-props="{ maxHeight: '400' }" placeholder="Select department" clearable
                                clear-icon="tabler-x" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <AppSelect v-model="position_id" :items="positions" item-title="name" item-value="id"
                                :menu-props="{ maxHeight: '400' }" placeholder="Select position" clearable
                                clear-icon="tabler-x" />
                        </VCol>
                        <VCol cols="12" md="4">
                            <AppSelect :items="['Active', 'Deactive']" :menu-props="{ maxHeight: '400' }"
                                placeholder="Select status" clearable clear-icon="tabler-x" />
                        </VCol>
                    </VRow>

                    <VDivider />

                    <VRow justify="space-between" class="mt-3">
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
                                    <VBtn @click="() => {
                                        $router.push({
                                            name: 'employee-tab',
                                            params: { tab: 'personal-information' }
                                        })
                                    }">Add Employee</VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>

                    <div class="mt-5" v-if="employees">
                        <VDataTable :headers="employeeListHeaders" hide-default-footer :search="search"
                            :items="employees.data" :items-per-page="options.per_page">
                            <template #item.fullname="{ item }">
                                <div class="d-flex align-center">
                                    <VAvatar size="38" :variant="!item.raw.photo ? 'tonal' : undefined" class="me-3">
                                        <VImg
                                            :src="'https://dev.goodsoneid.com/storage/uploads/employee/' + item.raw.photo" />
                                    </VAvatar>
                                    <div class="d-flex flex-column">
                                        <h6 class="text-body-1 font-weight-medium mb-0">
                                            {{ item.raw.fullname }}
                                        </h6>
                                        <span class="text-sm">{{ item.raw.email }}</span>
                                    </div>
                                </div>
                            </template>
                            <template #item.is_active="{ item }">
                                <VChip label size="small" class="text-capitalize"
                                    :color="resolveUserStatusVariant(item.raw.is_active)">{{ item.raw.is_active === '1' ?
                                        'Active' : 'Deactive' }}</VChip>
                            </template>
                            <template #item.action="{ item }">
                                <VMenu location="start">
                                    <template #activator="{ props }">
                                        <VBtn v-bind="props" variant="plain">
                                            <VIcon icon="tabler-dots-vertical" />
                                        </VBtn>
                                    </template>

                                    <VList v-if="item.raw.is_active === '1'">
                                        <VListItem class="cursor-pointer" @click="() => {
                                            $router.push({
                                                name: 'employee-detail-id',
                                                params: { id: item.raw.id }
                                            })
                                        }">Detail</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            $router.push({
                                                name: 'employee-tab',
                                                query: { id: item.raw.id },
                                                params: { tab: 'personal-information' }
                                            })
                                        }">Edit</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => { }">Delete</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            $router.push({
                                                name: 'employee-user-account-id',
                                                params: { id: item.raw.id }
                                            })
                                        }">User's Account</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => { }">Employee Point</VListItem>
                                    </VList>
                                    <VList v-else>
                                        <VListItem class="cursor-pointer" @click="() => { }">Detail</VListItem>
                                    </VList>
                                </VMenu>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalEmployee) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalEmployee / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalEmployee / options.per_page), options.last_page)"
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

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Department" @update:is-dialog-visible="(val) => {
            if (!val) {
                employeeData = undefined
            }
            return
        }">
            Are you sure want to delete employee
            <span class="font-weight-bold">{{ employeeData && employeeData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            employeeData = undefined
                        }" :disabled="loadingDelete">Cancel</VBtn>
                        <VBtn :loading="loadingDelete" :disabled="loadingDelete" color="error" @click="deleteEmployee()">
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