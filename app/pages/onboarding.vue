<script setup lang="ts">
import { useUserData, type OnboardingInput } from "~/composables/useUserData";

const route = useRoute();
const { isAuthenticated, hydrateSession } = useAuth();
const { onboarding, hasRoadmap, submitOnboarding, onboardingSaving, loadRoadmap } =
  useUserData();

const isRedoMode = computed(() => route.query.redo === "1");

const form = ref<OnboardingInput>({
  countryOfOrigin: "",
  immigrationStatus: "tourist",
  primaryGoal: "settle",
  timelineWeeks: 12,
  needsHousing: true,
  needsPaperwork: true,
  needsBookings: true,
  situationDescription: "",
});

const errorMessage = ref("");

const { message: savingMessage, start: startSavingMessage, stop: stopSavingMessage } = useLoadingMessage([
  { text: "Generating roadmap…",  after: 0 },
  { text: "Taking a while…",      after: 6000 },
  { text: "Hold on…",             after: 6000 },
  { text: "Almost there…",        after: 6000 },
]);

watch(onboardingSaving, (saving) => {
  if (saving) startSavingMessage();
  else stopSavingMessage();
});

onMounted(async () => {
  await hydrateSession();
  if (!isAuthenticated.value) {
    await navigateTo("/login?redirect=%2Fonboarding");
    return;
  }

  await loadRoadmap();

  if (onboarding.value) {
    form.value = { ...onboarding.value };
  }

  if (hasRoadmap.value && !isRedoMode.value) {
    await navigateTo("/roadmap");
  }
});

const submit = async () => {
  errorMessage.value = "";
  try {
    await submitOnboarding(form.value);
    await navigateTo("/roadmap");
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null) {
      const statusMessage = (error as { statusMessage?: unknown }).statusMessage;
      if (typeof statusMessage === "string" && statusMessage.length > 0) {
        errorMessage.value = statusMessage;
        return;
      }
    }

    errorMessage.value = "Could not save onboarding details";
  }
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-3xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Onboarding</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">
        {{ isRedoMode ? 'Redo your onboarding profile.' : 'Build your execution roadmap.' }}
      </h1>
      <p class="mt-4 text-stone-600">
        {{ isRedoMode
          ? 'Update your context and we will regenerate your roadmap with Claude.'
          : 'Tell Brújula your current context so we can generate the right steps in the right order.' }}
      </p>

      <form class="mt-8 space-y-6 rounded border border-stone-200 bg-white p-6" @submit.prevent="submit">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Country of origin</span>
          <input v-model="form.countryOfOrigin" type="text" required maxlength="80"
            class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none" />
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-stone-700">Current immigration status</span>
            <select v-model="form.immigrationStatus"
              class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none">
              <option value="tourist">Tourist</option>
              <option value="student">Student</option>
              <option value="worker">Worker</option>
              <option value="family">Family reunification</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1 block text-sm font-medium text-stone-700">Primary goal</span>
            <select v-model="form.primaryGoal"
              class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none">
              <option value="settle">Settle in Chile</option>
              <option value="work">Work</option>
              <option value="study">Study</option>
              <option value="family">Family transition</option>
            </select>
          </label>
        </div>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Target timeline (weeks)</span>
          <input v-model.number="form.timelineWeeks" type="number" min="2" max="104"
            class="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none" />
        </label>

        <div class="grid gap-3 md:grid-cols-3">
          <label class="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm text-stone-700">
            <input v-model="form.needsHousing" type="checkbox" class="accent-[#0032a0]" />
            Needs housing support
          </label>
          <label class="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm text-stone-700">
            <input v-model="form.needsPaperwork" type="checkbox" class="accent-[#0032a0]" />
            Needs paperwork flow
          </label>
          <label class="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm text-stone-700">
            <input v-model="form.needsBookings" type="checkbox" class="accent-[#0032a0]" />
            Needs appointment bookings
          </label>
        </div>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-stone-700">Describe your situation <span class="font-normal text-stone-400">(optional)</span></span>
          <textarea
            v-model="form.situationDescription"
            rows="4"
            maxlength="800"
            placeholder="e.g. I arrived last month on a tourist visa, I have a job offer in Santiago and my partner is joining me in three months…"
            class="w-full resize-y rounded border border-stone-300 px-3 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
          />
          <span class="mt-1 block text-right text-xs text-stone-400">{{ form.situationDescription.length }} / 800</span>
        </label>

        <p v-if="errorMessage" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="onboardingSaving"
          class="w-full rounded-sm bg-[#d52b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a82018] disabled:cursor-not-allowed disabled:opacity-60">
          <span v-if="onboardingSaving" class="inline-flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
              <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
            </svg>
            <Transition name="lm" mode="out-in">
              <span :key="savingMessage">{{ savingMessage }}</span>
            </Transition>
          </span>
          <span v-else>{{ isRedoMode ? 'Regenerate my roadmap' : 'Generate my roadmap' }}</span>
        </button>
      </form>
    </section>
  </div>
</template>
