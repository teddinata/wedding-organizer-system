<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { requiredValidator, currencyIndonesiaValidator, currencyIndonesiaBetweenValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const search = ref<string>('')
const installments = ref()
const totalInstallment = ref<number>(0)
const toPage = ref<number>(0)

const nominalHeaders = [
    { title: 'NOMINAL', key: 'nominal' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchInstallment = () => {
    axios.get('/config-installment', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            installments.value = response.data.data
            totalInstallment.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, (val) => {
    if(val) fetchInstallment()
})

onMounted(() => fetchInstallment())
watch(
    () => options.per_page,
    () => fetchInstallment()
)

// Create and edit vendor installment
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const installmentData = ref()
const payload = ref<{ nominal: string | null }>({
    nominal: '',
})

watch(() => payload.value.nominal, (newValue, oldValue) => {
    if (newValue && oldValue) {
        if (newValue !== oldValue) {
            let cleanedValue = newValue.replace(/\D/g, '').replace(/^0+/, '');

            if (cleanedValue.length > 0) {
                cleanedValue = new Intl.NumberFormat('id-ID').format(+cleanedValue);
            }

            payload.value.nominal = cleanedValue;
        }
    }
})

const isAlertDialogVisible = ref<boolean>(false)
const submitInstallment = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (installmentData.value == undefined) {
                    axios.post('/config-installment', {
                        nominal: payload.value.nominal?.replaceAll('.', ''),
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                nominal: null
                            }
                            fetchInstallment()
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
                    axios.put(`/config-installment/${installmentData.value.id}`, {
                        nominal: payload.value.nominal?.replaceAll('.', ''),
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                nominal: null
                            }
                            fetchInstallment()
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

// Delete installment
const isDeleteDialogVisible = ref<boolean>(false)
const deleteInstallment = () => {
    isLoading.value = true
    axios.delete(`/config-installment/${installmentData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            installmentData.value = undefined
            if(installments.value.data.length <= 1) toPage.value -= 1
            fetchInstallment()
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
                    <div class="mt-5" v-if="installments">
                        <VDivider />
                        <VDataTable :headers="nominalHeaders" hide-default-footer :search="search"
                            :items="installments.data" :items-per-page="options.per_page">
                            <template #item.nominal="{ item }">
                                <span>Rp {{ new Intl.NumberFormat('id-ID').format(item.raw.nominal) }}</span>
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        installmentData = item.raw
                                        payload = {
                                            nominal: item.raw.nominal
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        installmentData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalInstallment) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalInstallment / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalInstallment / options.per_page), options.last_page)"
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

        <!-- Add & Edit installment Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                installmentData = undefined
                payload = {
                    nominal: null
                }
                if(isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }
            ">
            <div class="mx-auto">
                <h2 class="text-center">{{ installmentData ? 'Edit' : 'Add' }} installment</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitInstallment()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.nominal" label="Nominal" type="text"
                                :rules="[requiredValidator, currencyIndonesiaBetweenValidator(payload.nominal, 50000, 1000000)]"
                                placeholder="Rp. 0" />
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

        <!-- Delete installment Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Installment" @update:is-dialog-visible="(val) => {
            if (!val) {
                installmentData = undefined
                payload = {
                    nominal: null
                }
            }
            return
        }">
            Are you sure want to delete installment
            <span class="font-weight-bold">Rp {{ installmentData && new
                Intl.NumberFormat('id-ID').format(installmentData.nominal) }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            installmentData = undefined
                            payload = {
                                nominal: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteInstallment()">
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