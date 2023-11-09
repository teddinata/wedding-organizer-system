<script setup lang="ts">
import { confirmedValidator, passwordValidator, requiredValidator } from '@validators'

// interface Props {
//     submitEditProfile: () => void
//     isLoading: boolean
//     currentPassword: string
//     newPassword: string
//     newPasswordConfirmation: string
// }

interface FormProps {
    currentPassword: string
    newPassword: string
    newPasswordConfirmation: string
}

interface Props {
    isLoading: boolean
    form: FormProps
}

interface Emits {
    (e: 'submitForm', value: FormProps): void
}

// const props = defineProps<Props>()
const props = withDefaults(defineProps<Props>(), {
    form: () => ({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirmation: ''
    })
})
const formPayload = ref<FormProps>(props.form)
const emits = defineEmits<Emits>()

const isPasswordVisible = ref<boolean>(false)

// const form = ref<{
//     currentPassword: string
//     newPassword: string
//     newPasswordConfirmation: string
// }>({
//     currentPassword: '',
//     newPassword: '',
//     newPasswordConfirmation: ''
// })

const submitEditProfile = () => {
    emits('submitForm', formPayload.value)
}
</script>

<template>
    <VCard class="mt-5">
        <VCardItem>
            <VCardTitle>Change Password</VCardTitle>
            <VForm ref="refVForm" @submit.prevent="submitEditProfile()">
                <VRow class="mt-3">
                    <VCol cols="12" md="6">
                        <AppTextField v-model="form.currentPassword" label="Current Password"
                            :type="isPasswordVisible ? 'text' : 'password'"
                            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                            @click:append-inner="isPasswordVisible = !isPasswordVisible" :rules="[requiredValidator]" />
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
                            :rules="[requiredValidator, confirmedValidator(props.form.newPasswordConfirmation, props.form.newPassword)]" />
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
                    <VBtn :loading="isLoading" :disabled="isLoading" type="submit">Save Changes</VBtn>
                    <VBtn color="secondary" type="reset" class="ms-3">Reset</VBtn>
                </div>
            </VForm>
        </VCardItem>
</VCard></template>