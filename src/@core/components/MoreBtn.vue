<script lang="ts" setup>
interface Props {
  menuList?: unknown[]
  itemProps?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <IconBtn
    density="compact"
    color="disabled"
  >
    <VIcon icon="tabler-dots-vertical" />

    <VMenu
      v-if="props.menuList"
      activator="parent"
    >
      <VList
        :items="props.menuList"
        :item-props="props.itemProps"
      />
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.vertical-more {
  position: absolute;
  inset-block-start: 1rem;
  inset-inline-end: 0.5rem;
}
</style>
