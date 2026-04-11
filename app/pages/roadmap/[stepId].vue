<script setup lang="ts">
import { useUserData } from "~/composables/useUserData";

const route = useRoute();
const stepId = computed(() => String(route.params.stepId ?? ""));

const { isAuthenticated, hydrateSession } = useAuth();
const {
  roadmapSteps,
  roadmapWarnings,
  roadmapLoading,
  roadmapChecksLoading,
  roadmapStepUpdatingIds,
  loadRoadmap,
  loadRoadmapChecks,
  updateRoadmapStep,
} = useUserData();

const step = computed(() => roadmapSteps.value.find((item) => item.id === stepId.value) ?? null);
const warning = computed(() => roadmapWarnings.value.find((item) => item.stepId === stepId.value) ?? null);
const isInitialLoading = computed(
  () => roadmapLoading.value || roadmapChecksLoading.value,
);
const isUpdatingStep = computed(() =>
  roadmapStepUpdatingIds.value.has(stepId.value),
);

onMounted(async () => {
  await hydrateSession();
  if (!isAuthenticated.value) {
    await navigateTo(`/login?redirect=${encodeURIComponent(`/roadmap/${stepId.value}`)}`);
    return;
  }

  await loadRoadmap();
  await loadRoadmapChecks(stepId.value);
});

const markComplete = async () => {
  await updateRoadmapStep(stepId.value, "completed");
  await loadRoadmapChecks(stepId.value);
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-4xl px-6 py-12 md:px-14">
      <NuxtLink to="/roadmap" class="text-sm font-semibold text-[#0032a0]">← Back to roadmap</NuxtLink>

      <div v-if="isInitialLoading && !step" class="mt-5 rounded border border-stone-200 bg-white p-6 text-stone-600">
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
            <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
          </svg>
          <span>Loading step details...</span>
        </div>
      </div>

      <article v-else-if="step" class="mt-5 rounded border border-stone-200 bg-white p-6">
        <p class="font-mono text-xs tracking-[0.08em] text-stone-500 uppercase">Step {{ step.order }} · {{ step.category
        }}</p>
        <h1 class="mt-2 font-serif text-4xl leading-tight font-bold text-stone-900">{{ step.title }}</h1>
        <p class="mt-4 text-sm leading-7 text-stone-700">{{ step.explanation }}</p>

        <div class="mt-6">
          <h2 class="text-sm font-semibold text-stone-900">Requirements</h2>
          <ul class="mt-3 space-y-2 text-sm text-stone-700">
            <li v-for="requirement in step.requirements" :key="requirement" class="rounded bg-stone-50 px-3 py-2">
              {{ requirement }}
            </li>
          </ul>
        </div>

        <div v-if="warning" class="mt-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p v-if="warning.warning">{{ warning.warning }}</p>
          <p v-if="warning.missingDependencies.length > 0" class="mt-2">
            Missing dependencies: {{ warning.missingDependencies.join(', ') }}
          </p>
        </div>

        <div class="mt-6">
          <h2 class="text-sm font-semibold text-stone-900">External actions</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <a v-for="link in step.externalLinks" :key="link.url" :href="link.url" target="_blank" rel="noopener"
              class="rounded border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900">
              {{ link.label }}
            </a>
          </div>
        </div>

        <button :disabled="step.status === 'completed' || step.status === 'blocked' || isUpdatingStep"
          class="mt-8 rounded-sm bg-[#d52b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a82018] disabled:cursor-not-allowed disabled:opacity-50"
          @click="markComplete">
          <span v-if="isUpdatingStep" class="inline-flex items-center gap-1">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
              <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
            </svg>
            Saving...
          </span>
          <span v-else>{{ step.status === 'completed' ? 'Completed' : 'Mark complete' }}</span>
        </button>
      </article>

      <div v-else class="mt-6 rounded border border-stone-200 bg-white p-6 text-sm text-stone-700">
        Step not found for this roadmap.
      </div>
    </section>
  </div>
</template>
