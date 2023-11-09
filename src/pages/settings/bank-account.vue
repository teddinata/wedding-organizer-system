<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { requiredValidator, integerBetweenValidator, stringLengthBetweenValidator, alphaValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const search = ref<string>('')
const banks = ref()
const totalBank = ref<number>(0)
const toPage = ref<number>(0)

const bankHeaders = [
    { title: 'BANK', key: 'bank' },
    { title: 'ACCOUNT NUMBER', key: 'account_number' },
    { title: 'ACCOUNT NAME', key: 'account_holder' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchBank = () => {
    axios.get('/bank-account', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            banks.value = response.data.data
            totalBank.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => fetchBank())
watch(() => toPage.value, (val) => {
    if (val) fetchBank()
})
watch(
    () => options.per_page,
    () => fetchBank()
)

// Create and edit vendor bank
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const bankData = ref()
const payload = ref<{
    bank: string | null,
    account_holder: string | null,
    account_number: string | number | null
}>({
    bank: '',
    account_holder: '',
    account_number: null
})

const isAlertDialogVisible = ref<boolean>(false)
const submitBank = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (bankData.value === undefined) {

                    axios.post('/bank-account', {
                        bank: payload.value.bank,
                        account_holder: payload.value.account_holder,
                        account_number: payload.value.account_number
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                account_holder: null,
                                account_number: null,
                                bank: null
                            }
                            fetchBank()
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
                    axios.put(`/bank-account/${bankData.value.id}`, {
                        bank: payload.value.bank,
                        account_holder: payload.value.account_holder,
                        account_number: payload.value.account_number
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                account_holder: null,
                                account_number: null,
                                bank: null
                            }
                            bankData.value = undefined
                            fetchBank()
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

// Delete bank
const isDeleteDialogVisible = ref<boolean>(false)
const deleteBank = () => {
    isLoading.value = true
    axios.delete(`/bank-account/${bankData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            bankData.value = undefined
            if(banks.value.data.length <= 1) toPage.value -= 1
            fetchBank()
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
                    <div class="mt-5" v-if="banks">
                        <VDivider />
                        <VDataTable :headers="bankHeaders" hide-default-footer :search="search" :items="banks.data"
                            :items-per-page="options.per_page">
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        bankData = item.raw
                                        payload = {
                                            account_holder: item.raw.account_holder,
                                            account_number: item.raw.account_number,
                                            bank: item.raw.bank
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        bankData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalBank) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalBank / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalBank / options.per_page), options.last_page)" @next="(val) => toPage = val"
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

        <!-- Add & Edit bank Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                bankData = undefined
                payload = {
                    account_holder: null,
                    account_number: null,
                    bank: null
                }
                if(isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }
            ">
            <div class="mx-auto">
                <h2 class="text-center">{{ bankData ? 'Edit' : 'Add' }} Bank</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" class="mt-4" />
                <VForm ref="refVForm" @submit.prevent="submitBank()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.bank" label="Name" type="text"
                                :rules="[requiredValidator, stringLengthBetweenValidator(payload.bank as string, 3, 30), alphaValidator]"
                                placeholder="Ex. BCA" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.account_number" label="Account Number" type="text"
                                :rules="[requiredValidator, integerBetweenValidator(payload.account_number as string, 7, 16)]"
                                placeholder="Ex. 12345678" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.account_holder" label="Account Name" type="text"
                                :rules="[requiredValidator, stringLengthBetweenValidator(payload.account_holder as string, 3, 50), alphaValidator]"
                                placeholder="Ex. Gita" />
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

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Bank" @update:is-dialog-visible="(val) => {
            if (!val) {
                bankData = undefined
                payload = {
                    account_holder: null,
                    account_number: null,
                    bank: null
                }
            }
            return
        }">
            Are you sure want to delete bank
            <span class="font-weight-bold">{{ bankData && bankData.account_holder }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            bankData = undefined
                            payload = {
                                account_holder: null,
                                account_number: null,
                                bank: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteBank()">
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