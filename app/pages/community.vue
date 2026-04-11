<script setup lang="ts">
import { useGuideData } from '~/composables/useGuideData';

const { groups, starterMessages } = useGuideData();

const chat = ref([...starterMessages]);
const draft = ref('');

const send = () => {
  const text = draft.value.trim();
  if (!text) {
    return;
  }

  chat.value.push({
    id: `self-${Date.now()}`,
    author: 'You',
    initials: 'ME',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    self: true,
  });

  draft.value = '';

  const canned = [
    'Welcome! You are in the right place, ask as much as you need.',
    'Try checking the pinned docs, they answer most first-week questions.',
    'Great question. You can usually solve that at your local municipality office.',
  ];

  const reply = canned[Math.floor(Math.random() * canned.length)] ?? canned[0];

  setTimeout(() => {
    chat.value.push({
      id: `bot-${Date.now()}`,
      author: 'Ana M.',
      initials: 'AM',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }, 700);
};
</script>

<template>
  <div>
    <BrjSectionTabs />

    <section class="mx-auto w-full max-w-6xl px-6 py-12 md:px-14">
      <p class="font-mono text-xs tracking-[0.14em] text-[#d52b1e] uppercase">You are not alone</p>
      <h1 class="mt-3 font-serif text-5xl leading-tight font-bold text-stone-900">Find your people in Santiago.</h1>

      <div class="mt-10 grid gap-6 lg:grid-cols-[1fr_1.45fr]">
        <div class="space-y-3">
          <article v-for="(group, idx) in groups" :key="group.id"
            class="animate-fade-up flex items-center gap-4 rounded border border-stone-200 bg-white p-4 transition hover:border-[#d52b1e] hover:shadow-lg"
            :style="{ animationDelay: `${idx * 80}ms` }">
            <div class="grid h-12 w-12 place-items-center rounded bg-stone-100 text-2xl">{{ group.emoji }}</div>
            <div>
              <h2 class="text-sm font-semibold text-stone-900">{{ group.name }}</h2>
              <p class="text-xs text-stone-600">{{ group.description }}</p>
            </div>
            <p class="ml-auto font-mono text-[11px] text-stone-500">{{ group.members }}</p>
          </article>
        </div>

        <article class="flex h-130 flex-col overflow-hidden rounded border border-stone-200 bg-white">
          <header class="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            <h2 class="text-sm font-semibold text-stone-900">Expats in Santiago</h2>
            <span class="text-xs text-stone-500">347 online now</span>
          </header>

          <div class="flex-1 space-y-3 overflow-y-auto p-5">
            <div v-for="msg in chat" :key="msg.id" class="flex gap-2" :class="msg.self ? 'flex-row-reverse' : ''">
              <div
                class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0032a0] text-xs font-semibold text-white"
                :class="msg.self ? 'bg-[#d52b1e]' : ''">
                {{ msg.initials }}
              </div>
              <div class="max-w-[80%] rounded px-3 py-2"
                :class="msg.self ? 'rounded-tr-none bg-[#d52b1e] text-white' : 'rounded-tl-none bg-stone-100 text-stone-800'">
                <p class="text-[11px] font-semibold">{{ msg.author }}</p>
                <p class="mt-1 text-sm leading-6">{{ msg.text }}</p>
                <p class="mt-1 font-mono text-[10px]" :class="msg.self ? 'text-white/75' : 'text-stone-500'">{{ msg.time
                  }}</p>
              </div>
            </div>
          </div>

          <form class="flex gap-2 border-t border-stone-200 p-4" @submit.prevent="send">
            <input v-model="draft"
              class="flex-1 rounded-full border border-stone-300 px-4 py-2 text-sm outline-none focus:border-[#d52b1e]"
              placeholder="Ask the community anything...">
            <button
              class="grid h-9 w-9 place-items-center rounded-full bg-[#d52b1e] text-white transition hover:bg-[#a82018]"
              type="submit">↑</button>
          </form>
        </article>
      </div>
    </section>
  </div>
</template>
