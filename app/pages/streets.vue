<script setup lang="ts">
import { useGuideData } from '~/composables/useGuideData';

const { safetyZones } = useGuideData();
const activeZone = ref(safetyZones[0]);

const levelStyles: Record<string, string> = {
  safe: 'border-l-4 border-l-emerald-500 bg-emerald-50/40',
  moderate: 'border-l-4 border-l-amber-500 bg-amber-50/40',
  caution: 'border-l-4 border-l-rose-500 bg-rose-50/40',
};

const levelBadge: Record<string, string> = {
  safe: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  caution: 'bg-rose-100 text-rose-700',
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">

      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Navigate safely</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Know your neighborhood before you
        drive.
      </h1>
      <p class="mt-5 max-w-3xl text-stone-600">Local and expat-oriented safety context with quick area summaries.</p>

      <div class="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div class="space-y-3">
          <button v-for="(zone, idx) in safetyZones" :key="zone.name"
            class="animate-fade-up w-full rounded border border-stone-200 bg-white p-4 text-left transition hover:shadow-lg"
            :class="[levelStyles[zone.level], activeZone.name === zone.name ? 'ring-2 ring-stone-800/20' : '']"
            :style="{ animationDelay: `${idx * 80}ms` }" @click="activeZone = zone">
            <span class="inline-block rounded px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase"
              :class="levelBadge[zone.level]">
              {{ zone.level }}
            </span>
            <h3 class="mt-2 text-sm font-semibold text-stone-900">{{ zone.name }}</h3>
            <p class="mt-1 text-xs leading-5 text-stone-600">{{ zone.summary }}</p>
          </button>
        </div>

        <div
          class="relative min-h-[420px] overflow-hidden rounded border border-stone-200 bg-[linear-gradient(130deg,#eef2ff,#dbeafe,#e0f2fe)] p-6">
          <div class="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-[#d52b1e]/15 blur-2xl" />
          <div class="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-[#0032a0]/20 blur-2xl" />

          <div class="relative z-10 max-w-md rounded bg-white/90 p-5 shadow-xl backdrop-blur">
            <p class="font-mono text-xs tracking-[0.1em] text-stone-500 uppercase">Selected Area</p>
            <h2 class="mt-2 font-serif text-3xl font-bold text-stone-900">{{ activeZone.name }}</h2>
            <p class="mt-3 text-sm leading-6 text-stone-700">{{ activeZone.summary }}</p>
            <p class="mt-4 text-xs text-stone-500">Interactive map layer omitted to keep the Nuxt version
              dependency-light
              and fast to ship.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
