<script setup lang="ts">
import { VForm } from "vuetify/components/VForm";
import axios from "@axios";
import { useAppAbility } from "@/plugins/casl/useAppAbility";
import authV1BottomShape from "@images/svg/auth-v1-bottom-shape.svg?raw";
import authV1TopShape from "@images/svg/auth-v1-top-shape.svg?raw";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import { emailValidator, requiredValidator } from "@validators";
import { useCookies } from "@vueuse/integrations/useCookies";
import { CookieSetOptions } from "universal-cookie";

const ability = useAppAbility();
const router = useRouter();
const route = useRoute();
const cookies = useCookies([
  "role",
  "userData",
  "accessToken",
  "userAbilities",
]);

const flashMessage = ref<{
  message: string;
  type: "success" | "info" | "warning" | "error";
}>({
  message: "",
  type: "success",
});
const isLoading = ref<boolean>(false);
const isAlertVisible = ref<boolean>(false);

const form = ref({
  email: "",
  password: "",
  remember: false,
});

const refVForm = ref<VForm>();
const isPasswordVisible = ref(false);

const setExpires = (): CookieSetOptions | undefined => {
  if (form.value.remember) {
    return {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    };
  }
  return;
};

const login = () => {
  isLoading.value = true;
  axios
    .post("/login", { email: form.value.email, password: form.value.password })
    .then((response) => {
      const data = response.data;
      cookies.set(
        "role",
        JSON.stringify(data.user.roles),
        form.value.remember ? setExpires() : undefined
      );
      ability.update(data.user.roles);

      if (
        data.user.roles.some(
          (role: { name: string }) => role.name === "Super Admin"
        )
      ) {
        cookies.set(
          "userAbilities",
          JSON.stringify([{ action: "manage", subject: "all" }]),
          form.value.remember ? setExpires() : undefined
        );
        ability.update([{ action: "manage", subject: "all" }]);
      }

      cookies.set(
        "userData",
        JSON.stringify(data.user),
        form.value.remember ? setExpires() : undefined
      );
      cookies.set(
        "accessToken",
        JSON.stringify(data.token),
        form.value.remember ? setExpires() : undefined
      );

      router.replace(route.query.to ? String(route.query.to) : "/");
      isLoading.value = false;
    })
    .catch((e) => {
      if (e) {
        console.error(e);
        flashMessage.value.message =
          "Your email and/or password is incorrect, please try again.";
        isLoading.value = false;
        flashMessage.value.type = "error";
        isAlertVisible.value = true;
      }
    });
};

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) login();
  });
};
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard class="auth-card pa-4" max-width="448">
        <VCardItem class="justify-center">
          <template #prepend>
            <div class="d-flex">
              <VNodeRenderer :nodes="themeConfig.app.logo" class="app-logo" />
            </div>
          </template>
        </VCardItem>

        <VCardText class="pt-1">
          <h5 class="text-h5 mb-1">
            Welcome to
            <span class="text-capitalize">{{ themeConfig.app.title }}</span
            >! 👋🏻
          </h5>
          <p class="mb-0">
            Please sign-in to your account and access the admin panel
          </p>
        </VCardText>

        <VCardText>
          <FlashMessage
            v-model="isAlertVisible"
            :message="flashMessage.message"
            :type="flashMessage.type"
            variant="tonal"
          />
          <VForm ref="refVForm" @submit.prevent="() => onSubmit()">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="Enter your email address"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  placeholder="············"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :rules="[requiredValidator]"
                />

                <div
                  class="d-flex align-center justify-space-between flex-wrap mt-2 mb-4"
                >
                  <VCheckbox v-model="form.remember" label="Remember me" />

                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    to="/auth/forgot-password"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                  :disabled="isLoading"
                >
                  Sign in
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<style lang="scss" scoped>
.app-logo {
  width: 4rem;
  height: 4rem;
}
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
