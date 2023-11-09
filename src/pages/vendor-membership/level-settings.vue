<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { requiredValidator, currencyIndonesiaValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const search = ref<string>('')
const membershipList = ref()
const totalMembership = ref<number>(0)
const toPage = ref<number>(0)

const membershipListHeader = [
    { title: 'ICON', key: 'image' },
    { title: 'TIER', key: 'name' },
    { title: 'FROM', key: 'from' },
    { title: 'TO', key: 'until' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchMembershipList = () => {
    axios.get('/membership', {
        params: {
            topage: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            membershipList.value = response.data.data
            totalMembership.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(() => toPage.value, (val) => {
    if(val) fetchMembershipList()
})

onMounted(() => fetchMembershipList())
watch(
    () => options.per_page,
    () => fetchMembershipList()
)

// Create and edit vendor membership
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const membershipData = ref()
const payload = ref<{ name: string | null; image?: string; from: string | null; until: string | null }>({
    name: '',
    from: '',
    until: ''
})
const image = ref()

watch(() => payload.value.from, (newValue, oldValue) => {
    if (newValue && oldValue) {
        if (newValue !== oldValue) {
            let cleanedValue = newValue.replace(/\D/g, '').replace(/^0+/, '');

            if (cleanedValue.length > 0) {
                cleanedValue = new Intl.NumberFormat('id-ID').format(+cleanedValue);
            }

            payload.value.from = cleanedValue;
        }
    }
})

watch(() => payload.value.until, (newValue, oldValue) => {
    if (newValue && oldValue) {
        if (newValue !== oldValue) {
            let cleanedValue = newValue.replace(/\D/g, '').replace(/^0+/, '');

            if (cleanedValue.length > 0) {
                cleanedValue = new Intl.NumberFormat('id-ID').format(+cleanedValue);
            }

            payload.value.until = cleanedValue;
        }
    }
})

const refUploadImg = ref<HTMLElement>()
const uploadImage = (event: Event) => {
    if (event.target && event.target instanceof HTMLInputElement) {
        image.value = event.target.files?.[0];
    }
};

const isAlertDialogVisible = ref<boolean>(false)
const submitMembership = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (membershipData.value === undefined) {
                    const formData = new FormData();
                    if(image.value) formData.append("image", image.value[0]);

                    formData.append("name", payload.value.name as string);
                    formData.append("from", payload.value.from?.replaceAll('.', '') as string);
                    formData.append("until", payload.value.until?.replaceAll('.', '') as string);
                    formData.append("point", '0');

                    axios.post('/membership', formData, {
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
                                until: null,
                                image: undefined
                            }
                            fetchMembershipList()
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
                    axios.put(`/membership/${membershipData.value.id}`, {
                        name: payload.value.name,
                        from: +payload.value.from!.replaceAll('.', ''),
                        until: +payload.value.until!.replaceAll('.', ''),
                        image: image.value[0],
                        point: 0
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
                                until: null,
                                image: undefined
                            }
                            fetchMembershipList()
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

// Delete limit
const isDeleteDialogVisible = ref<boolean>(false)
const deleteMembership = () => {
    isLoading.value = true
    axios.delete(`/membership/${membershipData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            membershipData.value = undefined
            if(membershipList.value.data.length <= 1) toPage.value -= 1
            fetchMembershipList()
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
            :items="[$route.fullPath.split('/')[1].toLocaleUpperCase(), 'Level Settings']" />

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
                                        <VIcon start icon="tabler-plus" />Add Tier
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="membershipList">
                        <VDivider />
                        <VDataTable :headers="membershipListHeader" hide-default-footer :search="search"
                            :items="membershipList.data" :items-per-page="options.per_page">
                            <template #item.image="{ item }">
                                <VImg width="80" :src="item.props.title.image" class="mx-auto" />
                            </template>
                            <template #item.from="{ item }">
                                <span>{{ new Intl.NumberFormat('id-ID').format(item.props.title.from) }}</span>
                            </template>
                            <template #item.until="{ item }">
                                <span>{{ new Intl.NumberFormat('id-ID').format(item.props.title.until) }}</span>
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-1">
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        membershipData = item.props.title
                                        payload = {
                                            name: item.props.title.name,
                                            from: new Intl.NumberFormat('id-ID').format(item.props.title.from),
                                            until: new Intl.NumberFormat('id-ID').format(item.props.title.until),
                                            image: item.props.title.image
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        membershipData = item.props.title
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalMembership) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalMembership / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalMembership / options.per_page), options.last_page)" @next="(val) => toPage = val"
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

        <!-- Add & Edit Limit Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                membershipData = undefined
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
                <h2 class="text-center mb-5">{{ membershipData ? 'Edit' : 'Add' }} Tier</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitMembership()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <VFileInput ref="revUploadImage" v-model="image" accept="image/*" label="File input" show-size
                                @update:model-value="((e: Event) => uploadImage(e))" :rules="[requiredValidator]" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Tier" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Bronze" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.from" label="Amount From" type="text"
                                :rules="[requiredValidator, currencyIndonesiaValidator(payload.from)]" placeholder="Rp 0" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="payload.until" label="Amount To" type="text"
                                :rules="[requiredValidator, currencyIndonesiaValidator(payload.until)]"
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

        <!-- Delete Limit Dialog -->
        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Limit" @update:is-dialog-visible="(val) => {
            if (!val) {
                membershipData = undefined
                payload = {
                    from: null,
                    name: null,
                    until: null
                }
            }
            return
        }">
            Are you sure want to delete limit
            <span class="font-weight-bold">{{ membershipData && membershipData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            membershipData = undefined
                            payload = {
                                from: null,
                                name: null,
                                until: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteMembership()">
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

<style lang="scss">
img.v-img__img.v-img__img--contain { padding: .6rem; }
</style>