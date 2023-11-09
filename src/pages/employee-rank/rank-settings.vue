<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { requiredValidator, integerValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const search = ref<string>('')
const employeeRank = ref()
const totalEmployeeRank = ref<number>(0)
const toPage = ref<number>(0)

const employeeRankHeader = [
    { title: 'TIER', key: 'name' },
    { title: 'FROM', key: 'from' },
    { title: 'TO', key: 'until' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchEmployeeRank = () => {
    axios.get('/level', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            employeeRank.value = response.data.data
            totalEmployeeRank.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, (val) => {
    if(val) fetchEmployeeRank()
})

onMounted(() => fetchEmployeeRank())
watch(
    () => options.per_page,
    () => fetchEmployeeRank()
)

// Create and edit vendor employee rank
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const employeeRankData = ref()
const payload = ref<{ name: string | null; from: string | null; until: string | null }>({
    name: '',
    from: '',
    until: ''
})

const isAlertDialogVisible = ref<boolean>(false)
const submitEmployeeRank = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (employeeRankData.value === undefined) {
                    axios.post('/level', {
                        name: payload.value.name,
                        from: payload.value.from,
                        until: payload.value.until
                    }, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                from: null,
                                name: null, 
                                until: null
                            }
                            fetchEmployeeRank()
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
                    axios.put(`/level/${employeeRankData.value.id}`, {
                        name: payload.value.name,
                        from: payload.value.from,
                        until: payload.value.until,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                from: null,
                                name: null, 
                                until: null
                            }
                            fetchEmployeeRank()
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

// Delete rank
const isDeleteDialogVisible = ref<boolean>(false)
const deleteEmployeeRank = () => {
    isLoading.value = true
    axios.delete(`/level/${employeeRankData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            employeeRankData.value = undefined
            if(employeeRank.value.data.length <= 1) toPage.value -= 1
            fetchEmployeeRank()
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
                                        <VIcon start icon="tabler-plus" />Add Rank
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="employeeRank">
                        <VDivider />
                        <VDataTable :headers="employeeRankHeader" hide-default-footer :search="search"
                            :items="employeeRank.data" :items-per-page="options.per_page">
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        employeeRankData = item.raw
                                        payload = {
                                            name: item.raw.name,
                                            from: item.raw.from,
                                            until: item.raw.until,
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        employeeRankData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalEmployeeRank) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalEmployeeRank / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalEmployeeRank / options.per_page), options.last_page)"
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

        <!-- Add & Edit Rank Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                employeeRankData = undefined
                payload = {
                    from: null,
                    name: null,
                    until: null
                }
                if(isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ employeeRankData ? 'Edit' : 'Add' }} Rank</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" class="mt-4" />
                <VForm ref="refVForm" @submit.prevent="submitEmployeeRank()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Name" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Bronze" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.from" label="Point From" type="text" :rules="[requiredValidator, integerValidator]"
                                placeholder="Rp 0" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.until" label="Point To" type="text" :rules="[requiredValidator, integerValidator]"
                                placeholder="Rp 0" />
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

        <!-- Delete Rank Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Rank" @update:is-dialog-visible="(val) => {
            if (!val) {
                employeeRankData = undefined
                payload = {
                    from: null,
                    name: null,
                    until: null
                }
            }
            return
        }">
            Are you sure want to delete rank
            <span class="font-weight-bold">{{ employeeRankData && employeeRankData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            employeeRankData = undefined
                            payload = {
                                from: null,
                                name: null,
                                until: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteEmployeeRank()">
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