<script setup lang="ts">
interface Props {
    employee: any
}

const props = defineProps<Props>()

const profileAbout = computed(() => {
    const emp = props.employee
    return [
        { title: 'Employee ID', icon: 'tabler-id-badge', data: emp.nik },
        { title: 'Full Name', icon: 'tabler-user', data: emp.fullname },
        { title: 'Date of Birth', icon: 'tabler-calendar-event', data: emp.dateofbirth },
        { title: 'Gender', icon: 'tabler-venus', data: emp.gender == 1 ? "Male" : "Female" },
        { title: 'Status', icon: 'tabler-check', data: emp.isActive == 1 ? "Active" : "Inactive" },
        { title: 'Position', icon: 'tabler-crown', data: emp.position.name },
    ]
})

const profileContact = computed(() => {
    const emp = props.employee
    return [
        { title: 'Contact', icon: 'tabler-phone', data: emp.phone_number },
        { title: 'Email', icon: 'tabler-mail', data: emp.email },
    ]
})
</script>

<template>
    <VRow v-if="$props.employee">
        <VCol md="4" cols="12">
            <VCard>
                <VCardText>
                    <p class="text-xs">
                        ABOUT
                    </p>
                    <VList class="card-list text-medium-emphasis">
                        <VListItem v-for="(item, i) in profileAbout" :key="i">
                            <template #prepend>
                                <VIcon :icon="item.icon" size="20" class="me-2" />
                            </template>
                            <VListItemTitle>
                                <span class="font-weight-medium me-1">{{ item.title }}:</span>
                                <span>{{ item.data }}</span>
                            </VListItemTitle>
                        </VListItem>
                    </VList>

                    <p class="text-xs mt-5">
                        Contact
                    </p>
                    <VList class="card-list text-medium-emphasis">
                        <VListItem v-for="(item, i) in profileContact" :key="i">
                            <template #prepend>
                                <VIcon :icon="item.icon" size="20" class="me-2" />
                            </template>
                            <VListItemTitle>
                                <span class="font-weight-medium me-1">{{ item.title }}:</span>
                                <span>{{ item.data }}</span>
                            </VListItemTitle>
                        </VListItem>
                    </VList>
                </VCardText>
            </VCard>
        </VCol>

        <VCol cols="12" md="8">
            <VRow>
                <VCol cols="12" md="6">
                    <VCard>
                        <VCardText>
                            <div class="d-flex flex-column gap-2">
                                <VAvatar rounded variant="tonal" color="primary" icon="tabler-award" />
                                <span class="text-lg font-weight-bold">Employee Point</span>
                                <span class="text-lg">
                                    <span class="text-primary">{{ employee.points }}</span>
                                    <sub class="ms-1">pts</sub>
                                </span>
                                <span class="text-md text-disabled">Point Balance</span>
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>

                <VCol cols="12" md="6">
                    <VCard>
                        <VCardText>
                            <div class="d-flex flex-column gap-2">
                                <VAvatar rounded variant="tonal" color="success" icon="tabler-gift" />
                                <span class="text-lg font-weight-bold">Current Rank</span>
                                <VChip label size="small" class="text-capitalize w-25 text-center" color="success">{{
                                    employee.level.name }}
                                </VChip>
                                <span class="text-md text-disabled">{{ employee.level.until -
                                    employee.points }} point{{ employee.level.until - employee.points == 1 ? '' : 's' }} to
                                    next tier</span>
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>

                <VCol cols="12" md="6">
                    <VCard>
                        <VCardText>
                            <div class="d-flex flex-column gap-2">
                                <VAvatar rounded variant="tonal" color="warning" icon="tabler-star" />
                                <span class="text-lg font-weight-bold">Rating</span>
                                <span class="text-lg">
                                    <span class="text-warning">4.7</span>
                                    <sub class="ms-1">({{ new Intl.NumberFormat('id-Id').format(1000) }})</sub>
                                </span>
                            </div>
                        </VCardText>
                    </VCard>
                </VCol>
            </VRow>
        </VCol>
    </VRow>
</template>