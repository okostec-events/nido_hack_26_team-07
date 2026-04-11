<script setup lang="ts">
import { useGuideData } from '~/composables/useGuideData';

const { foodPlaces } = useGuideData();

const active = ref<'all' | 'chilean' | 'cafe' | 'international' | 'vegetarian'>('all');

const filters = [
  { id: 'all', label: 'All' },
  { id: 'chilean', label: '🇨🇱 Chilean' },
  { id: 'cafe', label: '☕ Cafes' },
  { id: 'international', label: '🌍 International' },
  { id: 'vegetarian', label: '🌿 Vegetarian' },
] as const;

const filtered = computed(() => {
  if (active.value === 'all') {
    return foodPlaces;
  }
  return foodPlaces.filter((p) => p.type === active.value);
});

const bgMap: Record<string, string> = {
  chilean: 'bg-[linear-gradient(135deg,#fef9c3,#fde68a)]',
  cafe: 'bg-[linear-gradient(135deg,#fce7e7,#fca5a5)]',
  international: 'bg-[linear-gradient(135deg,#e0f2fe,#7dd3fc)]',
  vegetarian: 'bg-[linear-gradient(135deg,#dcfce7,#86efac)]',
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Eat like a local</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Great food should not require a
        guidebook.</h1>

      <div class="mt-8 flex flex-wrap gap-2">
        <button v-for="f in filters" :key="f.id" class="rounded-full border px-4 py-2 text-sm transition"
          :class="active === f.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'"
          @click="active = f.id">
          {{ f.label }}
        </button>
      </div>

      <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="(place, idx) in filtered" :key="place.id"
          class="animate-fade-up overflow-hidden rounded border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
          :style="{ animationDelay: `${idx * 70}ms` }">
          <div class="relative flex h-36 items-center justify-center text-5xl" :class="bgMap[place.type]">
            {{ place.emoji }}
            <span class="absolute right-3 bottom-3 rounded bg-black/70 px-2 py-1 font-mono text-[11px] text-white">★ {{
              place.rating }}</span>
          </div>
          <div class="p-5">
            <h2 class="text-base font-semibold text-stone-900">{{ place.name }}</h2>
            <p class="mt-1 text-xs text-stone-500">📍 {{ place.location }} · {{ place.price }}</p>
            <p class="mt-3 text-sm leading-6 text-stone-600">{{ place.description }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
