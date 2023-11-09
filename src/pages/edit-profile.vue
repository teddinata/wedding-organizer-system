<script setup lang="ts">
import axios from '@axios'
import UserProfileHeaderBg from '@images/pages/user-profile-header-bg.png'
import { betweenValidator, emailValidator, passwordValidator, requiredValidator, confirmedValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'

const profileHeaderData = ref()
const roles = ref()
const refVForm = ref<VForm>()
const isPasswordVisible = ref<boolean>(false)
const loading = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const currentTab = ref<number>(0)

const form = ref<{
    currentPassword: string
    newPassword: string
    newPasswordConfirmation: string
}>({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: ''
})

const payloadProfile = ref<{
    firstName: string
    lastName?: string
    phoneNumber: string
    email?: string
}>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
})


roles.value = JSON.parse(localStorage.getItem('role') || 'null')
const newEmail = ref<string>()
const otpDialogVisible = ref<boolean>(false)

const fetchHeaderData = () => {
    axios.get('/me').then(response => {
        profileHeaderData.value = response.data


        const fullName = profileHeaderData.value.name
        const firstName = fullName.split(' ')[0]
        const lastName = fullName.split(' ')[1]

        payloadProfile.value = {
            firstName,
            lastName: lastName ? lastName : '',
            phoneNumber: profileHeaderData.value.phone_number,
        }
        newEmail.value = profileHeaderData.value.email
    })
}

const submitEditProfile = () => {
    loading.value = true
    axios.post('/edit-profile', {
        current_password: form.value.currentPassword,
        new_password: form.value.newPassword,
        new_password_confirmation: form.value.newPasswordConfirmation
    })
        .then((response) => {
            loading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'success'
            isAlertVisible.value = true
        })
        .catch((e) => {
            loading.value = false
            flashMessage.value.message = e.response.data.error as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
        })
}

onMounted(() => fetchHeaderData())

// Profile details
const image = ref()
const imagePreview = ref<string>('https://avatars.githubusercontent.com/u/33148052?v=4')
const refUploadImg = ref<HTMLElement>()
const loadingProfile = ref<boolean>(false)

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

