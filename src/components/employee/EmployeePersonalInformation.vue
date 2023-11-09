<script setup lang="ts">
import axios from '@axios'
import { useCapitalizeFirstLetter } from '@core/composable/useCapitalizeFirstLetter'
import { requiredValidator, emailValidator, betweenValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'

interface PayloadProps {
    employee_number: string
    fullname: string
    department_id: number | string | null
    position_id: number | string | null
    email: string
    phone_number?: string
    dateofbirth: string
    gender: number | string
}

const imagePreview = ref<string>('https://avatars.githubusercontent.com/u/33148052?v=4')
const refUploadImg = ref<HTMLElement>()
const image = ref()
const ktpImage = ref()
const vaccineImage = ref()
const isLoading = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const isAlertVisible = ref<boolean>(false)

const changeAvatar = (file: Event) => {
    const fileReader = new FileReader()
    const { files } = file.target as HTMLInputElement
    console.log(files)
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

const genders = [
    { title: 'Male', value: 1 },
    { title: 'Female', value: 2 }
]

const departments = ref()
const fetchDepartments = () => {
    axios.get(`/department`)
        .then((response) => {
            departments.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

// Fetch positions
const positions = ref()
const fetchPositions = () => {
    axios.get('/position')
        .then((response) => {
            positions.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => {
    fetchDepartments()
    fetchPositions()
})

const ktpImagePreview = ref()
const uploadKtpImage = (file: Event) => {
    try {
        const fileReader = new FileReader()
        // @ts-ignore
        if (file && file[0]) {
            // @ts-ignore
            fileReader.readAsDataURL(file[0])
            fileReader.onload = () => {
                if (typeof fileReader.result === 'string')
                    ktpImagePreview.value = fileReader.result
            }
        } else {
            ktpImagePreview.value = null
        }
        if (file.target && file.target instanceof HTMLInputElement) {
            ktpImage.value = file.target.files?.[0];
        }
    } catch (e) {
        console.error(e)
    }
};

const vaccineImagePreview = ref()
const uploadVaccineImage = (file: Event) => {
    try {
        const fileReader = new FileReader()
        // @ts-ignore
        if (file && file[0]) {
            // @ts-ignore
            fileReader.readAsDataURL(file[0])
            fileReader.onload = () => {
                if (typeof fileReader.result === 'string')
                    vaccineImagePreview.value = fileReader.result
            }
        } else {
            vaccineImagePreview.value = null
        }
        if (file.target && file.target instanceof HTMLInputElement) {
            vaccineImage.value = file.target.files?.[0];
        }
    } catch (e) {
        console.error(e)
    }
};

const payload = ref<PayloadProps>({
    employee_number: '',
    fullname: '',
    dateofbirth: '',
    department_id: null,
    position_id: null,
    email: '',
    gender: '',
    phone_number: '',
})
const refVForm = ref<VForm>()

const generatePassword = (id: number) => {
    axios.post(`/employee/${id}/generate-password`)
        .then((data) => {
            router.push({
                name: 'employee-list',
                query: {
                    message: data.data.message,
                    type: 'success'
                }
            })
        })
        .catch((e) => {
            console.error(e)
        })
}

const submitEmployee = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (route.query.id === undefined) {
                    const formData = new FormData();
                    const capitalizeFullName = useCapitalizeFirstLetter(payload.value.fullname)

                    formData.append('photo', image.value)
                    formData.append('ktp_img', ktpImage.value[0])
                    formData.append('vaccine_img', vaccineImage.value[0])
                    formData.append('department_id', payload.value.department_id as string)
                    formData.append('position_id', payload.value.position_id as string)
                    formData.append('level_id', '1')
                    formData.append('fullname', capitalizeFullName.value)
                    formData.append('email', payload.value.email)
                    formData.append('gender', payload.value.gender as string)
                    formData.append('employee_number', payload.value.employee_number)
                    formData.append('points', String(0))

                    axios.post('/employee', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    })
                        .then((response) => {
                            const employeeId = response.data.data.id
                            generatePassword(employeeId)
                            isLoading.value = false
                        })
                        .catch((e) => {
                            isLoading.value = false
                            console.error(e)
                        })
                }
                isLoading.value = false
            }
        })
        .catch((e) => {
            isAlertVisible.value = true
            flashMessage.value.message = e.response.data.message as string
            isLoading.value = false
            flashMessage.value.type = 'error'
            console.error(e)
        })
}

const fetchDetailEmployee = () => {
    axios.get(`/employee/${route.query.id}`)
        .then((response) => {
            const data = response.data.data
            const urlImageEmployee = "https://dev.goodsoneid.com/storage/uploads/employee/"

            payload.value = {
                dateofbirth: data.dateofbirth,
                email: data.email,
                fullname: data.fullname,
                gender: data.gender == 1 ? "Male" : "Female",
                employee_number: data.employee_number,
                department_id: data.department.name,
                position_id: data.position.name
            }
            imagePreview.value = `${urlImageEmployee}${data.photo}`
            ktpImagePreview.value = `${urlImageEmployee}${data.ktp_img}`
            vaccineImagePreview.value = `${urlImageEmployee}${data.vaccine_img}`
        })
}

onMounted(() => fetchDetailEmployee())
</script>

<template>
    <VCard title="Personal Information">
        <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type" variant="tonal" />
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
            <VForm ref="refVForm" class="mt-6" @submit.prevent="submitEmployee">
                <VRow>
                    <VCol md="6" cols="12">
                        <AppTextField v-model="payload.employee_number" label="Employee Number" type="text"
                            :rules="[requiredValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppTextField v-model="payload.fullname" label="Employee Name" type="text"
                            :rules="[requiredValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppTextField v-model="payload.email" label="Email" type="text"
                            :rules="[requiredValidator, emailValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppTextField prefix="+62" v-model="payload.phone_number" label="Phone number" type="text"
                            :rules="[requiredValidator, betweenValidator(payload.phone_number, 10, 12)]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppDateTimePicker v-model="payload.dateofbirth" label="Date of Birth"
                            :rules="[requiredValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppSelect v-model="payload.gender" label="Gender" :items="genders" item-title="title"
                            item-value="value" :rules="[requiredValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppSelect v-model="payload.department_id" label="Department" :items="departments" item-title="name"
                            item-value="id" :rules="[requiredValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <AppSelect v-model="payload.position_id" label="Position" :items="positions" item-title="name"
                            item-value="id" :rules="[requiredValidator]" />
                    </VCol>
                    <VCol md="6" cols="12">
                        <div class="d-flex flex-column">
                            <VFileInput v-model="ktpImage" accept="image/*" label="Upload KTP" show-size
                                @update:model-value="((e: Event) => uploadKtpImage(e))" />
                            <VImg v-if="ktpImagePreview" :height="140" :src="ktpImagePreview" class="mt-5" />
                        </div>
                    </VCol>
                    <VCol md="6" cols="12">
                        <div class="d-flex flex-column">
                            <VFileInput v-model="vaccineImage" accept="image/*" label="Upload Vaccine" show-size
                                @update:model-value="((e: Event) => uploadVaccineImage(e))" />
                            <VImg v-if="vaccineImagePreview" :height="140" :src="vaccineImagePreview" class="mt-5" />
                        </div>
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
</template>