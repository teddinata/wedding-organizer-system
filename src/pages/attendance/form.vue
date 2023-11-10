<script setup lang="ts">
import axios from '@axios'
import { requiredValidator, emailValidator } from '@validators'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { VForm } from 'vuetify/components/VForm'

interface Options { current_page: number; per_page: number; last_page: number }
const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const search = ref<string>('')
const employee = ref()
const totalEmployee = ref<number>(0)
const toPage = ref<number>(0)
interface Payload {
    date: string;
    clock_in: string;
    clock_out: string;
    employee_id: number;
}

const payload = ref<Payload>({
    date: '',
    clock_in: '',
    clock_out: '',
    employee_id: 0
})

const route = useRoute()
const router = useRouter()

// attendance
const refVForm = ref<VForm>()
const image = ref()
const isLoading = ref<boolean>(false)
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const isAlertVisible = ref<boolean>(false)

const fetchEmployee = () => {
    axios.get(`/employee?page=${options.current_page}&per_page=1000`)
        .then((response) => {
            employee.value = response.data.data.data
            totalEmployee.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
                console.log(employee.value)
        })
        .catch((e) => {
            console.error(e)
        })
}

const submitAttendance = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (route.query.id === undefined) {
                    const formData = new FormData()

                    formData.append('date', payload.value.date)
                    formData.append('clock_in', payload.value.clock_in)
                    formData.append('clock_out', payload.value.clock_out)
                    formData.append('employee_id', payload.value.employee_id.toString())

                    axios.post('/attendance', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        }
                    })
                        .then((response) => {
                            router.push({
                                name: 'attendance-summary',
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

onMounted(() => 
    fetchEmployee()
)
</script>

<template>
    <VRow class="match-height">
        <VCol cols="12">
            <VBreadcrumbs :items="['Attendance', route.query.id !== undefined ? 'EDIT' : 'ADD']" />
        </VCol>
        <VCol cols="12" class="h-full">
            <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type"
                variant="tonal" />
            <VCard title="Attendance Form" class="mt-3">

                <VDivider />

                <VCardText class="pt-2">
                    <VForm ref="refVForm" class="mt-6" @submit.prevent="() => submitAttendance()">
                        <VRow>
                            <!-- form date input for date -->
                            <VCol md="6" cols="12">
                                <!-- datepicker -->
                                <AppDateTimePicker v-model="payload.date" label="Date" type="text" 
                                    :config="{ 
                                        enableTime: false, 
                                        noCalendar: false, 
                                        dateFormat: 'Y-m-d', 
                                        minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                        maxDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                                        
                                    }"  />
                            </VCol>
                            <VCol md="6" cols="12">
                                <AppSelect v-model="payload.employee_id" :items="employee" item-value="id" item-title="fullname"
                                    label="Employee" type="text" :rules="[requiredValidator]" />
                            </VCol>
                            <VCol md="6" cols="12">
                                <!-- datepicker -->
                                <AppDateTimePicker v-model="payload.clock_in" label="Clock In" type="text" :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"  />
                            </VCol>
                            <VCol md="6" cols="12">
                                <!-- datepicker -->
                                <AppDateTimePicker v-model="payload.clock_out" label="Clock Out" type="text" :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"  />
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