<script setup lang="ts">
import axios from '@axios'
import { requiredValidator, emailValidator, betweenValidator } from '@validators'
import { useGeneratedCode } from '@/@core/composable/useGeneratedCode';
import { VForm } from 'vuetify/components/VForm'

// Set membership by default none

interface Payload {
    name: string;
    vendorGradeId: string | number | null;
    vendorLimitId: string | number | null;
    membershipId: string | number | null;
    email: string;
    contactNumber: string;
    contactPerson: string;
    website?: string;
    instagram?: string;
    address: string;
    city: string;
    point?: number
    code?: string
}

const payload = ref<Payload>({
    name: '',
    vendorGradeId: null,
    vendorLimitId: null,
    membershipId: null,
    email: '',
    contactNumber: '',
    contactPerson: '',
    website: '',
    address: '',
    city: '',
    instagram: ''
})
const image = ref()
const imagePreview = ref<string>('https://avatars.githubusercontent.com/u/33148052?v=4')
const refUploadImg = ref<HTMLElement>()
const refVForm = ref<VForm>()
const router = useRouter()
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const route = useRoute()

const changeAvatar = (file: Event) => {
    const fileReader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length) {
        fileReader.readAsDataURL(files[0])
        fileReader.onload = () => {
            if (typeof fileReader.result === 'string')
                imagePreview.value = fileReader.result
        }
    }
    if (file.target && file.target instanceof HTMLInputElement) {
        image.value = file.target.files?.[0];
    }
}

const resetAvatar = () => {
    imagePreview.value = "https://avatars.githubusercontent.com/u/33148052?v=4"
}

