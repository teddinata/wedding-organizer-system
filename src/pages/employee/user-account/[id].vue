<script setup lang="ts">
import axios from '@axios'

interface EmployeeProps {
    nik: string
    fullname: string
    department_id: number | string | null
    position_id: number | string | null
    email: string
    phone_number?: string
    dateofbirth: string
    gender: number | string
}
type FlashMessageType = 'success' | 'info' | 'warning' | 'error'

const route = useRoute()

const employee = ref<EmployeeProps>()
const imagePreview = ref()
const ktpImagePreview = ref()
const vaccineImagePreview = ref()
const flashMessage = ref<{ message: string; type: FlashMessageType }>({
    message: '',
    type: 'success'
})
const isAlertVisible = ref<boolean>(false)

const fetchDetailEmployee = () => {
    axios.get(`/employee/${route.params.id}`)
        .then((response) => {
            const data = response.data.data
            const urlImageEmployee = "https://dev.goodsoneid.com/storage/uploads/employee/"

            employee.value = {
                dateofbirth: data.dateofbirth,
                email: data.email,
                fullname: data.fullname,
                gender: data.gender == 1 ? "Male" : "Female",
                nik: data.nik,
                department_id: data.department.name,
                position_id: data.position.name
            }
            imagePreview.value = `${urlImageEmployee}${data.photo}`
            ktpImagePreview.value = `${urlImageEmployee}${data.ktp_img}`
            vaccineImagePreview.value = `${urlImageEmployee}${data.vaccine_img}`
        })
}

onMounted(() => fetchDetailEmployee())

const isLoading = ref<boolean>(false)
const generatePassword = () => {
    isLoading.value = true
    axios.post(`/employee/${route.params.id}/generate-password`)
        .then((response) => {
            isAlertVisible.value = true
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'success'
            isLoading.value = false
        })
        .catch((e) => {
            isLoading.value = false
            console.error(e)
        })
}
</script>

<template>
    <VRow v-if="employee">
        <VCol cols="12">
            <VBreadcrumbs :items="['Employee', employee.fullname, 'User Account']" />
        </VCol>
        <VCol cols="12" class="h-full">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
            <VCard title="Account" class="mt-3">
                <VCardText class="d-flex">
                    <!-- 👉 Avatar -->
                    <VAvatar rounded size="100" class="me-6" :image="imagePreview" />
                </VCardText>

                <VDivider />

                <VCardText class="pt-2">
                    <VForm ref="refVForm" class="mt-6" @submit.prevent="generatePassword">
                        <VRow>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="employee.nik" label="Employee Number" type="text" :disabled="true" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="employee.fullname" label="Employee Name" type="text"
                                    :disabled="true" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppTextField v-model="employee.email" label="Email" type="text" :disabled="true" />
                            </VCol>
                            <VCol cols="12" class="d-flex flex-wrap gap-4">
                                <VBtn type="submit" color="warning" :loading="isLoading" :disabled="isLoading">Generate
                                    Password</VBtn>

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