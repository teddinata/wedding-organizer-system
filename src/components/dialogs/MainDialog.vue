<script setup lang="ts">
interface Props {
    width?: number
    title?: string
    isDialogVisible: boolean
}
interface Emit {
    (e: 'update:isDialogVisible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    width: 500,
    isDialogVisible: false
})

const emit = defineEmits<Emit>()
</script>

<template>
    <VDialog persistent :model-value="props.isDialogVisible" :width="props.width"
        @update:model-value="(val) => $emit('update:isDialogVisible', val)">
        <!-- Dialog close btn -->
        <DialogCloseBtn @click="emit('update:isDialogVisible', false)" />

        <!-- Dialog Content -->
        <VCard :title="$props.title">
            <VCardText>
                <slot />
            </VCardText>
        </VCard>
    </VDialog>
</template>