<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@/@core/composable/useErrorMessage'
import { requiredValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { useCookies } from '@vueuse/integrations/useCookies'

interface Options { current_page: number; per_page: number; last_page: number }

const refVForm = ref<VForm>()
const search = ref<string>('')
const productList = ref()
const totalProduct = ref<number>(0)
const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const toPage = ref<number>(0)
const cookies = useCookies(['role', 'userData', 'accessToken', 'userAbilities'])

const productListHeaders = [
    { title: 'CATEGORY', key: 'name' },
    { title: 'TOTAL ATTRIBUTE', key: 'product_attributes_count' },
    { title: 'ACTION', key: 'action', sortable: false }
]

const fetchProductList = () => {
    axios.get('/product-category', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            productList.value = response.data.data
            totalProduct.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}
watch(toPage, () => fetchProductList())
watch(
    () => options.per_page,
    () => fetchProductList()
)

onMounted(() => fetchProductList())

// Create and edit product category
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const categoryName = ref<string | null>()
const loadingAdd = ref<boolean>(false)
const userData = cookies.get('userData')
const edit = ref()
const isAlertDialogVisible = ref<boolean>(false)

const submitAddCategory = () => {
    loadingAdd.value = true
    if (edit.value === undefined) {
        axios.post('product-category', {
            name: categoryName.value,
            created_by: userData?.id
        })
            .then((response) => {
                flashMessage.value.message = response.data.message
                loadingAdd.value = false
                flashMessage.value.type = 'success'
                isAlertVisible.value = true
                isDialogVisible.value = false
                categoryName.value = null
                fetchProductList()
            })
            .catch((e) => {
                const error = e.response.data.data
                const { message, isError } = useErrorMessage(error)
                loadingAdd.value = false;
                isAlertDialogVisible.value = isError.value;
                flashMessage.value.message = message
                flashMessage.value.type = "error";
                console.error(e.response);
            })
    } else {
        axios.put(`product-category/${edit.value}`, {
            name: categoryName.value,
            updated_by: userData?.id
        })
            .then((response) => {
                flashMessage.value.message = response.data.message
                loadingAdd.value = false
                flashMessage.value.type = 'success'
                isAlertVisible.value = true
                isDialogVisible.value = false
                categoryName.value = null
                fetchProductList()
            })
            .catch((e) => {
                const error = e.response.data.data
                const { message, isError } = useErrorMessage(error)
                loadingAdd.value = false;
                isAlertDialogVisible.value = isError.value;
                flashMessage.value.message = message
                flashMessage.value.type = "error";
                console.error(e.response);
            })
    }
}

// Delete product category
const isDeleteDialogVisible = ref<boolean>(false)
const loadingDelete = ref<boolean>(false)
const dataProduct = ref()

const deleteProduct = () => {
    loadingDelete.value = true
    axios.delete(`/product-category/${dataProduct.value.id}`)
        .then((response) => {
            loadingDelete.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            dataProduct.value = undefined
            if(productList.value.data.length <= 1) toPage.value -= 1
            fetchProductList()
        })
        .catch((e) => {
            loadingDelete.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
        })
}

// Product add attribute
const isDialogAttributeVisible = ref<boolean>(false)
const isAlertAttributeVisible = ref<boolean>(false)
const attributeName = ref<string>()

const submitAddAttribute = () => {
    axios.post('/product-attribute', {
        name: attributeName.value,
        product_category_id: dataProduct.value.id
    })
        .then((response) => {
            flashMessage.value.message = response.data.message
            loadingAdd.value = false
            flashMessage.value.type = 'success'
            isAlertVisible.value = true
            isDialogAttributeVisible.value = false
        })
        .catch((e) => {
            const error = e.response.data.data
            const { message, isError } = useErrorMessage(error)
            loadingAdd.value = false;
            isAlertAttributeVisible.value = isError.value;
            flashMessage.value.message = message
            flashMessage.value.type = "error";
            console.error(e.response);
        })
}

// add product variant
const isDialogVariantVisible = ref<boolean>(false)
const variantName = ref<string>()
const attributes = ref()
const productCategoryAttributeSelected = ref()

const fetchAttributeList = () => {
    axios.get(`/product-attribute`)
        .then((response) => {
            attributes.value = response.data.data.data
            productCategoryAttributeSelected.value = response.data.data.data.filter((item: { id: string | string[] }) => item.id == dataProduct.value.id)
        })
        .catch((e) => {
            console.error(e)
        })
}

watch(isDialogVariantVisible, (val) => {
    if (val) fetchAttributeList()
    else isDialogVariantVisible.value = false
})

const isAlertVariantVisible = ref<boolean>(false)
const submitAddVariant = () => {
    axios.post('/product-variant', {
        name: variantName.value,
        product_attribute_id: attributeName.value
    })
        .then((response) => {
            flashMessage.value.message = response.data.message
            loadingAdd.value = false
            flashMessage.value.type = 'success'
            isAlertVisible.value = true
            isDialogVariantVisible.value = false
        })
        .catch((e) => {
            const error = e.response.data.data
            const { message, isError } = useErrorMessage(error)
            loadingAdd.value = false;
            isAlertVariantVisible.value = isError.value;
            flashMessage.value.message = message
            flashMessage.value.type = "error";
            console.error(e.response);
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
                                    <VBtn @click="isDialogVisible = !isDialogVisible">Add Category</VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="productList">
                        <VDivider />
                        <VDataTable :headers="productListHeaders" hide-default-footer :search="search"
                            :items="productList.data" :items-per-page="options.per_page">
                            <template #item.name="{ item }">
                                <RouterLink
                                    :to="{ name: 'products-attribute-idAttribute', params: { idAttribute: item.props.title.id } }">
                                    <span>{{ item.props.title.name }}</span>
                                </RouterLink>
                            </template>
                            <template #item.action="{ item }">
                                <VMenu location="start">
                                    <template #activator="{ props }">
                                        <VBtn v-bind="props" variant="plain">
                                            <VIcon icon="tabler-dots-vertical" />
                                        </VBtn>
                                    </template>

                                    <VList>
                                        <VListItem>Detail</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDialogVisible = true
                                            edit = item.props.title.id
                                            categoryName = item.props.title.name
                                        }">Edit</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDeleteDialogVisible = true
                                            dataProduct = item.props.title
                                        }">Delete</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDialogAttributeVisible = true
                                            dataProduct = item.props.title
                                        }">Add Attribute</VListItem>
                                        <VListItem class="cursor-pointer" @click="() => {
                                            isDialogVariantVisible = true
                                            dataProduct = item.props.title
                                        }">Add Variant</VListItem>
                                    </VList>
                                </VMenu>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalProduct) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalProduct / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalProduct / options.per_page), options.last_page)" @next="(val) => toPage = val"
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

        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                edit = undefined
                categoryName = null
            }
            if (isAlertDialogVisible) isAlertDialogVisible = false
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ edit ? 'Edit' : 'Add' }} Category</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitAddCategory()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="categoryName" label="Name" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Melamin" />
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

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Category Product"
            @update:is-dialog-visible="(val) => {
                if (!val) {
                    edit = undefined
                    categoryName = null
                }
                return
            }">
            Are you sure want to delete category product
            <span class="font-weight-bold">{{ categoryName && categoryName }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            edit = undefined
                            categoryName = null
                        }" :disabled="loadingDelete">Cancel</VBtn>
                        <VBtn :loading="loadingDelete" :disabled="loadingDelete" color="error" @click="deleteProduct()">
                            Delete</VBtn>
                    </div>
                </VCol>
            </VRow>
        </MainDialog>

        <!-- Product attribute add -->
        <MainDialog v-model:is-dialog-visible="isDialogAttributeVisible">
            <div class="mx-auto">
                <h2 class="text-center mb-5">Add Attribute</h2>
                <FlashMessage v-model="isAlertAttributeVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" class="mt-4" />
                <VForm ref="refVForm" @submit.prevent="submitAddAttribute()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppSelect v-model="dataProduct.name" item-title="name" item-value="id" label="Category"
                                :disabled="true" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="attributeName" label="Name" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Color" />
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="loadingAdd" :disabled="loadingAdd" type="submit">Save</VBtn>
                                <VBtn color="secondary" class="mx-2" @click="() => attributeName = undefined">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>

        <!-- Product variant add -->
        <MainDialog v-model:is-dialog-visible="isDialogVariantVisible">
            <div class="mx-auto">
                <h2 class="text-center mb-5">Add Variant</h2>
                <FlashMessage v-model="isAlertVariantVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" class="mt-4" />
                <VForm ref="refVForm" @submit.prevent="submitAddVariant()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppSelect v-model="dataProduct.name" item-title="name" item-value="id" label="Category"
                                :disabled="true" />
                        </VCol>
                        <VCol cols="12">
                            <AppSelect v-model="attributeName" item-title="name" :items="productCategoryAttributeSelected"
                                item-value="id" label="Attribute" :rules="[requiredValidator]" />
                        </VCol>
                        <VCol cols="12">
                            <AppTextField v-model="variantName" label="Name" type="text" :rules="[requiredValidator]"
                                placeholder="Ex. Grey" />
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="loadingAdd" :disabled="loadingAdd" type="submit">Save</VBtn>
                                <VBtn color="secondary" class="mx-2">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
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