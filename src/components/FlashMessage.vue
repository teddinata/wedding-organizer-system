<script setup lang="ts">
interface Props {
    type?: 'success' | 'info' | 'warning' | 'error'
    variant: 'outlined' | 'tonal'
    message: string
}

const props = withDefaults(defineProps<Props>(), {
    type: 'success',
})
</script>

<template>
    <VAlert closable close-label="Close Alert" :variant="variant" :color="type">
        {{ props.message }}
    </VAlert>
</template>