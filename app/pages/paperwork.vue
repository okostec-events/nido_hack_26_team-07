<script setup lang="ts">
import { useGuideData } from '~/composables/useGuideData';

const { checklist, timeline } = useGuideData();
const { isAuthenticated, hydrateSession } = useAuth();
const { checklistIndexes, loadChecklist, setChecklistItem } = useUserData();
const doneSet = computed(() => checklistIndexes.value);

const toggleItem = async (idx: number) => {
  if (!isAuthenticated.value) {
    await navigateTo('/login?redirect=%2Fpaperwork');
    return;
  }

  await setChecklistItem(idx, !doneSet.value.has(idx));
};

onMounted(async () => {
  await hydrateSession();
  await loadChecklist();
});

watch(isAuthenticated, async () => {
  await loadChecklist();
});
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Bureaucracy, simplified</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Your official to-do list. No stress.
      </h1>
      <p class="mt-5 max-w-3xl text-stone-600">A practical order-of-operations view for the most important newcomer
        paperwork.</p>
      <p v-if="!isAuthenticated" class="mt-3 text-sm text-stone-500">Sign in to save checklist progress across devices.
      </p>

      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <article class="rounded border border-stone-200 bg-white p-7">
          <h2 class="mb-5 border-b border-stone-200 pb-4 font-serif text-2xl font-bold">Arrival Checklist</h2>
          <button v-for="(item, idx) in checklist" :key="item"
            class="flex w-full items-start gap-3 border-b border-stone-100 py-4 text-left last:border-b-0"
            @click="toggleItem(idx)">
            <span class="mt-0.5 grid h-5 w-5 place-items-center rounded-sm border-2 text-xs"
              :class="doneSet.has(idx) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-300 text-transparent'">✓</span>
            <span class="text-sm font-medium"
              :class="doneSet.has(idx) ? 'text-stone-400 line-through' : 'text-stone-800'">{{ item }}</span>
          </button>
        </article>

        <article class="rounded border border-stone-200 bg-white p-7">
          <h2 class="mb-5 border-b border-stone-200 pb-4 font-serif text-2xl font-bold">Visa Timeline</h2>

          <div class="space-y-5">
            <div v-for="(step, idx) in timeline" :key="step.step" class="animate-fade-up flex gap-4"
              :style="{ animationDelay: `${idx * 80}ms` }">
              <div class="flex w-10 shrink-0 flex-col items-center">
                <div
                  class="grid h-9 w-9 place-items-center rounded-full border-2 border-[#0032a0] bg-blue-100 font-mono text-xs font-semibold text-[#0032a0]">
                  {{ idx + 1 }}</div>
                <div v-if="idx < timeline.length - 1" class="mt-2 h-full w-0.5 bg-stone-200" />
              </div>
              <div class="pb-2">
                <span
                  class="inline-block rounded bg-red-100 px-2 py-1 font-mono text-[10px] tracking-[0.05em] text-[#d52b1e] uppercase">{{
                    step.when }}</span>
                <h3 class="mt-2 text-sm font-semibold text-stone-900">{{ step.step }}</h3>
                <p class="mt-1 text-xs leading-5 text-stone-600">{{ step.note }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
