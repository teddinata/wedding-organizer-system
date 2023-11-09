<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { requiredValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const search = ref<string>('')
const departments = ref()
const totalDepartments = ref<number>(0)
const toPage = ref<number>(0)

const departmentHeaders = [
    { title: 'NAME', key: 'name' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchDepartments = () => {
    axios.get('/department', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            departments.value = response.data.data
            totalDepartments.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, (val) => {
    if (val) fetchDepartments()
})
onMounted(() => fetchDepartments())
watch(
    () => options.per_page,
    () => fetchDepartments()
)

// Create and edit vendor department
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isMappingDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const departmentData = ref()
const payload = ref<{
    department: string | null
    payrollType: number | string | null
    isHasSchedule: number | null
    clockIn?: string
    clockOut?: string
}>({
    department: '',
    payrollType: 1,
    isHasSchedule: 0,
    clockIn: '',
    clockOut: ''
})

const isAlertDialogVisible = ref<boolean>(false)
const submitDepartment = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                let dataPayload
                if (payload.value.isHasSchedule === 0) {
                    dataPayload = {
                        name: payload.value.department,
                        payroll_type: payload.value.payrollType,
                        is_has_schedule: payload.value.isHasSchedule,
                    }
                } else {
                    dataPayload = {
                        name: payload.value.department,
                        payroll_type: payload.value.payrollType,
                        is_has_schedule: payload.value.isHasSchedule,
                        clock_in: payload.value.clockIn,
                        clock_out: payload.value.clockOut
                    }
                }

                if (departmentData.value === undefined) {
                    axios.post('/department', dataPayload)
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isAlertDialogVisible.value = false
                            isDialogVisible.value = false
                            payload.value = {
                                department: null,
                                isHasSchedule: null,
                                payrollType: null,
                                clockIn: undefined,
                                clockOut: undefined
                            }
                            fetchDepartments()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false;
                            isAlertDialogVisible.value = isError.value;
                            flashMessage.value.message = message
                            flashMessage.value.type = "error";
                            console.error(e.response);
                        })
                } else {
                    axios.put(`/department/${departmentData.value.id}`, dataPayload)
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isAlertDialogVisible.value = false
                            isDialogVisible.value = false
                            payload.value = {
                                department: null,
                                isHasSchedule: null,
                                payrollType: null,
                                clockIn: undefined,
                                clockOut: undefined
                            }
                            fetchDepartments()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false;
                            isAlertDialogVisible.value = isError.value;
                            flashMessage.value.message = message
                            flashMessage.value.type = "error";
                            console.error(e.response);
                        })
                }
            } else {
                isLoading.value = false
            }
        })
}

