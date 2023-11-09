<script setup lang="ts">
const route = useRoute()

const activeTab = ref(route.params.tab)

const tabs = [
    { title: 'Personal Information', tab: 'personal-information' },
    { title: 'Salary Information', tab: 'salary-information' }
]
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VBreadcrumbs :items="['Employee', route.query.id !== undefined ? 'EDIT' : 'ADD']" />
    </VCol>

    <VCol cols="12" class="h-full">
      <VTabs v-model="activeTab" class="v-tabs-pill">
        <VTab
          v-for="(item, i) in tabs" :key="i" :value="item.tab"
          :to="{ name: 'employee-tab', params: { tab: item.tab }, query: { id: route.query.id ? route.query.id : undefined } }"
          :disabled="item.tab === 'salary-information' && route.query.id === undefined ? true : false"
        >
          {{ item.title }}
        </VTab>
      </VTabs>

      <VWindow v-model="activeTab" class="mt-6 disable-tab-transition" :touch="false">
        <!-- Personal Information -->
        <VWindowItem value="personal-information">
          <EmployeePersonalInformation />
        </VWindowItem>

        <!-- Salary Information -->

        <VWindowItem value="salary-information">
          <SalaryLoanConfig />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>