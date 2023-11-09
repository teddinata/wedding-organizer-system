<script setup lang="ts">
import axios from "@axios";
import { paginationMeta } from "@core/composable/usePaginationMeta";
import { useErrorMessage } from "@core/composable/useErrorMessage"
import { requiredValidator, currencyIndonesiaValidator, alphaValidator, stringLengthBetweenValidator, currencyIndonesiaBetweenValidator } from "@validators";
import { VForm } from "vuetify/components/VForm";
import { VDataTable } from "vuetify/labs/VDataTable";

interface Options {
  current_page: number;
  per_page: number;
  last_page: number
}

const options = reactive<Options>({ current_page: 1, per_page: 10, last_page: 1 });
const flashMessage = ref<{
  message: string;
  type: "success" | "info" | "warning" | "error";
}>({
  message: "",
  type: "success",
});
const search = ref<string>("");
const limitList = ref();
const totalLimit = ref<number>(0);
const toPage = ref<number>(0);

const limitListHeader = [
  { title: "NAME", key: "name" },
  { title: "LIMIT", key: "amount_limit" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const fetchVendorLimitList = () => {
  axios
    .get('/vendor-limit', {
      params: {
        page: options.current_page,
        per_page: options.per_page
      }
    })
    .then((response) => {
      limitList.value = response.data.data;
      totalLimit.value = response.data.data.total as number;
      (options.current_page = response.data.data.current_page),
        (options.per_page = response.data.data.per_page),
        options.last_page = response.data.data.last_page
    })
    .catch((e) => {
      console.error(e);
    });
};

watch(() => toPage.value, (val) => {
  if (val) fetchVendorLimitList()
})
watch(
  () => options.per_page,
  () => fetchVendorLimitList()
)

onMounted(() => fetchVendorLimitList());

// Create and edit vendor limit
const refVForm = ref<VForm>();
const isDialogVisible = ref<boolean>(false);
const isAlertVisible = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const limitData = ref();
const payload = ref<{ name: string | null; amount_limit: string | number | null }>({
  name: "",
  amount_limit: "",
});

watch(
  () => payload.value.amount_limit,
  (newValue, oldValue) => {
    if (newValue && oldValue) {
      if (newValue !== oldValue) {
        let cleanedValue = String(newValue).replace(/\D/g, "").replace(/^0+/, "");

        if (cleanedValue.length > 0) {
          cleanedValue = new Intl.NumberFormat("id-ID").format(+cleanedValue);
        }

        payload.value.amount_limit = cleanedValue;
      }
    }
  }
);

const isAlertDialogVisible = ref<boolean>(false)
const submitLimit = () => {
  isLoading.value = true;
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      if (limitData.value === undefined) {
        axios
          .post("/vendor-limit", {
            name: payload.value.name,
            amount_limit: +String(payload.value.amount_limit).replaceAll(".", ""),
          })
          .then((response) => {
            flashMessage.value.message = response.data.message;
            isLoading.value = false;
            flashMessage.value.type = "success";
            isAlertVisible.value = true;
            isDialogVisible.value = false;
            payload.value = {
              amount_limit: null,
              name: null
            }
            fetchVendorLimitList();
          })
          .catch((e) => {
            const error = e.response.data.data
            const { message, isError } = useErrorMessage(error)
            isLoading.value = false;
            isAlertDialogVisible.value = isError.value;
            flashMessage.value.message = message
            flashMessage.value.type = "error";
            console.error(e.response);
          });
      } else {
        axios
          .put(`/vendor-limit/${limitData.value.id}`, {
            name: payload.value.name,
            amount_limit: +String(payload.value.amount_limit).replaceAll(".", ""),
          })
          .then((response) => {
            flashMessage.value.message = response.data.message;
            isLoading.value = false;
            flashMessage.value.type = "success";
            isAlertVisible.value = true;
            isDialogVisible.value = false;

            limitData.value = undefined
            payload.value = {
              amount_limit: '',
              name: ''
            }
            fetchVendorLimitList();
          })
          .catch((e) => {
            const error = e.response.data.data
            const { message, isError } = useErrorMessage(error)
            isLoading.value = false;
            isAlertDialogVisible.value = isError.value;
            flashMessage.value.message = message
            flashMessage.value.type = "error";
            console.error(e.response);
          });
      }
    } else {
      isLoading.value = false;
    }
  });
};

// Delete limit
const isDeleteDialogVisible = ref<boolean>(false);
const deleteLimit = () => {
  isLoading.value = true;
  axios
    .delete(`/vendor-limit/${limitData.value.id}`)
    .then((response) => {
      isLoading.value = false;
      flashMessage.value.message = response.data.message;
      flashMessage.value.type = "error";
      isAlertVisible.value = true;
      isDeleteDialogVisible.value = false;
      limitData.value = undefined
      payload.value = {
        amount_limit: null,
        name: null
      }
      if (limitList.value.data.length <= 1) toPage.value -= 1
      fetchVendorLimitList();
    })
    .catch((e) => {
      isLoading.value = false;
      flashMessage.value.message = e.response.data.message as string;
      flashMessage.value.type = "error";
      isAlertVisible.value = true;
      console.log(e.response);
    });

};
</script>

