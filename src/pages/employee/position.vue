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
const positions = ref()
const totalPosition = ref<number>(0)
const toPage = ref<number>(0)

const positionHeaders = [
    { title: 'NAME', key: 'name' },
    { title: 'DEPARTMENT', key: 'department.name' },
    { title: 'LEVEL', key: 'career_level.career_level' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchPosition = () => {
    axios.get('/position', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            positions.value = response.data.data
            totalPosition.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, (val) => {
    if (val) fetchPosition()
})

onMounted(() => fetchPosition())
watch(
    () => options.per_page,
    () => fetchPosition()
)

// Create and edit vendor position
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const positionData = ref()
const payload = ref<{
    name: string | null,
    department_id: number | string | null
    career_level_id: number | string | null
}>({
    name: '',
    department_id: null,
    career_level_id: null
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

const careerLevels = ref()
watch(() => isDialogVisible.value, (val) => {
    if (val) {
        axios.get('/career-level')
            .then((response) => {
                careerLevels.value = response.data.data
            })
            .catch((e) => console.error(e))
    }
})

const isAlertDialogVisible = ref<boolean>(false)
const submitPosition = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (positionData.value === undefined) {
                    axios.post('/position', {
                        name: payload.value.name,
                        department_id: payload.value.department_id,
                        career_level_id: payload.value.career_level_id
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                department_id: null,
                                name: null,
                                career_level_id: null
                            }
                            fetchPosition()
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
                    console.log(payload.value.department_id)
                    axios.put(`/position/${positionData.value.id}`, {
                        name: payload.value.name,
                        department_id: payload.value.department_id,
                        career_level_id: payload.value.career_level_id
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                department_id: null,
                                name: null,
                                career_level_id: null
                            }
                            positionData.value = undefined
                            fetchPosition()
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

// Delete position
const isDeleteDialogVisible = ref<boolean>(false)
const deletePosition = () => {
    isLoading.value = true
    axios.delete(`/position/${positionData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            positionData.value = undefined
            if (positions.value.data.length <= 1) toPage.value -= 1
            fetchPosition()
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
                    <div class="mt-5" v-if="positions">
                        <VDivider />
                        <VDataTable :headers="positionHeaders" hide-default-footer :search="search" :items="positions.data"
                            :items-per-page="options.per_page">
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        positionData = item.raw
                                        payload = {
                                            department_id: item.raw.department.id,
                                            name: item.raw.name,
                                            career_level_id: item.raw.career_level.id
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        positionData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalPosition) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalPosition / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalPosition / options.per_page), options.last_page)"
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

        <!-- Add & Edit Position Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                positionData = undefined
                payload = {
                    department_id: null,
                    name: null,
                    career_level_id: null
                }
                if (isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center mb-5">{{ positionData ? 'Edit' : 'Add' }} Position</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitPosition()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppSelect v-model="payload.department_id" :items="departments"
                                :menu-props="{ maxHeight: '400' }" label="Departments" item-title="name" item-value="id"
                                persistent-hint placeholder="Select Department" />
                        </VCol>
                        <VCol cols="12">
                            <AppSelect v-model="payload.career_level_id" :items="careerLevels"
                                :menu-props="{ maxHeight: '400' }" label="Career Level" item-title="career_level"
                                item-value="id" persistent-hint placeholder="Select Career Level" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Position" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Coordinator" />
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

        <!-- Delete position Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Position" @update:is-dialog-visible="(val) => {
            if (!val) {
                positionData = undefined
                payload = {
                    department_id: null,
                    name: null,
                    career_level_id: null
                }
            }
            return
        }">
            Are you sure want to delete position
            <span class="font-weight-bold">{{ positionData && positionData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            positionData = undefined
                            payload = {
                                department_id: null,
                                name: null,
                                career_level_id: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deletePosition()">
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