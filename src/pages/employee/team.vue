<script setup lang="ts">
import axios from '@axios'
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { useErrorMessage } from '@core/composable/useErrorMessage'
import { requiredValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number; last_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 })
const flashMessage = ref<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    message: '',
    type: 'success'
})
const search = ref<string>('')
const teams = ref()
const totalTeams = ref<number>(0)
const toPage = ref<number>(0)

const allowanceHeaders = [
    { title: 'NAME', key: 'name' },
    // pic with value from relation lead -> name
    { title: 'PIC', key: 'lead[0].fullname' },
    // count data team.team_member
    { title: 'TOTAL MEMBER', key: 'team_member' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]

const fetchTeam = () => {
    axios.get('/team', {
        params: {
            page: options.current_page,
            per_page: options.per_page
        }
    })
        .then((response) => {
            teams.value = response.data.data
            totalTeams.value = response.data.data.total as number
            options.current_page = response.data.data.current_page,
                options.per_page = response.data.data.per_page,
                options.last_page = response.data.data.last_page
        })
        .catch((e) => {
            console.error(e)
        })
}


watch(() => toPage.value, () => fetchTeam())

onMounted(() => 
    fetchTeam()
)

watch(
    () => options.per_page,
    () => fetchTeam()
)

// Create and edit vendor allowance
const refVForm = ref<VForm>()
const isDialogVisible = ref<boolean>(false)
const isAlertVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const teamData = ref()
const payload = ref<{
    name: string | null,
    lead?: number | null,
    employee_id?: number[] | null,
    team_id?: number | null,
    team_member?: number[] | null
}>({
    name: '',
    lead: null,
    employee_id: null,
    team_id: null,
    team_member: null
})

// fetch department
const employees = ref()
watch(() => isDialogVisible.value, (val) => {
    if (val) {
        axios.get(`employee?page=${options.current_page}&per_page=1000`)
            .then((response) => {
                employees.value = response.data.data.data
            })
            .catch((e) => console.error(e))
    }
})

const isAlertDialogVisible = ref<boolean>(false)
const submitTeam = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (teamData.value === undefined) {
                    axios.post('/team', {
                        name: payload.value.name,
                        // lead
                        lead: payload.value.lead,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                name: null,
                                lead: null
                            }
                            fetchTeam()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false;
                            isAlertDialogVisible.value = isError.value;
                            flashMessage.value.message = message
                            flashMessage.value.type = "error";
                            console.error(e.response);
                        })
                } else {
                    axios.put(`/team/${teamData.value.id}`, {
                        name: payload.value.name,
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogVisible.value = false
                            payload.value = {
                                name: null,
                                lead: null
                            }
                            fetchTeam()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false;
                            isAlertDialogVisible.value = isError.value;
                            flashMessage.value.message = message
                            flashMessage.value.type = "error";
                            console.error(e.response);
                        })
                }
            } else {
                isLoading.value = false
            }
        })
}

// Add member

const isDialogMemberVisible = ref<boolean>(false)
const selectedMember = ref<number[]>([])
const submitMember = () => {
    isLoading.value = true
    refVForm.value?.validate()
        .then(({ valid: isValid }) => {
            if (isValid) {
                if (teamData.value === undefined) {
                    axios.post('/team-member', {
                        // team name selected from teamData
                        name: teamData.value.name,
                        // array multiple store id employee
                        employee_id: payload.value.employee_id
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogMemberVisible.value = false
                            payload.value = {
                                name: null,
                                employee_id: null
                            }
                            fetchTeam()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false;
                            isAlertDialogVisible.value = isError.value;
                            flashMessage.value.message = message
                            flashMessage.value.type = "error";
                            console.error(e.response);
                        })
                } else {
                    axios.post(`/team-member`, {
                        // team_id
                        team_id: teamData.value.id,
                        employee_id: payload.value.employee_id
                    })
                        .then((response) => {
                            flashMessage.value.message = response.data.message
                            isLoading.value = false
                            flashMessage.value.type = 'success'
                            isAlertVisible.value = true
                            isDialogMemberVisible.value = false
                            payload.value = {
                                name: null,
                                employee_id: null
                            }
                            fetchTeam()
                        })
                        .catch((e) => {
                            const error = e.response.data.data
                            const { message, isError } = useErrorMessage(error)
                            isLoading.value = false
                            isAlertDialogVisible.value = isError.value
                            flashMessage.value.message = message
                            flashMessage.value.type = 'error'
                            console.error(e.response)
                        })
                }
            } else {
                isLoading.value = false
            }
        })
}

const employee = ref()
watch(() => isDialogMemberVisible.value, (val) => {
    if (val) {
        axios.get(`employee?page=${options.current_page}&per_page=1000`)
            .then((response) => {
                employee.value = response.data.data.data
            })
            .catch((e) => console.error(e))
    }
})




