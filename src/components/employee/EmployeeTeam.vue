<script setup lang="ts"></script>

<template>
  <VRow>
    <VCol sm="6" lg="4" cols="12">
      <VCard>
        <div class="vertical-more">
          <MoreBtn
            :menu-list="[
              { title: 'View Profile', value: 'View Profile' },
            ]" item-props
          />
        </div>

        <VCardItem>
          <VCardTitle class="d-flex flex-column align-center justify-center">
            <VAvatar
              size="100"
              image="https://assets.ayobandung.com/crop/0x0:0x0/750x500/webp/photo/2023/06/30/Untitled-3589326714.png"
            />

            <p class="mt-4 mb-0">
              Gita Sekar
            </p>
            <span class="text-body-1">Tukang</span>

            <div class="d-flex align-center flex-wrap gap-2 mt-2">
              <VAvatar rounded variant="tonal" color="success" icon="tabler-phone" />
              <VAvatar rounded variant="tonal" color="secondary" icon="tabler-mail" />
            </div>
          </VCardTitle>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>