const submitProfile = () => {
    loadingProfile.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                const formData = new FormData()
                if (image.value) {
                    formData.append("profile_photo_path", image.value[0])
                } else {
                    formData.append("profile_photo_url", `https://ui-avatars.com/api/?name=${payloadProfile.value.firstName.charAt(0)}${payloadProfile.value.lastName ? payloadProfile.value.lastName : null}&color=7F9CF5&background=EBF4FF`)
                }

                formData.append("name", `${payloadProfile.value.firstName} ${payloadProfile.value.lastName}`)
                formData.append("phone_number", payloadProfile.value.phoneNumber)

                axios.put(`/user/${profileHeaderData.value.id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                    .then((response) => {
                        loadingProfile.value = false
                        flashMessage.value.message = response.data.message
                        flashMessage.value.type = 'success'
                        isAlertVisible.value = true
                    })
                    .catch((e) => {
                        loadingProfile.value = false
                        flashMessage.value.message = e.response.data.error as string
                        flashMessage.value.type = 'error'
                        isAlertVisible.value = true
                        console.error(e.response)
                    })
            }
        })
}

</script>

<template>
    <VRow>
        <VCol cols="12">
            <VCard class="mb-5" v-if="profileHeaderData">
                <VImg :src="UserProfileHeaderBg" min-height="125" max-height="250" cover />

                <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-5">
                    <div class="d-flex h-0">
                        <VAvatar rounded size="120" :image="profileHeaderData.profile_photo_url"
                            class="user-profile-avatar mx-auto" />
                    </div>

                    <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
                        <h6 class="text-h6 text-center text-sm-start font-weight-medium mb-3">
                            {{ profileHeaderData?.name }}
                        </h6>

                        <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-4">
                            <div class="d-flex flex-wrap justify-center justify-sm-start flex-grow-1 gap-2">
                                <span class="d-flex">
                                    <VIcon size="20" icon="tabler-color-swatch" class="me-1" />
                                    <span v-for="(role, i) in roles" :key="i" class="text-body-1">
                                        {{ role.name }}
                                    </span>
                                </span>

                                <span class="d-flex align-center">
                                    <VIcon size="20" icon="tabler-at" class="me-2" />
                                    <span class="text-body-1">
                                        {{ profileHeaderData?.email }}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </VCardText>
            </VCard>
        </VCol>
        <VCol cols="12">
            <VTabs v-model="currentTab" class="v-tabs-pill">
                <VTab>Account</VTab>
                <VTab>Change Password</VTab>
            </VTabs>
        </VCol>
        <VCol cols="12">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />

            <VWindow v-model="currentTab" class="v-tabs-pill" v-if="profileHeaderData">
                <VWindowItem>
                    <VCard title="Profile Details">
                        <VCardText class="d-flex">
                            <!-- 👉 Avatar -->
                            <VAvatar rounded size="100" class="me-6" v-if="profileHeaderData.profile_photo_path"
                                :image="profileHeaderData.profile_photo_path" />
                            <VAvatar rounded size="100" class="me-6" v-else :image="profileHeaderData.profile_photo_url" />

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
                            <VForm ref="refVForm" class="mt-6" @submit.prevent="submitProfile()">
                                <VRow>
                                    <VCol md="6" cols="12">
                                        <AppTextField v-model="payloadProfile.firstName" label="First Name" type="text"
                                            :rules="[requiredValidator]" />
                                    </VCol>
                                    <VCol md="6" cols="12">
                                        <AppTextField v-model="payloadProfile.lastName" label="Last Name" type="text" />
                                    </VCol>
                                    <VCol md="6" cols="12">
                                        <AppTextField v-model="newEmail" label="Email" type="text"
                                            :rules="[requiredValidator, emailValidator]">

                                            <template #append>
                                                <span class="cursor-pointer font-weight-bold text-primary" @click="() => {
                                                    otpDialogVisible = true
                                                }">Change</span>
                                            </template>
                                        </AppTextField>
                                    </VCol>
                                    <VCol md="6" cols="12">
                                        <AppTextField prefix="+62" label="Phone number" type="text"
                                            :rules="[requiredValidator, betweenValidator(payloadProfile.phoneNumber, 10, 12)]" />
                                    </VCol>
                                    <VCol cols="12" class="d-flex flex-wrap gap-4">
                                        <VBtn type="submit" :loading="loadingProfile" :disabled="loadingProfile">Save</VBtn>

                                        <VBtn color="secondary" variant="tonal" type="reset" :disabled="loadingProfile">
                                            Reset
                                        </VBtn>
                                    </VCol>
                                </VRow>
                            </VForm>
                        </VCardText>
                    </VCard>
                </VWindowItem>
                <VWindowItem>
                    <VCard title="Change Password" class="mt-5">
                        <VCardItem>
                            <VForm ref="refVForm" @submit.prevent="submitEditProfile()">
                                <VRow>
                                    <VCol cols="12" md="6">
                                        <AppTextField v-model="form.currentPassword" label="Current Password"
                                            :type="isPasswordVisible ? 'text' : 'password'"
                                            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                            @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                            :rules="[requiredValidator]" />
                                    </VCol>
                                </VRow>

                                <VRow class="mt-3">
                                    <VCol cols="12" md="6">
                                        <AppTextField v-model="form.newPassword" label="New Password"
                                            :type="isPasswordVisible ? 'text' : 'password'"
                                            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                            @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                            :rules="[requiredValidator, passwordValidator]" />
                                    </VCol>
                                    <VCol cols="12" md="6">
                                        <AppTextField v-model="form.newPasswordConfirmation" label="Confirm New Password"
                                            :type="isPasswordVisible ? 'text' : 'password'"
                                            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                                            @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                            :rules="[requiredValidator, confirmedValidator(form.newPasswordConfirmation, form.newPassword)]" />
                                    </VCol>
                                </VRow>

                                <div class="mt-5 d-flex flex-column">
                                    <h3>Password Requirements:</h3>
                                    <ul class="ps-5">
                                        <li>Minimum 8 characters long - the more, the better</li>
                                        <li>At least one lowercase character</li>
                                        <li>At least one number, symbol, or whitespace character</li>
                                    </ul>
                                </div>

                                <div class="mt-5">
                                    <VBtn :loading="loading" :disabled="loading" type="submit">Save Changes</VBtn>
                                    <VBtn color="secondary" type="reset" class="ms-3">Reset</VBtn>
                                </div>
                            </VForm>
                        </VCardItem>
                    </VCard>
                </VWindowItem>
            </VWindow>
        </VCol>

        <MainDialog v-model:is-dialog-visible="otpDialogVisible">
            <div class="mx-auto">
                <h2 class="text-center">OTP Verification</h2>
                <VCardText class="pt-2">
                    <h5 class="text-h5 mb-1">
                        Two Step Verification 💬
                    </h5>
                    <p class="mb-2">
                        We sent a verification code to your existing email. Enter the code in the field below.
                    </p>
                    <h6 class="text-base font-weight-medium">
                        ******1234
                    </h6>
                    <VForm ref="refVForm" @submit.prevent="() => { }">
                        <VRow class="mt-3">
                            <VCol cols="12">
                                <AppOtpInput :totalInput="6" />
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
            </div>
        </MainDialog>
    </VRow>
</template>

<style lang="scss">
.user-profile-avatar {
    border: 5px solid rgb(var(--v-theme-surface));
    background-color: rgb(var(--v-theme-surface)) !important;
    inset-block-start: -3rem;

    .v-img__img {
        border-radius: 0.125rem;
    }
}
.v-text-field .v-input__details {
  padding-inline-start: 0;
}
</style>