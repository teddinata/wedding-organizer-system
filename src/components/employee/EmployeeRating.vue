<script setup lang="ts">
import { paginationMeta } from '@core/composable/usePaginationMeta'
import { VDataTable } from 'vuetify/labs/VDataTable'

interface Options { current_page: number; per_page: number }

const options = reactive<Options>({ current_page: 1, per_page: 10 })
const search = ref<string>()
const ratingHeaders = [
    { title: 'ORDER CODE', key: 'image' },
    { title: 'VENUE', key: 'name' },
    { title: 'EVENT DATE', key: 'from' },
    { title: 'RATING', key: 'until' },
    { title: 'POINTS', key: 'until' },
    { title: 'ACTIONS', key: 'actions', sortable: false }
]
const totalRatings = ref<number>(0)
const toPage = ref<number>(0)

</script>

<template>
    <VRow>
        <VCol cols="12">
            <VCard>
                <VCardItem>
                    <VDataTable :headers="ratingHeaders" hide-default-footer :search="search" :items="[]"
                        :items-per-page="options.per_page">
                        <template #item.actions="{ item }">
                            <VMenu location="start">
                                <template #activator="{ props }">
                                    <VBtn v-bind="props" variant="plain">
                                        <VIcon icon="tabler-dots-vertical" />
                                    </VBtn>
                                </template>

                                <VList>
                                    <VListItem class="cursor-pointer" @click="() => { }">View Rating</VListItem>
                                </VList>
                            </VMenu>
                        </template>
                        <template #bottom>
                            <VDivider />

                            <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                                <p class="text-sm text-disabled mb-0">
                                    {{ paginationMeta(options as Options, totalRatings) }}
                                </p>
                                <VPagination v-model="options.current_page"
                                    :total-visible="Math.min(Math.ceil(totalRatings / 10), 2)"
                                    :length="Math.min(Math.ceil(totalRatings / 10), 2)" @next="(val) => toPage = val"
                                    @prev="(val) => toPage = val" @update:model-value="(val) => toPage = val">
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