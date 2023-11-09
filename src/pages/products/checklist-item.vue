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
const checklistItem = ref()
const totalChecklistItem = ref<number>(0)
const toPage = ref<number>(0)

const checklistHeaders = [
    { title: 'CHECKLIST TYPE', key: 'checklist_category.name' },
    { title: 'PRODUCT NAME', key: 'name' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchChecklistItem = () => {
    axios.get('/checklist-item', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            checklistItem.value = response.data.data
            totalChecklistItem.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}


watch(() => toPage.value, (val) => {
    if(val) fetchChecklistItem()
})
onMounted(() => fetchChecklistItem())

// Create and edit vendor checklist
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const checkListItemData = ref()
const payload = ref<{ name: string | null; checklist_category_id?: string | null }>({
    name: '',
    checklist_category_id: undefined
})

// Fetch checklistCategory
const checklistCategory = ref()
const fetchChecklistCategory = () => {
    axios.get("/checklist-category")
        .then((response) => {
            checklistCategory.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => isDialogVisible.value, (val) => {
    if (val) fetchChecklistCategory()
    else isDialogVisible.value = false
})

const isAlertDialogVisible = ref<boolean>(false)
const submitChecklistItem = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (checkListItemData.value === undefined) {
                    axios.post('/checklist-item', {
                        name: payload.value.name,
                        checklist_category_id: payload.value.checklist_category_id,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                name: null,
                                checklist_category_id: null
                            }
                            fetchChecklistItem()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false;
                            isAlertDialogVisible.value = isError.value;
                            flashMessage.value.message = message
                            flashMessage.value.type = "error";
                            payload.value = {
                                name: null,
                                checklist_category_id: null
                            }
                            console.error(e.response);
                        })
                } else {
                    axios.put(`/checklist-item/${checkListItemData.value.id}`, {
                        name: payload.value.name,
                        checklist_category_id: payload.value.checklist_category_id,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                name: null,
                                checklist_category_id: null
                            }
                            checkListItemData.value = undefined
                            fetchChecklistItem()
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

// Delete checklist item
const isDeleteDialogVisible = ref<boolean>(false)
const deleteChecklistItem = () => {
    isLoading.value = true
    axios.delete(`/checklist-item/${checkListItemData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            checkListItemData.value = undefined
            payload.value = {
                name: null,
                checklist_category_id: null
            }
            if(checklistItem.value.data.length <= 1) toPage.value -= 1
            fetchChecklistItem()
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
                                    <VBtn @click="isDialogVisible = !isDialogVisible">Add Checklist</VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="checklistItem">
                        <VDivider />
                        <VDataTable :headers="checklistHeaders" hide-default-footer :search="search"
                            :items="checklistItem.data" :items-per-page="options.per_page">
                            <template #item.description="{ item }">
                                <span>{{ item.props.title.description ?? '-' }}</span>
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        checkListItemData = item.raw
                                        payload = {
                                            name: item.raw.name,
                                            checklist_category_id: item.raw.checklist_category.id
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        checkListItemData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalChecklistItem) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalChecklistItem / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalChecklistItem / options.per_page), options.last_page)"
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

        <!-- Add & Edit Checklist Item Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                checkListItemData = undefined
                payload = {
                    name: null,
                    checklist_category_id: null
                }
                if(isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ checkListItemData ? 'Edit' : 'Add' }} List</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitChecklistItem()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Name" type="text" :rules="[requiredValidator]"
                                placeholder="Input Equipment" />
                        </VCol>
                        <VCol cols="12">
                            <AppSelect v-model="payload.checklist_category_id" label="Checklist Type" type="text"
                                :rules="[requiredValidator]" item-value="id" item-title="name" :items="checklistCategory"
                                placeholder="Select Type" />
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="isLoading" :disabled="isLoading" type="submit">Save</VBtn>
                                <VBtn type="reset" variant="tonal" color="secondary" class="mx-2">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>

        <!-- Delete Checklist Item Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Checklist" @update:is-dialog-visible="(val) => {
            if (!val) {
                checkListItemData = undefined
                payload = {
                    name: null,
                    checklist_category_id: null
                }
            }
            return
        }">
            Are you sure want to delete checklist
            <span class="font-weight-bold">{{ checkListItemData && checkListItemData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            checkListItemData = undefined
                            payload = {
                                name: null,
                                checklist_category_id: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteChecklistItem()">
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