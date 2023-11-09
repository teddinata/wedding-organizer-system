<script setup lang="ts">
import axios from '@axios'
import { VForm } from 'vuetify/components/VForm'
import { requiredValidator, currencyIndonesiaValidator } from '@validators'

interface Props {
    salary: string
    loan_limit: string
}

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


const route = useRoute()
const router = useRouter()

// fetch allowance
const allowances = ref()
const fetchAllowance = () => {
    axios.get('/allowance')
        .then((response) => {
            allowances.value = response.data.data.data
        })
        .catch((e) => {
            console.error(e)
        })
}

onMounted(() => fetchAllowance())

const payload = ref<Props>({
    salary: '',
    loan_limit: ''
})
const isLoading = ref<boolean>(false)

const refVForm = ref<VForm>()
const disabledAllowances = ref<number[]>([])

watch(() => payload.value.salary, (newValue, oldValue) => {
    if (newValue && oldValue) {
        if (newValue !== oldValue) {
            let cleanedValue = newValue.replace(/\D/g, '').replace(/^0+/, '');

            if (cleanedValue.length > 0) {
                cleanedValue = new Intl.NumberFormat('id-ID').format(+cleanedValue);
            }

            payload.value.salary = cleanedValue;
        }
    }
})

watch(() => payload.value.loan_limit, (newValue, oldValue) => {
    if (newValue && oldValue) {
        if (newValue !== oldValue) {
            let cleanedValue = newValue.replace(/\D/g, '').replace(/^0+/, '');

            if (cleanedValue.length > 0) {
                cleanedValue = new Intl.NumberFormat('id-ID').format(+cleanedValue);
            }

            payload.value.loan_limit = cleanedValue;
        }
    }
})

const employee = ref<EmployeeProps>({
    nik: '',
    fullname: '',
    dateofbirth: '',
    department_id: null,
    position_id: null,
    email: '',
    gender: '',
    phone_number: '',
})

const imagePreview = ref()
const ktpImagePreview = ref()
const vaccineImagePreview = ref()

const fetchDetailEmployee = () => {
    axios.get(`/employee/${route.query.id}`)
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

// submit loan config
const submitLoanConfig = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (route.query.id !== undefined) {
                    axios.post(`/employee/${route.query.id}?_method=PUT`, {
                        salary: payload.value.salary.replaceAll('.', ''),
                        loan_limit: payload.value.loan_limit.replaceAll('.', ''),
                        photo: imagePreview.value,
                        ktp_img: ktpImagePreview.value,
                        vaccine_img: vaccineImagePreview.value,
                        dateofbirth: employee.value.dateofbirth,
                        email: employee.value.email,
                        fullname: employee.value.fullname,
                        gender: employee.value.gender == 1 ? "Male" : "Female",
                        nik: employee.value.nik,
                        department_id: employee.value.department_id,
                        position_id: employee.value.position_id

                    })
                        .then((response) => {
                            router.push({
                                name: 'employee-list',
                                query: {
                                    message: response.data.message,
                                    type: 'success'
                                }
                            })
                            isLoading.value = false
                        })
                        .catch((e) => {
                            isLoading.value = false
                            console.error(e)
                        })
                }
            }
        })
    isLoading.value = false
}
</script>

<template>
    <VCard title="Salary Information">
        <VDivider />
        <VCardText class="pt-2">
            <VForm ref="refVForm" class="mt-2" @submit.prevent="submitLoanConfig()">
                <VRow>
                    <VCol cols="12">
                        <AppTextField v-model="payload.salary" label="Basic Salary" type="text" placeholder="Rp 0"
                            :rules="[requiredValidator, currencyIndonesiaValidator(payload.salary)]" />
                    </VCol>

                    <VCol cols="12">
                        <VTable class="text-no-wrap rounded border">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">
                                        Allowance
                                    </th>
                                    <th scope="col">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(allowance, i) in allowances" :key="i">
                                    <td>
                                        <VCheckbox v-model="disabledAllowances" :value="allowance.id" />
                                    </td>
                                    <td>
                                        {{ allowance.name }}
                                    </td>
                                    <td>
                                        <AppTextField type="text" placeholder="Rp 0"
                                            :disabled="!disabledAllowances.includes(allowance.id)"
                                            :rules="[disabledAllowances.includes(allowance.id) ? requiredValidator : null]" />
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                    </VCol>
                    <VCol cols="12">
                        <AppTextField v-model="payload.loan_limit" label="Loan limit" type="text" placeholder="Rp 0"
                            :rules="[requiredValidator, currencyIndonesiaValidator(payload.salary)]" />
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