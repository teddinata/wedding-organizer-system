<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'

interface Props {
    data: {
        id: number;
        vendor_limit_id: number;
        vendor_grade_id: number;
        membership_id: number;
        logo: null | string;
        code: string;
        name: string;
        point: number;
        email: string;
        email_verified_at: null | Date;
        password: null | string;
        otp: null | string;
        otp_verified_at: null | Date;
        reset_token: null | string;
        notification_token: null | string;
        otp_email: null | string;
        is_first_login: number;
        contact_person: string;
        contact_number: string;
        website: string;
        instagram: string;
        address: string;
        city: string;
        created_by: number;
        updated_by: number;
        deleted_by: null | number;
        created_at: Date;
        updated_at: Date;
        deleted_at: null | Date;
    }
}

const props = defineProps<Props>()
const refVForm = ref<VForm>()
</script>

<template>
    <VCard v-if="props.data">
        <VCardItem>
            <VCardTitle>Account</VCardTitle>
            <VImg src="https://avatars.githubusercontent.com/u/33148052?v=4" :width="100" cover aspect-ratio="4/3"
                class="rounded my-5" />

            <VDivider />

            <VForm ref="refVForm" @submit.prevent="() => { }">
                <VRow class="mt-3">
                    <VCol cols="12" md="6">
                        <AppTextField v-model="props.data.name" label="Full Name" type="text" :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField v-model="props.data.email" label="Email" type="text" :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField v-model="props.data.contact_number" label="Phone Number" type="text"
                            :disabled="true" />
                    </VCol>
                </VRow>
                <div class="d-flex flex-row gap-3 my-5">
                    <VBtn>Save Changes</VBtn>
                    <VBtn color="warning">Generate Password</VBtn>
                    <VBtn color="secondary">Reset</VBtn>
                </div>
            </VForm>
        </VCardItem>
    </VCard>
</template>