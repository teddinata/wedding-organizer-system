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
const allowances = ref()
const totalAllowance = ref<number>(0)
const toPage = ref<number>(0)

const allowanceHeaders = [
    { title: 'NAME', key: 'name' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchAllowance = () => {
    axios.get('/allowance', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            allowances.value = response.data.data
            totalAllowance.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, () => fetchAllowance())

onMounted(() => fetchAllowance())
watch(
    () => options.per_page,
    () => fetchAllowance()
)

// Create and edit vendor allowance
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const allowanceData = ref()
const payload = ref<{
    name: string | null,
}>({
    name: '',
})

// fetch department
const departments = ref()
watch(() => isDialogVisible.value, (val) => {
    if (val) {
        axios.get('/department')
            .then((response) => {
                departments.value = response.data.data.data
            })
            .catch((e) => console.error(e))
    }
})

const isAlertDialogVisible = ref<boolean>(false)
const submitAllowance = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (allowanceData.value === undefined) {
                    axios.post('/allowance', {
                        name: payload.value.name,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                name: null
                            }
                            fetchAllowance()
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
                    axios.put(`/allowance/${allowanceData.value.id}`, {
                        name: payload.value.name,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                name: null
                            }
                            fetchAllowance()
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

// Delete allowance
const isDeleteDialogVisible = ref<boolean>(false)
const deleteAllowance = () => {
    isLoading.value = true
    axios.delete(`/allowance/${allowanceData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            allowanceData.value = undefined
            if (allowances.value.data.length <= 1) toPage.value -= 1
            fetchAllowance()
        })
        .catch((e) => {
            isLoading.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
        })
}
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
                                        <VIcon start icon="tabler-plus" />Add New
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="allowances">
                        <VDivider />
                        <VDataTable :headers="allowanceHeaders" hide-default-footer :search="search"
                            :items="allowances.data" :items-per-page="options.per_page">
                            <template #item.department.name="{ item }">
                                <VChip label size="small" class="text-capitalize" color="primary">{{
                                    item.raw.department.name }}</VChip>
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        allowanceData = item.raw
                                        payload = {
                                            name: item.raw.name
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        allowanceData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalAllowance) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalAllowance / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalAllowance / options.per_page), options.last_page)"
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

        <!-- Add & Edit allowance Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                allowanceData = undefined
                payload = {
                    name: null
                }
                if (isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ allowanceData ? 'Edit' : 'Add' }} Allowance</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitAllowance()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Allowance" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Transport" />
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

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Allowance" @update:is-dialog-visible="(val) => {
            if (!val) {
                allowanceData = undefined
                payload = {
                    name: null
                }
            }
            return
        }">
            Are you sure want to delete allowance
            <span class="font-weight-bold">{{ allowanceData && allowanceData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            allowanceData = undefined
                            payload = {
                                name: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteAllowance()">
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