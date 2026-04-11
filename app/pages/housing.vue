<script setup lang="ts">
import type { HousingPlatform, HousingRecommendations } from "~/server/api/user/housing.get";

const { isAuthenticated, hydrateSession } = useAuth();

const loading = ref(true);
const onboarded = ref(false);
const recommendations = ref<HousingRecommendations | null>(null);

const { message: loadingMessage, start: startLoadingMessage, stop: stopLoadingMessage } = useLoadingMessage([
  { text: "Generating your personalised housing guide…", after: 0 },
  { text: "Taking a while…",                             after: 6000 },
  { text: "Hold on…",                                    after: 6000 },
  { text: "Almost there…",                               after: 6000 },
]);

onMounted(async () => {
  await hydrateSession();
  if (!isAuthenticated.value) {
    await navigateTo("/login?redirect=%2Fhousing");
    return;
  }

  startLoadingMessage();
  try {
    const data = await $fetch<{
      onboarded: boolean;
      recommendations: HousingRecommendations | null;
    }>("/api/user/housing");
    onboarded.value = data.onboarded;
    recommendations.value = data.recommendations;
  } finally {
    stopLoadingMessage();
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">
        Housing
      </p>
      <h1 class="mt-3 font-serif text-5xl font-bold leading-tight text-stone-900">
        Find your place in Chile.
      </h1>

      <!-- Loading -->
      <div v-if="loading" class="mt-10 space-y-4">
        <div class="flex items-center gap-3 text-stone-500">
          <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
            <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
          </svg>
          <Transition name="lm" mode="out-in">
            <span :key="loadingMessage" class="text-sm">{{ loadingMessage }}</span>
          </Transition>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded border border-stone-200 bg-stone-100" />
        </div>
      </div>

      <!-- No onboarding yet -->
      <div v-else-if="!onboarded" class="mt-10 rounded border border-stone-200 bg-white p-6 text-stone-700">
        <p class="font-medium">Complete onboarding first.</p>
        <p class="mt-1 text-sm text-stone-500">
          Housing recommendations are tailored to your situation — we need your onboarding details to personalise them.
        </p>
        <NuxtLink
          to="/onboarding"
          class="mt-4 inline-block rounded-sm bg-[#0032a0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00257a]"
        >
          Start onboarding
        </NuxtLink>
      </div>

      <!-- No housing data yet — regenerate roadmap to include it -->
      <div v-else-if="!recommendations" class="mt-10 rounded border border-stone-200 bg-white p-6 text-stone-700">
        <p class="font-medium">Housing guide not generated yet.</p>
        <p class="mt-1 text-sm text-stone-500">
          Your current roadmap was created before housing recommendations were added.
          Regenerate your roadmap and a personalised housing guide will be included.
        </p>
        <NuxtLink
          to="/onboarding?redo=1"
          class="mt-4 inline-block rounded-sm bg-[#0032a0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00257a]"
        >
          Regenerate roadmap
        </NuxtLink>
      </div>

      <!-- Recommendations -->
      <template v-else>
        <p class="mt-4 max-w-2xl text-stone-600">{{ recommendations.intro }}</p>

        <!-- Tips grid -->
        <div v-if="recommendations.tips.length > 0" class="mt-10 grid gap-4 sm:grid-cols-2">
          <div
            v-for="tip in recommendations.tips"
            :key="tip.title"
            class="rounded border border-stone-200 bg-white p-5"
          >
            <p class="mb-2 text-xl">{{ tip.icon }}</p>
            <p class="font-semibold text-stone-900">{{ tip.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-stone-600">{{ tip.body }}</p>
          </div>
        </div>

        <!-- Short-term platforms -->
        <template v-if="recommendations.shortTerm.length > 0">
          <h2 class="mt-14 font-serif text-2xl font-bold text-stone-900">
            Short-term — while you settle in
          </h2>
          <p class="mt-1 text-sm text-stone-500">
            Good for your first weeks before you have a RUT or a long-term lease.
          </p>
          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <a
              v-for="p in recommendations.shortTerm"
              :key="p.name"
              :href="p.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col rounded border border-stone-200 bg-white p-5 transition hover:border-stone-400 hover:shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="font-semibold text-stone-900 group-hover:text-[#0032a0]">{{ p.name }}</span>
                <span class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{{ p.badge }}</span>
              </div>
              <p class="mt-0.5 text-xs text-stone-500">{{ p.tagline }}</p>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{{ p.description }}</p>
              <p v-if="p.tip" class="mt-4 rounded bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                💡 {{ p.tip }}
              </p>
              <p class="mt-4 text-xs font-semibold text-[#0032a0] group-hover:underline">
                Open {{ p.name }} →
              </p>
            </a>
          </div>
        </template>

        <!-- Long-term platforms -->
        <template v-if="recommendations.longTerm.length > 0">
          <h2 class="mt-14 font-serif text-2xl font-bold text-stone-900">
            Long-term rentals
          </h2>
          <p class="mt-1 text-sm text-stone-500">
            For when you have (or are close to getting) your RUT and are ready to sign a lease.
          </p>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <a
              v-for="p in recommendations.longTerm"
              :key="p.name"
              :href="p.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col rounded border border-stone-200 bg-white p-5 transition hover:border-stone-400 hover:shadow-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="font-semibold text-stone-900 group-hover:text-[#0032a0]">{{ p.name }}</span>
                <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">{{ p.badge }}</span>
              </div>
              <p class="mt-0.5 text-xs text-stone-500">{{ p.tagline }}</p>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{{ p.description }}</p>
              <p v-if="p.tip" class="mt-4 rounded bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-700">
                💡 {{ p.tip }}
              </p>
              <p class="mt-4 text-xs font-semibold text-[#0032a0] group-hover:underline">
                Open {{ p.name }} →
              </p>
            </a>
          </div>
        </template>
      </template>
    </section>
  </div>
</template>
