<template>
  <div class="relative min-h-screen overflow-x-clip bg-[#faf9f6] text-[#1a1614]">
    <NuxtRouteAnnouncer />
    <NuxtPage :transition="{ name: 'page', mode: 'in-out' }" />
  </div>
</template>
