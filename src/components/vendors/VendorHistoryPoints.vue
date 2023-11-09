<script setup lang="ts">
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10 })
const unpaidHeaders = [
    { title: 'ORDER CODE', key: 'name' },
    { title: 'EVENT DATE', key: 'email' },
    { title: 'AMOUNT', key: 'vendor_limit.name' },
    { title: 'POINT', key: 'action' }
]
</script>

<template>
    <VRow>
        <VCol cols="12">
            <VCard>
                <VCardItem>
                    <VCol cols="3">
                        <AppSelect v-model="options.per_page" :items="[10, 20, 30, 40]" />
                    </VCol>
                    <VDataTable :headers="unpaidHeaders" :items="[]" :items-per-page="options.per_page">
                        <template #bottom>
                            <VDivider />

                            <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                <p class="text-sm text-disabled mb-0">
                                    {{ paginationMeta(options as Options, 10) }}
                                </p>
                                <VPagination v-model="options.current_page" :total-visible="Math.min(Math.ceil(10 / 10), 2)"
                                    :length="Math.min(Math.ceil(10 / 10), 2)">
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
                </VCardItem>
            </VCard>
        </VCol>
    </VRow>
</template>