<script setup lang="ts">
import axios from '@axios'
</script>

<template>
  <VRow>
    <!-- <VCol cols="12">
            <VCard v-if="props.userData">
                <VCardText class="text-center pt-15">
                    <VAvatar rounded :size="100" :color="!props.userData.avatar ? 'primary' : undefined"
                        :variant="!props.userData.avatar ? 'tonal' : undefined">
                        <VImg v-if="props.userData.avatar" :src="props.userData.avatar" />
                        <span v-else class="text-5xl font-weight-medium">
                            {{ avatarText(props.userData.fullName) }}
                        </span>
                    </VAvatar>

                    <h6 class="text-h4 mt-4">
                        {{ props.userData.fullName }}
                    </h6>

                    <VChip label :color="resolveUserRoleVariant(props.userData.role).color" size="small"
                        class="text-capitalize mt-3">
                        {{ props.userData.role }}
                    </VChip>
                </VCardText>

                <VCardText class="d-flex justify-center flex-wrap mt-3">
                    <div class="d-flex align-center me-8">
                        <VAvatar :size="38" rounded color="primary" variant="tonal" class="me-3">
                            <VIcon icon="tabler-checkbox" />
                        </VAvatar>

                        <div>
                            <h6 class="text-h6">
                                {{ kFormatter(props.userData.taskDone) }}
                            </h6>
                            <span class="text-sm">Task Done</span>
                        </div>
                    </div>

                    <div class="d-flex align-center me-4">
                        <VAvatar :size="38" rounded color="primary" variant="tonal" class="me-3">
                            <VIcon icon="tabler-briefcase" />
                        </VAvatar>

                        <div>
                            <h6 class="text-h6">
                                {{ kFormatter(props.userData.projectDone) }}
                            </h6>
                            <span class="text-sm">Project Done</span>
                        </div>
                    </div>
                </VCardText>

                <VDivider />

                <VCardText>
                    <p class="text-sm text-uppercase text-disabled">
                        Details
                    </p>

                    <VList class="card-list mt-2">
                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Username:
                                    <span class="text-body-1">
                                        {{ props.userData.fullName }}
                                    </span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Email:
                                    <span class="text-body-1">{{ props.userData.email }}</span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Status:

                                    <VChip label size="small" :color="resolveUserStatusVariant(props.userData.status)"
                                        class="text-capitalize">
                                        {{ props.userData.status }}
                                    </VChip>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Role:
                                    <span class="text-capitalize text-body-1">{{ props.userData.role }}</span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Tax ID:
                                    <span class="text-body-1">
                                        {{ props.userData.taxId }}
                                    </span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Contact:
                                    <span class="text-body-1">{{ props.userData.contact }}</span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Language:
                                    <span class="text-body-1">{{ props.userData.language }}</span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>

                        <VListItem>
                            <VListItemTitle>
                                <h6 class="text-h6">
                                    Country:
                                    <span class="text-body-1">{{ props.userData.country }}</span>
                                </h6>
                            </VListItemTitle>
                        </VListItem>
                    </VList>
                </VCardText>

                <VCardText class="d-flex justify-center">
                    <VBtn variant="elevated" class="me-4" @click="isUserInfoEditDialogVisible = true">
                        Edit
                    </VBtn>

                    <VBtn variant="tonal" color="error">
                        Suspend
                    </VBtn>
                </VCardText>
            </VCard>
        </VCol> -->
  </VRow>
</template>