const gradeList = ref()
const fetchVendorGradeList = () => {
    axios.get(`/vendor-grade`)
        .then((response) => {
            gradeList.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

const limitList = ref()
const fetchVendorLimitList = () => {
    axios.get(`/vendor-limit`)
        .then((response) => {
            limitList.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

const memberships = ref()
const fetchMembershipList = () => {
    axios.get(`/membership`)
        .then((response) => {
            memberships.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => {
    fetchVendorGradeList()
    fetchVendorLimitList()
    fetchMembershipList()
})

// Fetch detail vendor
const fetchDetailVendor = () => {
    axios.get('/vendor', {
        params: {
            id: route.query?.id
        }
    })
        .then((response) => {
            const data = response.data.data
            payload.value = {
                address: data.address,
                city: data.city,
                contactNumber: data.contact_number,
                contactPerson: data.contact_person,
                email: data.email,
                membershipId: data.membership_id,
                name: data.name,
                vendorGradeId: data.vendor_grade_id,
                vendorLimitId: data.vendor_limit_id,
                website: data.website,
                instagram: data.instagram,
                code: data.code,
                point: data.point
            }
            image.value = data.logo
            imagePreview.value = data.logo
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => {
    if (route.query.id) fetchDetailVendor()
})

// Submit vendor
const isLoading = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const { value: code } = useGeneratedCode
const submitVendor = () => {
    isLoading.value = true
    const data = payload.value
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                console.log('yes')
                if (route.query.id === undefined) {
                    const formData = new FormData()

                    formData.append('name', payload.value.name)
                    formData.append('vendor_grade_id', payload.value.vendorGradeId as string)
                    formData.append('vendor_limit_id', payload.value.vendorLimitId as string)
                    formData.append('membership_id', String(1))
                    formData.append('email', payload.value.email as string)
                    formData.append('point', String(0))
                    formData.append('contact_number', payload.value.contactNumber)
                    formData.append('webiste', payload.value.website as string)
                    formData.append('instagram', payload.value.instagram as string)
                    formData.append('address', payload.value.address)
                    formData.append('city', payload.value.city)
                    formData.append('logo', image.value)
                    formData.append('contact_person', payload.value.contactPerson)
                    formData.append('code', code)

                    axios.post('/vendor', formData)
                        .then((response) => {
                            router.push({
                                name: 'vendors-list',
                                query: {
                                    message: response.data.message,
                                    type: 'success'
                                }
                            })
                            isLoading.value = false
                        })
                        .catch((e) => {
                            isAlertVisible.value = true
                            flashMessage.value.message = e.response.data.message as string
                            isLoading.value = false
                            flashMessage.value.type = 'error'
                            console.error(e)
                        })
                } else {
                    const formData = new FormData()
                    
                    formData.append('name', payload.value.name)
                    formData.append('vendor_grade_id', payload.value.vendorGradeId as string)
                    formData.append('vendor_limit_id', payload.value.vendorLimitId as string)
                    formData.append('membership_id', payload.value.membershipId as string)
                    formData.append('email', payload.value.email as string)
                    formData.append('point', String(0))
                    formData.append('contact_number', payload.value.contactNumber)
                    formData.append('webiste', payload.value.website as string)
                    formData.append('instagram', payload.value.instagram as string)
                    formData.append('address', payload.value.address)
                    formData.append('city', payload.value.city)
                    formData.append('logo', image.value)
                    formData.append('contact_person', payload.value.contactPerson)
                    formData.append('code', payload.value.code as string)

                    axios.post(`/vendor/${route.query?.id}?_method=PUT`, formData)
                        .then((response) => {
                            router.push({
                                name: 'vendors-list',
                                query: {
                                    message: response.data.message,
                                    type: 'success'
                                }
                            })
                            isLoading.value = false
                        })
                        .catch((e) => {
                            isAlertVisible.value = true
                            flashMessage.value.message = e.response.data.message as string
                            isLoading.value = false
                            flashMessage.value.type = 'error'
                            console.error(e)
                        })
                }
            } else {
                console.log('no')
            }
        })
}
</script>

<template>
    <VRow>
        <VCol cols="12">
            <VBreadcrumbs :items="['VENDORS', route.query.id !== undefined ? 'EDIT' : 'ADD']" />
        </VCol>
        <VCol cols="12" class="h-full">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
            <VCard title="Vendor Information">
                <VCardText class="d-flex">
                    <!-- 👉 Avatar -->
                    <VAvatar rounded size="100" class="me-6" :image="imagePreview" />

                    <!-- 👉 Upload Photo -->
                    <form class="d-flex flex-column justify-center gap-4">
                        <div class="d-flex flex-wrap gap-2">
                            <VBtn color="primary" @click="refUploadImg?.click()">
                                <VIcon icon="tabler-cloud-upload" class="d-sm-none" />
                                <span class="d-none d-sm-block">Upload new photo</span>
                            </VBtn>

                            <input ref="refUploadImg" type="file" name="file" accept=".jpeg,.png,.jpg,GIF" hidden
                                @input="changeAvatar">

                            <VBtn type="reset" color="secondary" variant="tonal" @click="resetAvatar">
                                <span class="d-none d-sm-block">Reset</span>
                                <VIcon icon="tabler-refresh" class="d-sm-none" />
                            </VBtn>
                        </div>

                        <p class="text-body-1 mb-0">
                            Allowed JPG, GIF or PNG. Max size of 800K
                        </p>
                    </form>
                </VCardText>

                <VDivider />

                <VCardText class="pt-2">
                    <VForm ref="refVForm" class="mt-6" @submit.prevent="submitVendor()">
                        <VRow>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.name" label="Company/Brand Name" type="text"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.contactPerson" label="Contact Person" type="text"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.email" label="Email" type="text"
                                    :rules="[requiredValidator, emailValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField prefix="+62" v-model="payload.contactNumber" label="Phone number" type="text"
                                    :rules="[requiredValidator, betweenValidator(payload.contactNumber, 10, 12)]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.address" label="Address" type="text"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.city" label="City" type="text"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.website" label="Website" type="text" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.instagram" label="Instagram" type="text" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppSelect :items="limitList" v-model="payload.vendorLimitId" item-title="name"
                                    item-value="id" label="Set Limit" placeholder="Select Limit"
                                    :rules="[requiredValidator]" />
                            </VCol>

                            <VCol md="6" cols="12">
                                <AppSelect :items="gradeList" v-model="payload.vendorGradeId" item-title="name"
                                    item-value="id" label="Set Grade" placeholder="Select Grade"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol cols="12" class="d-flex flex-wrap gap-4">
                                <VBtn type="submit" :loading="isLoading" :disabled="isLoading">Save</VBtn>

                                <VBtn color="secondary" variant="tonal" type="reset" :disabled="isLoading">
                                    Reset
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
            </VCard>
        </VCol>
    </VRow>
</template>