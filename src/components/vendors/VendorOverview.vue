<script setup lang="ts">
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
</script>

<template>
    <VRow v-if="props.data">
        <VCol cols="12" md="6">
            <VCard>
                <VCardItem>
                    <div class="d-flex flex-column gap-3">
                        <VIcon icon="tabler-award" size="x-large" />
                        <span class="text-xl font-weight-bold">Points Balance</span>
                        <span class="text-xl text-primary">{{ props.data.point }} <sub class="text-sm">pts</sub></span>
                        <span class="text-lead">Point balance</span>
                    </div>
                </VCardItem>
            </VCard>
        </VCol>
        <VCol cols="12" md="6">
            <VCard>
                <VCardItem>
                    <div class="d-flex flex-column gap-3">
                        <VIcon icon="tabler-gift" size="x-large" />
                        <span class="text-xl font-weight-bold">Loyalty Program</span>
                        <span class="text-md text-success">Platinum Member</span>
                        <span class="text-lead">3.000 points to next tier</span>
                    </div>
                </VCardItem>
            </VCard>
        </VCol>
        <VCol cols="12" md="6">
            <VCard>
                <VCardItem>
                    <div class="d-flex flex-column gap-3">
                        <VIcon icon="tabler-currency-dollar" size="x-large" />
                        <span class="text-xl font-weight-bold">Order Limit</span>
                        <span class="text-md text-success">100 Millions</span>
                        <span class="text-lead">Setting limit for order</span>
                    </div>
                </VCardItem>
            </VCard>
        </VCol>
        <VCol cols="12" md="6">
            <VCard>
                <VCardItem>
                    <div class="d-flex flex-column gap-3">
                        <VIcon icon="tabler-adjustments" size="x-large" />
                        <span class="text-xl font-weight-bold">Grade</span>
                        <span class="text-md text-info">Grade A</span>
                        <span class="text-lead">Setting grade for easy follow up</span>
                    </div>
                </VCardItem>
            </VCard>
        </VCol>
    </VRow>
</template>