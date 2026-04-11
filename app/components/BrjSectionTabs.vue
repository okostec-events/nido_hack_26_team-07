<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { user, isAuthenticated, hydrateSession, logout, loading } = useAuth();
const { hasRoadmap, loadRoadmap } = useUserData();
const isLoggingOut = ref(false);
const roadmapPreloaded = ref(false);

const tabs = computed(() => {
  const nextTabs = [{ to: '/roadmap', label: 'My Roadmap', icon: '🧭' }];

  if (!isAuthenticated.value || (roadmapPreloaded.value && !hasRoadmap.value)) {
    nextTabs.push({ to: '/onboarding', label: 'Onboarding', icon: '📝' });
  }

  nextTabs.push({ to: '/paperwork', label: 'Paperwork', icon: '📋' });

  if (isAuthenticated.value) {
    nextTabs.push({ to: '/housing', label: 'Housing', icon: '🏠' });
  }

  return nextTabs;
});

const isActive = (to: string) => {
  if (to === '/roadmap') {
    return route.path === '/roadmap' || route.path.startsWith('/roadmap/');
  }

  return route.path === to;
};
const showLogo = computed(() => route.path !== '/');

onMounted(async () => {
  await hydrateSession();
  if (isAuthenticated.value) {
    try {
      await loadRoadmap();
    } catch {
      // Ignore navbar roadmap preload errors.
    } finally {
      roadmapPreloaded.value = true;
    }
  } else {
    roadmapPreloaded.value = true;
  }
});

const logoutSession = async () => {
  isLoggingOut.value = true;
  try {
    await logout();
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<template>
  <div
    class="sticky top-0 z-50 flex items-center gap-4 overflow-x-auto border-y border-stone-200 bg-white/95 px-4 py-3 backdrop-blur md:px-12">
    <NuxtLink v-if="showLogo" to="/"
      class="mr-2 shrink-0 cursor-pointer font-serif text-2xl font-black tracking-tight text-[#1a1614] transition hover:opacity-90">
      Br<span class="text-[#d52b1e]">ú</span>jula
    </NuxtLink>

    <NuxtLink v-for="tab in tabs" :key="tab.to" :to="tab.to"
      class="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition" :class="isActive(tab.to)
        ? 'border-[#d52b1e] bg-[#d52b1e] text-white'
        : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900'">
      <span>{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </NuxtLink>

    <div class="ml-auto hidden shrink-0 items-center gap-2 md:flex">
      <template v-if="isAuthenticated">
        <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">Hi, {{ user?.name }}</span>
        <button
          class="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading || isLoggingOut" @click="logoutSession">
          <span v-if="isLoggingOut" class="inline-flex items-center gap-1">
            <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" class="opacity-25" stroke="currentColor" stroke-width="3" />
              <path class="opacity-100" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" />
            </svg>
            Logging out...
          </span>
          <span v-else>Log out</span>
        </button>
      </template>
      <template v-else>
        <NuxtLink to="/login"
          class="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900">
          Log in
        </NuxtLink>
        <NuxtLink to="/register"
          class="rounded-full bg-[#0032a0] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#00257a]">
          Sign up
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
