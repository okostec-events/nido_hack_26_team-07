<script setup lang="ts">
import { useGuideData } from '~/composables/useGuideData';

const { stats } = useGuideData();
</script>

<template>
  <div>
    <section class="relative min-h-screen overflow-hidden bg-[#1a1614] text-white flex items-center justify-center">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(213,43,30,0.25)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_20%_80%,rgba(0,50,160,0.2)_0%,transparent_55%)]" />
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#d52b1e_50%,#0032a0_50%)]" />

      <div class="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 pb-14 md:px-14">
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
            Brújula is your all-in-one guide for navigating life in Chile: safe neighborhoods, housing, paperwork, food,
            and community.
          </p>

          <div class="mt-10 flex flex-wrap gap-3">
            <NuxtLink to="/streets"
              class="rounded-sm bg-[#d52b1e] px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:bg-[#a82018]">
              Start Exploring →
            </NuxtLink>
            <NuxtLink to="/community"
              class="rounded-sm border border-white/30 px-6 py-3 text-white/85 transition hover:border-white hover:text-white">
              Join the Community
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-2 border-t border-white/10 pt-7 md:grid-cols-4">
          <div v-for="(stat, idx) in stats" :key="stat.label" class="animate-fade-up border-white/10 mr-4"
            :class="idx < stats.length - 1 ? 'md:border-r' : ''" :style="{ animationDelay: `${idx * 120}ms` }">
            <p class="font-serif text-4xl leading-none font-bold">{{ stat.value }}</p>
            <p class="mt-2 font-mono text-[11px] tracking-[0.06em] text-white/45 uppercase">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <a href="#main-content"
        class="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-white/60 transition hover:text-white animate-bounce"
        aria-label="Scroll down">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-7 w-7" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </a>
    </section>

    <BrjSectionTabs />

    <section id="main-content" class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <h2 class="font-serif text-4xl leading-tight font-bold text-stone-900">Pick a lane and move fast</h2>
      <p class="mt-4 max-w-2xl text-stone-600">Each route breaks down one critical part of settling in Santiago, with
        practical cards and tools inspired by your demo.</p>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink to="/streets"
          class="animate-fade-up rounded border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
          <p class="text-2xl">🗺️</p>
          <h3 class="mt-3 text-lg font-semibold">Safe Streets</h3>
          <p class="mt-2 text-sm text-stone-600">Understand neighborhoods before you commit to a routine.</p>
        </NuxtLink>
        <NuxtLink to="/housing"
          class="animate-fade-up rounded border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl [animation-delay:100ms]">
          <p class="text-2xl">🏡</p>
          <h3 class="mt-3 text-lg font-semibold">Find Housing</h3>
          <p class="mt-2 text-sm text-stone-600">Browse curated listing cards with practical tags and pricing.</p>
        </NuxtLink>
        <NuxtLink to="/paperwork"
          class="animate-fade-up rounded border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl [animation-delay:200ms]">
          <p class="text-2xl">📋</p>
          <h3 class="mt-3 text-lg font-semibold">Paperwork</h3>
          <p class="mt-2 text-sm text-stone-600">Track progress and timeline without drowning in bureaucracy.</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