<template>
  <VRow class="match-height">
    <VBreadcrumbs :items="[
      $route.fullPath.split('/')[1].toLocaleUpperCase(),
      $route.fullPath.split('/')[2].toLocaleUpperCase(),
    ]" />

    <VCol cols="12" class="h-full">
      <FlashMessage v-model="isAlertVisible" :message="flashMessage.message" :type="flashMessage.type" variant="tonal" />
      <VCard class="mt-5">
        <VCardItem>
          <VRow justify="space-between">
            <VCol cols="12" md="2" sm="6">
              <AppSelect v-model="options.per_page" :items="[10, 20, 30, 40]" />
            </VCol>
            <VCol cols="12" md="6" sm="6">
              <VRow>
                <VCol cols="8">
                  <AppTextField v-model="search" density="compact" placeholder="Search" single-line hide-details dense
                    outlined />
                </VCol>
                <VCol cols="4">
                  <VBtn @click="isDialogVisible = !isDialogVisible">Add Limit</VBtn>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
          <div class="mt-5" v-if="limitList">
            <VDivider />
            <VDataTable :headers="limitListHeader" hide-default-footer :search="search" :items="limitList.data"
              :items-per-page="options.per_page">
              <template #item.amount_limit="{ item }">
                <span>{{
                  new Intl.NumberFormat("id-ID").format(
                    item.props.title.amount_limit
                  )
                }}</span>
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <IconBtn @click="() => {
                    isDialogVisible = true;
                    limitData = item.props.title;
                    payload = {
                      name: item.props.title.name,
                      amount_limit: new Intl.NumberFormat('id-ID').format(
                        item.props.title.amount_limit
                      ),
                    };
                  }
                    ">
                    <VIcon icon="tabler-edit" />
                  </IconBtn>
                  <IconBtn @click="() => {
                    isDeleteDialogVisible = true;
                    limitData = item.props.title;
                  }
                    ">
                    <VIcon icon="tabler-trash" />
                  </IconBtn>
                </div>
              </template>
              <template #bottom>
                <VDivider />

                <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
                  <p class="text-sm text-disabled mb-0">
                    {{ paginationMeta(options as Options, totalLimit) }}
                  </p>
                  <VPagination v-model="options.current_page"
                    :total-visible="Math.min(Math.ceil(totalLimit / options.per_page), options.last_page)"
                    :length="Math.min(Math.ceil(totalLimit / options.per_page), options.last_page)"
                    @next="(val) => toPage = val" @prev="(val) => toPage = val"
                    @update:model-value="(val) => toPage = val">
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
          </div>
        </VCardItem>
      </VCard>
    </VCol>

    <!-- Add & Edit Limit Dialog -->
    <MainDialog v-model:is-dialog-visible="isDialogVisible" @update:is-dialog-visible="(val) => {
      if (!val) {
        limitData = undefined
        payload = {
          amount_limit: null,
          name: null
        }
        if (isAlertDialogVisible) isAlertDialogVisible = false
      }
      return
    }
      ">
      <div class="mx-auto">
        <h2 class="text-center">{{ limitData ? "Edit" : "Add" }} Limit</h2>
        <FlashMessage v-model="isAlertDialogVisible" :message="flashMessage.message" :type="flashMessage.type"
          variant="tonal" class="mt-4" />
        <VForm ref="refVForm" @submit.prevent="submitLimit()">
          <VRow class="mt-3">
            <VCol cols="12">
              <AppTextField v-model="payload.name" label="Name" type="text"
                :rules="[requiredValidator, stringLengthBetweenValidator(payload.name as string, 1, 15), alphaValidator]"
                placeholder="Ex. Green" />
            </VCol>
            <VCol cols="12">
              <AppTextField v-model="payload.amount_limit" label="Limit" type="text" :rules="[
                requiredValidator,
                currencyIndonesiaValidator(payload.amount_limit),
                currencyIndonesiaBetweenValidator(payload.amount_limit, 1000000, 500000000)
              ]" placeholder="0" />
            </VCol>
            <VCol cols="12" class="d-flex justify-content-center">
              <div class="mx-auto">
                <VBtn :loading="isLoading" :disabled="isLoading" type="submit">Save</VBtn>
                <VBtn type="reset" color="secondary" variant="tonal" class="mx-2">Reset</VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </div>
    </MainDialog>

    <!-- Delete Limit Dialog -->
    <MainDialog v-model:is-dialog-visible="isDeleteDialogVisible" title="Delete Limit" @update:is-dialog-visible="(val) => {
      if (!val) {
        limitData = undefined
        payload = {
          amount_limit: null,
          name: null
        }
      }
      return
    }">
      Are you sure want to delete limit
      <span class="font-weight-bold">{{ limitData && limitData.name }}</span>?
      <VRow justify="end">
        <VCol cols="12">
          <div class="d-flex align-center justify-end flex-wrap py-5">
            <VBtn type="reset" color="secondary" variant="tonal" class="mx-2" @click="() => {
              isDeleteDialogVisible = false
              limitData = undefined
              payload = {
                amount_limit: null,
                name: null
              }
            }" :disabled="isLoading">Cancel</VBtn>
            <VBtn :loading="isLoading" :disabled="isLoading" color="error" @click="deleteLimit()">
              Delete</VBtn>
          </div>
        </VCol>
      </VRow>
    </MainDialog>
  </VRow>
</template>

<style lang="scss">
.v-text-field .v-input__details {
  padding-inline-start: 0;
}

.match-height.v-row .v-card {
  block-size: auto;
}
</style>