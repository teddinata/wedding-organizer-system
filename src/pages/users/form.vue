<script setup lang="ts">
import axios from '@axios'
import { requiredValidator, emailValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'

interface Payload {
    firstName: string
    lastName?: string
    image?: string
    email: string
    phoneNumber: string
    roles: number
}

const payload = ref<Payload>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roles: 0
})

const route = useRoute()
const router = useRouter()

const imagePreview = ref<string>('https://avatars.githubusercontent.com/u/33148052?v=4')
const refUploadImg = ref<HTMLElement>()
const refVForm = ref<VForm>()
const image = ref()
const isLoading = ref<boolean>(false)
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const isAlertVisible = ref<boolean>(false)

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

const roleItems: { name: string; value: number }[] = [
    { name: 'Super Admin', value: 1 },
    { name: 'Manager', value: 2 },
    { name: 'Admin Vendor', value: 3 }
]

const submitUser = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (route.query.id === undefined) {
                    const formData = new FormData()

                    if (image.value) {
                        formData.append("profile_photo_path", image.value[0])
                    } else {
                        formData.append("profile_photo_url", `https://ui-avatars.com/api/?name=${payload.value.firstName.charAt(0)}${payload.value.lastName ? payload.value.lastName : null}&color=7F9CF5&background=EBF4FF`)
                    }

                    formData.append("name", `${payload.value.firstName} ${payload.value.lastName}`)
                    formData.append("email", payload.value.email)
                    // phone number but currently not available
                    // formData.append("")
                    formData.append("roles", [payload.value.roles].toString())

                    axios.post('/user', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    })
                        .then((response) => {
                            router.push({
                                name: 'users-list',
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
            }
        })
}
</script>

<template>
    <VRow class="match-height">
        <VCol cols="12">
            <VBreadcrumbs :items="['VENDORS', route.query.id !== undefined ? 'EDIT' : 'ADD']" />
        </VCol>
        <VCol cols="12" class="h-full">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
            <VCard title="User Information" class="mt-3">
                <VCardText class="d-flex">
                    <!-- 👉 Avatar -->
                    <VAvatar rounded size="100" class="me-6"
                        :image="route.query.id === undefined ? imagePreview : payload.image" />

                    <!-- 👉 Upload Photo -->
                    <form class="d-flex flex-column justify-center gap-4">
                        <div class="d-flex flex-wrap gap-2">
                            <VBtn color="primary" @click="refUploadImg?.click()">
                                <VIcon icon="tabler-cloud-upload" class="d-sm-none" />
                                <span class="d-none d-sm-block">Upload photo</span>
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
                    <VForm ref="refVForm" class="mt-6" @submit.prevent="() => submitUser()">
                        <VRow>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.firstName" label="First Name" type="text"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.lastName" label="Last Name" type="text" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="payload.email" label="Email" type="text"
                                    :rules="[requiredValidator, emailValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField prefix="+62" v-model="payload.phoneNumber" label="Phone number" type="text"
                                    :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppSelect v-model="payload.roles" :items="roleItems" item-value="value" item-title="name"
                                    label="Role" type="text" :rules="[requiredValidator]" />
                            </VCol>
                            <VCol cols="12" class="d-flex flex-wrap gap-4">
                                <VBtn type="submit" :loading="isLoading" :disabled="isLoading">Save</VBtn>

                                <VBtn color="secondary" variant="tonal" type="reset" :loading="isLoading"
                                    :disabled="isLoading">
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