<script setup lang="ts">
import { useUserData } from "~/composables/useUserData";

const { isAuthenticated, hydrateSession } = useAuth();
const {
  onboarding,
  roadmapSteps,
  roadmapSummary,
  roadmapLoading,
  roadmapStepUpdatingIds,
  loadRoadmap,
  updateRoadmapStep,
} = useUserData();

const isStepUpdating = (stepId: string): boolean =>
  roadmapStepUpdatingIds.value.has(stepId);

onMounted(async () => {
  await hydrateSession();
  if (!isAuthenticated.value) {
    await navigateTo("/login?redirect=%2Froadmap");
    return;
  }
  await loadRoadmap();
});

const completeStep = async (stepId: string) => {
  await updateRoadmapStep(stepId, "completed");
};

const reopenStep = async (stepId: string) => {
  await updateRoadmapStep(stepId, "pending");
};

const statusClass = (status: string): string => {
  if (status === "completed") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }
  if (status === "pending") {
    return "border-blue-300 bg-blue-50 text-blue-700";
  }
  if (status === "in-progress") {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }
  return "border-stone-300 bg-stone-100 text-stone-600";
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Personalized roadmap</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Your execution plan for Chile.</h1>

      <p class="mt-4 max-w-3xl text-stone-600">
        Follow the sequence, complete dependencies, and avoid process errors before they happen.
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-stone-600">
        <template v-if="onboarding">
          <span class="rounded bg-stone-100 px-3 py-1">Origin: {{ onboarding.countryOfOrigin }}</span>
          <span class="rounded bg-stone-100 px-3 py-1">Status: {{ onboarding.immigrationStatus }}</span>
          <span class="rounded bg-stone-100 px-3 py-1">Goal: {{ onboarding.primaryGoal }}</span>
          <span class="rounded bg-stone-100 px-3 py-1">Timeline: {{ onboarding.timelineWeeks }} weeks</span>
        </template>
      </div>

      <div class="mt-8 rounded border border-stone-200 bg-white p-5">
        <template v-if="roadmapSummary">
          <p class="font-mono text-xs tracking-[0.08em] text-stone-500 uppercase">Progress</p>
          <p class="mt-2 text-sm text-stone-700">
            Completed {{ roadmapSummary.completed }} of {{ roadmapSummary.total }} steps
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <NuxtLink to="/paperwork"
              class="inline-block rounded border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900">
              Open paperwork workspace
            </NuxtLink>
            <NuxtLink to="/onboarding?redo=1"
              class="inline-block rounded border border-[#0032a0] px-3 py-1 text-xs font-semibold text-[#0032a0] transition hover:border-[#00257a] hover:text-[#00257a]">
              Redo onboarding
            </NuxtLink>
          </div>
        </template>
      </div>

      <div class="mt-8 space-y-4">
        <div v-if="roadmapLoading" class="rounded border border-stone-200 bg-white p-5 text-stone-600">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
              <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
            </svg>
            <span>Loading roadmap...</span>
          </div>
        </div>

        <template v-else-if="roadmapSteps.length === 0">
          <div class="rounded border border-stone-200 bg-white p-6 text-stone-700">
            <p>No roadmap found yet. Start with onboarding to generate your personalized flow.</p>
            <NuxtLink to="/onboarding"
              class="mt-4 inline-block rounded-sm bg-[#0032a0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00257a]">
              Start onboarding
            </NuxtLink>
          </div>
        </template>

        <article v-for="step in roadmapSteps" :key="step.id" class="rounded border border-stone-200 bg-white p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-mono text-[11px] tracking-[0.08em] text-stone-500 uppercase">Step {{ step.order }}</p>
              <h2 class="mt-1 text-lg font-semibold text-stone-900">{{ step.title }}</h2>
              <p class="mt-2 text-sm text-stone-600">{{ step.goal }}</p>
            </div>
            <span class="rounded border px-3 py-1 text-xs font-semibold uppercase" :class="statusClass(step.status)">
              {{ step.status }}
            </span>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <NuxtLink :to="`/roadmap/${step.id}`"
              class="rounded border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900">
              View details
            </NuxtLink>
            <button v-if="step.status !== 'completed'" :disabled="step.status === 'blocked' || isStepUpdating(step.id)"
              class="rounded-sm bg-[#d52b1e] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#a82018] disabled:cursor-not-allowed disabled:opacity-50"
              @click="completeStep(step.id)">
              <span v-if="isStepUpdating(step.id)" class="inline-flex items-center gap-1">
                <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
                  <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
                </svg>
                Saving...
              </span>
              <span v-else>Mark complete</span>
            </button>
            <button v-else :disabled="isStepUpdating(step.id)"
              class="rounded border border-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              @click="reopenStep(step.id)">
              <span v-if="isStepUpdating(step.id)" class="inline-flex items-center gap-1">
                <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
                  <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
                </svg>
                Saving...
              </span>
              <span v-else>Reopen</span>
            </button>
          </div>

          <p v-if="step.status === 'blocked'" class="mt-3 text-xs text-amber-700">
            This step is blocked by unmet dependencies. Open details to see what is missing.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
