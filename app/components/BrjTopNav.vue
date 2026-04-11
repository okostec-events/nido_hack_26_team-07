<script setup lang="ts">
const links = [
  { to: '/onboarding', label: 'Onboarding' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/paperwork', label: 'Paperwork' },
];
</script>

<template>
  <nav class="relative z-20 flex items-center justify-between px-6 py-5 md:px-14">
    <NuxtLink to="/"
      class="cursor-pointer font-serif text-3xl font-black tracking-tight text-white transition hover:text-white/90">
      Br<span class="text-[#d52b1e]">ú</span>jula
    </NuxtLink>

    <ul class="hidden gap-8 md:flex">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to"
          class="cursor-pointer font-mono text-xs tracking-widest text-white/60 uppercase transition hover:text-white"
          active-class="text-white" exact-active-class="text-white">
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