// Delete allowance
const isDeleteDialogVisible = ref<boolean>(false)
const deleteAllowance = () => {
    isLoading.value = true
    axios.delete(`/allowance/${teamData.value.id}`)
        .then((response) => {
            isLoading.value = false
            flashMessage.value.message = response.data.message
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            isDeleteDialogVisible.value = false
            teamData.value = undefined
            if (teams.value.data.length <= 1) toPage.value -= 1
            fetchTeam()
        })
        .catch((e) => {
            isLoading.value = false
            flashMessage.value.message = e.response.data.message as string
            flashMessage.value.type = 'error'
            isAlertVisible.value = true
            console.error(e.response)
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
                                    <VBtn @click="isDialogVisible = !isDialogVisible">
                                        <VIcon start icon="tabler-plus" />Add New
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VCol>
                    </VRow>
                    <div class="mt-5" v-if="teams">
                        <VDivider />
                        <VDataTable :headers="allowanceHeaders" hide-default-footer :search="search"
                            :items="teams.data" :items-per-page="options.per_page">
                            <template #[`item.department.name`]="{ item }">
                                <VChip label size="small" class="text-capitalize" color="primary">{{
                                    item.raw.department.name }}</VChip>
                            </template>

                            <!-- pic -->
                            <template #item.lead[0].fullname="{ item }">
                                <p class="mb-0">{{ item.raw.lead[0].fullname }}</p>
                            </template>

                            <!-- count team member -->
                            <template #item.team_member="{ item }">
                                <p class="mb-0">{{ item.raw.team_member.length }}</p>
                            </template>
                            <template #[`item.actions`]="{ item }">
                                <div class="d-flex gap-1">
                                    <!-- action users -->
                                    <IconBtn @click="() => {
                                        isDialogMemberVisible = true
                                        teamData = item.raw
                                        payload = {
                                            name: item.raw.name,
                                            lead: item.raw.lead[0].id
                                        }
                                    }">
                                        <VIcon icon="tabler-users" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDialogVisible = true
                                        teamData = item.raw
                                        payload = {
                                            name: item.raw.name,
                                            lead: item.raw.lead[0].id
                                        }
                                    }">
                                        <VIcon icon="tabler-edit" />
                                    </IconBtn>
                                    <IconBtn @click="() => {
                                        isDeleteDialogVisible = true
                                        teamData = item.raw
                                    }">
                                        <VIcon icon="tabler-trash" />
                                    </IconBtn>
                                </div>
                            </template>
                            <template #bottom>
                                <VDivider />

                                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                    <p class="text-sm text-disabled mb-0">
                                        {{ paginationMeta(options as Options, totalTeams) }}
                                    </p>
                                    <VPagination v-model="options.current_page"
                                        :total-visible="Math.min(Math.ceil(totalTeams / options.per_page), options.last_page)"
                                        :length="Math.min(Math.ceil(totalTeams / options.per_page), options.last_page)"
                                        @next="(val) => toPage = val" @prev="(val) => toPage = val"
                                        @update:model-value="(val) => toPage = val">
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

        <!-- Add & Edit allowance Dialog -->
        <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                teamData = undefined
                payload = {
                    name: null
                }
                if (isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ teamData ? 'Edit' : 'Add' }} Team</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitTeam()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Team" type="text" :rules="[requiredValidator]"
                                placeholder="Ex: ONIC" />
                        </VCol>
                        <VCol cols="12">
                            <AppSelect :items="employees" v-model="payload.lead" item-title="fullname" item-value="id"
                                :menu-props="{ maxHeight: '400' }" persistent-hint placeholder="Select Employee to be a leader" />
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="isLoading" :disabled="isLoading" type="submit">Save</VBtn>
                                <VBtn type="reset" color="secondary" variant="tonal" class="mx-2">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>


        <!-- add member -->
        <MainDialog v-model:is-dialog-visible="isDialogMemberVisible" @update:is-dialog-visible="(val) => {
            if (!val) {
                teamData = undefined
                payload = {
                    name: null,
                    employee_id: null
                }
                if (isAlertDialogVisible) isAlertDialogVisible = false
            }
            return
        }">
            <div class="mx-auto">
                <h2 class="text-center">{{ teamData ? 'Edit' : 'Add' }} Member</h2>
                <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
                    variant="tonal" />
                <VForm ref="refVForm" @submit.prevent="submitMember()">
                    <VRow class="mt-3">
                        <VCol cols="12">
                            <AppTextField v-model="payload.name" label="Team" type="text" :rules="[requiredValidator]"
                                placeholder="Ex: ONIC" />
                        </VCol>
                        <VCol cols="12">
                            <AppSelect :items="employee" v-model="payload.employee_id" item-title="fullname" item-value="id"
                                :menu-props="{ maxHeight: '400' }" multiple persistent-hint placeholder="Select Employee to be a Member" />
                        </VCol>
                        <VCol cols="12" class="d-flex justify-content-center">
                            <div class="mx-auto">
                                <VBtn :loading="isLoading" :disabled="isLoading" type="submit">Save</VBtn>
                                <VBtn type="reset" color="secondary" variant="tonal" class="mx-2">Reset</VBtn>
                            </div>
                        </VCol>
                    </VRow>
                </VForm>
            </div>
        </MainDialog>

        <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Allowance" @update:is-dialog-visible="(val) => {
            if (!val) {
                teamData = undefined
                payload = {
                    name: null
                }
            }
            return
        }">
            Are you sure want to delete allowance
            <span class="font-weight-bold">{{ teamData && teamData.name }}</span>?
            <VRow justify="end">
                <VCol cols="12">
                    <div class="d-flex align-center justify-end flex-wrap py-5">
                        <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
                            isDeleteDialogVisible = false
                            teamData = undefined
                            payload = {
                                name: null
                            }
                        }" :disabled="isLoading">Cancel</VBtn>
                        <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteAllowance()">
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