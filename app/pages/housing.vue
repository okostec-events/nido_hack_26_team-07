<script setup lang="ts">
import { useGuideData } from '~/composables/useGuideData';

const { housingListings } = useGuideData();
const { isAuthenticated, hydrateSession } = useAuth();
const { favoriteListingIds, loadFavorites, setFavorite } = useUserData();

const isFavorite = (listingId: string) => favoriteListingIds.value.has(listingId);

const toggleFavorite = async (listingId: string) => {
  if (!isAuthenticated.value) {
    await navigateTo('/login?redirect=%2Fhousing');
    return;
  }

  await setFavorite(listingId, !isFavorite(listingId));
};

onMounted(async () => {
  await hydrateSession();
  await loadFavorites();
});

watch(isAuthenticated, async () => {
  await loadFavorites();
});
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">Find your place</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Housing that fits your new life.</h1>
      <p class="mt-5 max-w-3xl text-stone-600">Curated, mock listings styled after the demo. Replace later with real API
        data.</p>
      <p v-if="!isAuthenticated" class="mt-3 text-sm text-stone-500">Log in to save your favorite listings.</p>

      <div class="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="(listing, idx) in housingListings" :key="listing.id"
          class="animate-fade-up overflow-hidden rounded border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
          :style="{ animationDelay: `${idx * 80}ms` }">
          <div
            class="relative flex h-40 items-center justify-center bg-[linear-gradient(135deg,#e8edf8,#d0d8ee)] text-5xl">
            <span>{{ listing.emoji }}</span>
            <button
              class="absolute top-3 left-3 rounded bg-white/90 px-2 py-1 font-mono text-[11px] text-stone-700 transition hover:bg-white"
              @click="toggleFavorite(listing.id)">
              {{ isFavorite(listing.id) ? '★ Saved' : '☆ Save' }}
            </button>
            <span class="absolute top-3 right-3 rounded bg-stone-900 px-2 py-1 font-mono text-[11px] text-white">{{
              listing.price }}</span>
          </div>

          <div class="p-5">
            <h2 class="text-base font-semibold text-stone-900">{{ listing.title }}</h2>
            <p class="mt-1 text-xs text-stone-500">📍 {{ listing.location }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="tag in listing.tags" :key="tag"
                class="rounded bg-blue-100 px-2 py-1 font-mono text-[10px] text-blue-700">{{ tag }}</span>
            </div>
            <button
              class="mt-4 w-full rounded-sm bg-[#d52b1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a82018]">Contact
              Owner →</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
