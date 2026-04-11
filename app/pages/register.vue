<script setup lang="ts">
const route = useRoute();
const { register, loading } = useAuth();

const name = ref("");
const arrivalMonth = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/")
    ? redirect
    : "/onboarding";
});

const resolveErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const maybeStatusMessage = (error as { statusMessage?: unknown }).statusMessage;
    if (typeof maybeStatusMessage === "string" && maybeStatusMessage.length > 0) {
      return maybeStatusMessage;
    }

    const maybeData = (error as { data?: unknown }).data;
    if (typeof maybeData === "object" && maybeData !== null) {
      const message = (maybeData as { statusMessage?: unknown }).statusMessage;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
  }

  return "Could not create your account";
};

const submitRegister = async () => {
  errorMessage.value = "";
  try {
    await register({
      email: email.value,
      password: password.value,
      name: name.value,
      arrivalMonth: arrivalMonth.value,
    });
    await navigateTo(redirectPath.value);
  } catch (error: unknown) {
    errorMessage.value = resolveErrorMessage(error);
  }
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-2xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Create account</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Create your execution account.</h1>
      <p class="mt-4 text-stone-600">After sign up, we will build your personalized immigration roadmap.</p>

      <form class="mt-8 space-y-5 rounded border border-stone-200 bg-white p-6" @submit.prevent="submitRegister">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Name</span>
          <input v-model="name" type="text" autocomplete="name" maxlength="80"
            class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Arrival month (optional)</span>
          <input v-model="arrivalMonth" type="text" placeholder="Example: May 2026" maxlength="40"
            class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Email</span>
          <input v-model="email" type="email" required autocomplete="email"
            class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Password</span>
          <input v-model="password" type="password" required minlength="6" autocomplete="new-password"
            class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none" />
        </label>

        <p v-if="errorMessage" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{
          errorMessage }}</p>

        <button type="submit" :disabled="loading"
          class="w-full rounded-sm bg-[#d52b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a82018] disabled:cursor-not-allowed disabled:opacity-60">
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
              <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
            </svg>
            Creating account...
          </span>
          <span v-else>Create account</span>
        </button>

        <p class="text-sm text-stone-600">
          Already have an account?
          <NuxtLink :to="`/login?redirect=${encodeURIComponent(redirectPath)}`" class="font-semibold text-[#0032a0]">
            Sign in
          </NuxtLink>
        </p>
      </form>
    </section>
  </div>
</template>
