<script setup lang="ts">
const { user, isAuthenticated, hydrated, hydrateSession, logout, loading } = useAuth();
const isLoggingOut = ref(false);

// Overlay: shown once for unauthenticated visitors who haven't chosen a type yet.
// Stored in localStorage so it doesn't reappear.
const userType = ref<"traveller" | "immigrant" | null>(null);
const overlayReady = ref(false);

onMounted(async () => {
  const stored = localStorage.getItem("brj-user-type");
  if (stored === "traveller" || stored === "immigrant") {
    userType.value = stored;
  }
  overlayReady.value = true;
  await hydrateSession();
});

const showOverlay = computed(
  () =>
    overlayReady.value &&
    hydrated.value &&
    !isAuthenticated.value &&
    userType.value === null,
);

const choose = (type: "traveller" | "immigrant") => {
  userType.value = type;
  localStorage.setItem("brj-user-type", type);
};

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
  <div>
    <section class="relative min-h-screen overflow-hidden bg-[#1a1614] text-white">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(213,43,30,0.25)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_20%_80%,rgba(0,50,160,0.2)_0%,transparent_55%)]" />
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#d52b1e_50%,#0032a0_50%)]" />

      <nav class="absolute inset-x-0 top-0 z-20 bg-transparent px-6 py-6 md:px-14">
        <div class="mx-auto flex w-full max-w-6xl items-center justify-between">
          <NuxtLink to="/"
            class="font-serif text-3xl font-black tracking-tight text-white transition hover:text-white/90">
            Br<span class="text-[#d52b1e]">ú</span>jula
          </NuxtLink>

          <div class="flex items-center gap-2">
            <template v-if="isAuthenticated">
              <span class="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 sm:inline">
                Hi, {{ user?.name }}
              </span>
              <button :disabled="loading || isLoggingOut"
                class="rounded-full border border-white/35 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                @click="logoutSession">
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
                class="rounded-full border border-white/35 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white hover:bg-white/15">
                Log in
              </NuxtLink>
              <NuxtLink to="/register"
                class="rounded-full bg-[#d52b1e] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a82018]">
                Sign up
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>

      <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-28 md:px-14">
        <div class="animate-fade-up">
          <p
            class="mb-5 inline-flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-[#f4a823] uppercase before:h-0.5 before:w-8 before:bg-[#f4a823]">
            Your compass for a new life
          </p>
          <h1 class="font-serif text-[clamp(3rem,8vw,6.8rem)] leading-[0.92] font-black">
            You <i>just</i> landed in<br>
            <em class="text-[#d52b1e] not-italic">Chile.</em><br>
            Now <span class="underline">what</span>?
          </h1>
          <p class="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            Brújula is your execution system for moving to Chile: personalized steps, clear dependencies, and safer
            action
            sequencing.
          </p>

          <div class="mt-10 flex flex-wrap gap-3">
            <NuxtLink to="/onboarding"
              class="rounded-sm bg-[#d52b1e] px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:bg-[#a82018]">
              Start My Plan →
            </NuxtLink>
            <NuxtLink to="/roadmap"
              class="rounded-sm border border-white/30 px-6 py-3 text-white/85 transition hover:border-white hover:text-white">
              View My Roadmap
            </NuxtLink>
            <NuxtLink to="/paperwork"
              class="rounded-sm border border-[#f4a823]/60 px-6 py-3 text-[#f4a823] transition hover:border-[#f4a823] hover:text-[#ffd177]">
              Paperwork Workspace
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Visitor type overlay: shown once for unauthenticated users who haven't chosen -->
    <Transition name="overlay">
      <div
        v-if="showOverlay"
        class="fixed inset-0 z-30 flex items-center justify-center bg-[#1a1614]/70 p-4 backdrop-blur-md"
      >
        <div class="w-full max-w-sm rounded-2xl bg-[#faf9f6] p-8 shadow-2xl">
          <div class="mb-1 text-center font-serif text-2xl font-black text-[#1a1614]">
            Br<span class="text-[#d52b1e]">ú</span>jula
          </div>
          <p class="mb-8 text-center text-sm text-[#6b5e57]">
            How are you coming to Chile?
          </p>

          <div class="grid grid-cols-2 gap-3">
            <button
              class="group flex flex-col items-center gap-3 rounded-xl border-2 border-[#e8e4df] bg-white px-4 py-6 transition hover:border-[#0032a0] hover:shadow-md active:scale-[0.97]"
              @click="choose('traveller')"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#0032a0]/10 transition group-hover:bg-[#0032a0]/20">
                <Icon name="heroicons:paper-airplane" class="h-6 w-6 text-[#0032a0]" />
              </div>
              <div class="text-center">
                <p class="font-semibold text-[#1a1614]">Traveller</p>
                <p class="mt-0.5 text-xs text-[#6b5e57]">Visiting Chile</p>
              </div>
            </button>

            <button
              class="group flex flex-col items-center gap-3 rounded-xl border-2 border-[#e8e4df] bg-white px-4 py-6 transition hover:border-[#d52b1e] hover:shadow-md active:scale-[0.97]"
              @click="choose('immigrant')"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#d52b1e]/10 transition group-hover:bg-[#d52b1e]/20">
                <Icon name="heroicons:home" class="h-6 w-6 text-[#d52b1e]" />
              </div>
              <div class="text-center">
                <p class="font-semibold text-[#1a1614]">Immigrant</p>
                <p class="mt-0.5 text-xs text-[#6b5e57]">Moving to Chile</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.overlay-enter-active {
  transition: opacity 0.25s ease;
}
.overlay-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
