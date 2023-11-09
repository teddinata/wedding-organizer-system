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
            <VCardTitle class="my-5">Shipping Address</VCardTitle>

            <VDivider />

            <VForm ref="refVForm" @submit.prevent="() => { }">
                <VRow class="mt-3">
                    <VCol cols="12" md="6">
                        <AppTextField v-model="props.data.contact_person" label="Receipt Name" type="text"
                            :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField v-model="props.data.contact_number" label="Receipt Phone Number" type="text"
                            :disabled="true" />
                    </VCol>
                    <VCol cols="12">
                        <AppTextField v-model="props.data.address" label="Address" type="text" :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField label="Province" type="text"
                            :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField v-model="props.data.city" label="City" type="text"
                            :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField label="District" type="text"
                            :disabled="true" />
                    </VCol>
                    <VCol cols="12" md="6">
                        <AppTextField label="ZIP Code" type="text"
                            :disabled="true" />
                    </VCol>
                </VRow>
            </VForm>
        </VCardItem>
</VCard></template>