<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { requiredValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number }

const refVForm = ref<VForm>()
const search = ref<string>('')
const variantList = ref()
const totalVariant = ref<number>(0)
const options = reactive<Options>({ current_page: 1, per_page: 10 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const toPage = ref<number>(0)
const route = useRoute()
console.log(route.params)

const variantListHeaders = [
    { title: 'ATTRIBUTE NAME', key: 'name' },
    { title: 'ACTION', key: 'action', sortable: false }
]

const fetchvariantList = () => {
    axios.get(`/product-variant?product=${route.params.idVariant}&per_page=${options.per_page}`)
        .then((response) => {
            variantList.value = response.data.data
            totalVariant.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page
        })
        .catch((e) => {
            console.error(e)
        })
}
watch(toPage, () => fetchvariantList())
watch(
    () => options.per_page,
    () => fetchvariantList()
)
onMounted(() => fetchvariantList())

// Create and edit product category attribute variant
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const variantName = ref<string>()
const loadingAdd = ref<boolean>(false)
const edit = ref()
const productCategoryId = ref<number>()

const submitAddAttribute = () => {
    loadingAdd.value = true
    if (edit.value === undefined) {
        axios.post('/product-variant', {
            name: variantName.value,
            product_attribute_id: route.params.idVariant
        })
            .then((response) => {
                flashMessage.value.message = response.data.message
                loadingAdd.value = false
                flashMessage.value.type = 'success'
                isAlertVisible.value = true
                isDialogVisible.value = false
                fetchvariantList()
            })
            .catch((e) => {
                loadingAdd.value = false
                flashMessage.value.message = e.response.data.message as string
                flashMessage.value.type = 'error'
                isAlertVisible.value = true
                console.error(e.response)
            })
    } else {
        axios.put(`product-variant/${edit.value}`, {
            name: variantName.value,
            product_attribute_id: route.params.idVariant
        })
            .then((response) => {
                flashMessage.value.message = response.data.message
                loadingAdd.value = false
                flashMessage.value.type = 'success'
                isAlertVisible.value = true
                isDialogVisible.value = false
                fetchvariantList()
            })
            .catch((e) => {
                loadingAdd.value = false
                flashMessage.value.message = e.response.data.message as string
                flashMessage.value.type = 'error'
                isAlertVisible.value = true
                console.error(e.response)
            })
    }
}

// Delete product category attribute variant
const isDeleteDialogVisible = ref<boolean>(false)
const loadingDelete = ref<boolean>(false)
const dataVariant = ref()

const deleteProduct = () => {
    loadingDelete.value = true
    axios.delete(`/product-variant/${dataVariant.value.id}`)
        .then((response) => {
            loadingDelete.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            fetchvariantList()
        })
        .catch((e) => {
            loadingDelete.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.log(e.response)
        })
}

// fetch product category list
const products = ref()
const attributes = ref()
const productCategorySelected = ref()
const productCategoryAttributeSelected = ref()
const fetchProductList = () => {
    axios.get(`/product-category`)
        .then((response) => {
            products.value = response.data.data.data
            productCategorySelected.value = response.data.data.data.find((item: { id: string | string[] }) => item.id == route.params.idAttribute)
        })
        .catch((e) => {
            console.error(e)
        })
}

const fetchAttributeList = () => {
    axios.get(`/product-attribute`)
        .then((response) => {
            attributes.value = response.data.data.data
            productCategoryAttributeSelected.value = response.data.data.data.find((item: { id: string | string[] }) => item.id == route.params.idVariant)
        })
        .catch((e) => {
            console.error(e)
        })
}
watch(isDialogVisible, (val) => {
    if (val) {
        fetchProductList()
        fetchAttributeList()
    }
    else isDialogVisible.value = false
})
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
                                    <VBtn @click="isDialogVisible = !isDialogVisible">Add Variant</VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="variantList">
                        <VDataTable :headers="variantListHeaders" hide-default-footer :search="search"
                            :items="variantList.data" :items-per-page="options.per_page">
                            <template #item.action="{ item }">
                                <VMenu location="start">
                                    <template #activator="{ props }">
                                        <VBtn v-bind="props" variant="plain">
                                            <VIcon icon="tabler-dots-vertical" />
                                        </VBtn>
                                    </template>

                                    <VList>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDialogVisible = true
                                            edit = item.props.title.id
                                            variantName = item.props.title.name
                                        }">Edit</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDeleteDialogVisible = true
                                            dataVariant = item.props.title
                                        }">Delete</VListItem>
                                    </VList>
                                </VMenu>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalVariant) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalVariant / 10), 2)"
                                        :length="Math.min(Math.ceil(totalVariant / 10), 2)" @next="(val) => toPage = val"
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

        <MainDialog v-model:is-dialog-visible="isDialogVisible"
            @update:is-dialog-visible="(val) => !val ? edit = undefined : edit">
            <div class="mx-auto">
                <h2 class="text-center">{{ edit ? 'Edit' : 'Add' }} Variant</h2>
                <VForm ref="refVForm" @submit.prevent="submitAddAttribute()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppAutocomplete v-model="productCategorySelected" :items="products" item-title="name"
                                item-value="id" label="Category" :disabled="true" />
                        </VCol>
                        <VCol cols="12">
                            <AppAutocomplete v-model="productCategoryAttributeSelected" :items="attributes"
                                item-title="name" item-value="id" label="Attribute" :disabled="true" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="variantName" label="Name" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Grey" />
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="loadingAdd" :disabled="loadingAdd" type="submit">Save</VBtn>
                <VBtn type="reset" color="secondary" variant="tonal" class="mx-2">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible">
            <VCardTitle>Delete Product Variant</VCardTitle>
            <VCardText>Are you sure want to delete category variant <span class="font-weight-bold">{{ dataVariant.name
            }}</span> from <span class="font-weight-bold">{{ productCategorySelected.name + " - " +
    productCategoryAttributeSelected.name }}</span> ?
            </VCardText>
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" class="mx-2" @click="isDeleteDialogVisible = false"
                            :disabled="loadingDelete">Cancel</VBtn>
                        <VBtn :loading="loadingDelete" :disabled="loadingDelete" color="error" @click="deleteProduct()">
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