// Delete department
const isDeleteDialogVisible = ref<boolean>(false)
const deleteDepartment = () => {
    isLoading.value = true
    axios.delete(`/department/${departmentData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            departmentData.value = undefined
            payload.value = {
                department: null,
                isHasSchedule: null,
                payrollType: null,
            }
            if (departments.value.data.length <= 1) toPage.value -= 1
            fetchDepartments()
        })
        .catch((e) => {
            isLoading.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
        })
}

const isAlertMappingDialogVisible = ref<boolean>(false)
const payloadMapping = ref<{ department_id: number | null; allowance_id: number[] | null }>({
    department_id: null,
    allowance_id: null
})
const allowances = ref([])
const isLoadingMapping = ref<boolean>(false)
const fetchAllowance = async () => {
    axios.get('/allowance')
        .then((response) => {
            allowances.value = response.data.data.data
        })
        .catch((e) => console.error(e))
}
const deptAllowances = ref()
const fetchDeptAllowances = async () => {
    axios.get('/department-allowance', {
        params: { department_id: payloadMapping.value.department_id }
    })
        .then((response) => {
            deptAllowances.value = response.data.data
        })
        .catch((e) => console.error(e))
}
watch(() => isMappingDialogVisible.value, (val) => {
    if (val) {
        fetchAllowance()
        fetchDeptAllowances()
    }
})


const submitMappingAllowance = async () => {
    isLoadingMapping.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                axios.post('/department-allowance', payloadMapping.value)
                    .then((response) => {
                        flashMessage.value.message = response.data.message
                        isLoadingMapping.value = false
                        flashMessage.value.type = 'success'
                        isAlertVisible.value = true
                        fetchDeptAllowances()
                    })
                    .catch((e) => {
                        const error = e.response.data.message
                        isLoadingMapping.value = false;
                        isAlertMappingDialogVisible.value = true;
                        flashMessage.value.message = error
                        flashMessage.value.type = "error";
                        console.error(e.response);
                    })
            }
        })
    isLoadingMapping.value = false
}

const isDeletingDeptAllow = ref<boolean>(false)
const deleteDeptAllowance = async (dept_allowance_id: number) => {
    axios.delete(`/department-allowance/${dept_allowance_id}`)
        .then((response) => {
            isDeletingDeptAllow.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertMappingDialogVisible.value = true
            fetchDeptAllowances()
        })
        .catch((e) => {
            isDeletingDeptAllow.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertMappingDialogVisible.value = true
            console.error(e.response)
        })
}

const payrollType = ref([
    { title: 'Monthly', value: 1 },
    { title: 'Weekly', value: 2 }
])

const radioGroup = [
    { label: 'None', value: 0 },
    { label: 'Set Schedule', value: 1 }
]
</script>

<template>
    <VRow class="match-height">
        <VBreadcrumbs
            :items="[$route.fullPath.split('/')[1].toLocaleUpperCase(), $route.fullPath.split('/')[2].toLocaleUpperCase()]" />

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
                                    <VBtn @click="isDialogVisible = !isDialogVisible">
                                        Add Department
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="departments">
                        <VDivider />
                        <VDataTable :headers="departmentHeaders" hide-default-footer :search="search"
                            :items="departments.data" :items-per-page="options.per_page">
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isMappingDialogVisible = true
                                        payloadMapping.department_id = item.raw.id
                                    }">
                                        <VIcon icon="tabler-coin" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        departmentData = item.raw
                                        payload = {
                                            department: item.raw.name,
                                            isHasSchedule: Number(item.raw.is_has_schedule),
                                            payrollType: Number(item.raw.payroll_type),
                                            clockIn: item.raw.clock_in,
                                            clockOut: item.raw.clock_out
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        departmentData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalDepartments) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalDepartments / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalDepartments / options.per_page), options.last_page)"
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

        <!-- Add & Edit department Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                departmentData = undefined
                payload = {
                    department: null,
                    isHasSchedule: null,
                    payrollType: null,
                }
                if (isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ departmentData ? 'Edit' : 'Add' }} Department</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitDepartment()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.department" label="Department" type="text"
                                :rules="[requiredValidator]" placeholder="Ex. Operational" />
                        </VCol>
                        <VCol cols="12">
                            <AppSelect v-model="payload.payrollType" :items="payrollType" :menu-props="{ maxHeight: '400' }"
                                label="Select payroll type" item-title="title" item-value="value" persistent-hint
                                placeholder="Select payroll type" />
                        </VCol>
                        <VCol cols="12">
                            <p>Work Schedule</p>
                            <VRadioGroup v-model="payload.isHasSchedule">
                                <VRadio v-for="(radio, i) in radioGroup" :key="i" :label="radio.label"
                                    :value="radio.value" />
                            </VRadioGroup>
                        </VCol>
                        <VCol cols="12" v-if="payload.isHasSchedule === 1">
                            <VRow>
                                <VCol cols="12" md="6">
                                    <AppDateTimePicker v-model="payload.clockIn" label="Clock in"
                                        :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }" />
                                </VCol>
                                <VCol cols="12" md="6">
                                    <AppDateTimePicker v-model="payload.clockOut" label="Clock out"
                                        :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }" />
                                </VCol>
                            </VRow>
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="isLoading" :disabled="isLoading" type="submit">Save</VBtn>
                <VBtn type="reset" color="secondary" variant="tonal" class="mx-2">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>

        <!-- Mapping allowance dialog -->
        <MainDialog v-model:is-dialog-visible="isMappingDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                payloadMapping = {
                    allowance_id: null,
                    department_id: null
                }
                if (isAlertMappingDialogVisible) isAlertMappingDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center mb-3">List Allowance</h2>
                <FlashMessage v-model="isAlertMappingDialogVisible" :message="flashMessage.message"
                    :type="flashMessage.type" variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitMappingAllowance()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppSelect v-model="payloadMapping.allowance_id" :items="allowances"
                                placeholder="Select Allowance" label="Add Allowance" chips multiple closable-chips
                                item-title="name" item-value="id" :rules="[requiredValidator]" />
                        </VCol>
                        <VCol cols="12" v-if="deptAllowances">
                            <h3>Department Allowances</h3>
                            <VRow v-for="(deptAllowance, i) in deptAllowances" :key="i" class="my-1"
                                justify="space-between">
                                <VCol cols="10" class="my-auto">{{ deptAllowance.department_id }}</VCol>
                                <VCol cols="2">
                                    <VBtn size="38" color="error" @click="deleteDeptAllowance(deptAllowance.id)">
                                        <VIcon icon="tabler-trash" size="22" />
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="isLoadingMapping" :disabled="isLoadingMapping" type="submit">Save</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>

        <!-- Delete department Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Department" @update:is-dialog-visible="(val) => {
            if (!val) {
                departmentData = undefined
                payload = {
                    department: null,
                    isHasSchedule: null,
                    payrollType: 1,
                }
            }
            return
        }">
            Are you sure want to delete department
            <span class="font-weight-bold">{{ departmentData && departmentData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            departmentData = undefined
                            payload = {
                                department: null,
                                isHasSchedule: null,
                                payrollType: 1,
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteDepartment()">
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