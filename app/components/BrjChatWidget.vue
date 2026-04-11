<script setup lang="ts">
interface Message {
  role: "user" | "assistant";
  content: string;
}

const isOpen = ref(false);
const messages = ref<Message[]>([]);
const input = ref("");
const loading = ref(false);
const messagesEl = ref<HTMLElement | null>(null);
const textareaEl = ref<HTMLTextAreaElement | null>(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
};

const autoResize = () => {
  const el = textareaEl.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 112) + "px";
};

const sendMessage = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: "user", content: text });
  input.value = "";
  await nextTick();
  autoResize();
  loading.value = true;
  await scrollToBottom();

  try {
    const { reply } = await $fetch<{ reply: string }>("/api/chat", {
      method: "POST",
      body: { messages: messages.value },
    });
    messages.value.push({ role: "assistant", content: reply });
  } catch {
    messages.value.push({
      role: "assistant",
      content: "Sorry, something went wrong. Please try again.",
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <!-- Chat panel -->
    <Transition name="chat">
      <div
        v-if="isOpen"
        class="flex flex-col overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-2xl"
        style="width: 22rem; height: 32rem; max-height: calc(100dvh - 6rem)"
      >
        <!-- Header -->
        <div class="flex shrink-0 items-center gap-3 bg-[#d52b1e] px-4 py-3">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20"
          >
            <Icon name="heroicons:map-pin" class="h-4 w-4 text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-none text-white">
              Brújula Assistant
            </p>
            <p class="mt-0.5 text-xs text-white/70">
              Ask me about immigrating to Chile
            </p>
          </div>
          <button
            class="text-white/70 transition-colors hover:text-white"
            aria-label="Close chat"
            @click="toggleChat"
          >
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>

        <!-- Messages -->
        <div
          ref="messagesEl"
          class="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
          <!-- Empty state -->
          <div
            v-if="messages.length === 0"
            class="flex h-full flex-col items-center justify-center px-4 text-center"
          >
            <div
              class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#d52b1e]/10"
            >
              <Icon
                name="heroicons:globe-americas"
                class="h-6 w-6 text-[#d52b1e]"
              />
            </div>
            <p class="mb-1 text-sm font-medium text-[#1a1614]">
              Your Chile Immigration Guide
            </p>
            <p class="text-xs leading-relaxed text-[#6b5e57]">
              Ask me anything about visas, housing, paperwork, healthcare, and
              daily life in Chile.
            </p>
          </div>

          <!-- Message list -->
          <template v-for="(msg, i) in messages" :key="i">
            <div
              :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <div
                :class="[
                  'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-[#d52b1e] text-white'
                    : 'rounded-tl-sm border border-[#e8e4df] bg-[#f4f1ee] text-[#1a1614]',
                ]"
                style="white-space: pre-wrap; word-break: break-word"
              >
                {{ msg.content }}
              </div>
            </div>
          </template>

          <!-- Loading dots -->
          <div v-if="loading" class="flex justify-start">
            <div
              class="rounded-2xl rounded-tl-sm border border-[#e8e4df] bg-[#f4f1ee] px-4 py-3"
            >
              <div class="flex items-center gap-1">
                <span
                  class="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6b5e57]"
                  style="animation-delay: 0ms"
                />
                <span
                  class="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6b5e57]"
                  style="animation-delay: 150ms"
                />
                <span
                  class="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6b5e57]"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Input area -->
        <div class="shrink-0 border-t border-[#e8e4df] p-3">
          <div class="flex items-end gap-2">
            <textarea
              ref="textareaEl"
              v-model="input"
              rows="1"
              placeholder="Ask about immigrating to Chile…"
              :disabled="loading"
              class="flex-1 resize-none rounded-xl border border-[#e8e4df] bg-[#faf9f6] px-3 py-2 text-sm text-[#1a1614] placeholder:text-[#9e8e86] focus:border-[#d52b1e] focus:outline-none disabled:opacity-50"
              style="max-height: 7rem"
              @keydown="handleKeydown"
              @input="autoResize"
            />
            <button
              :disabled="!input.trim() || loading"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d52b1e] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
              @click="sendMessage"
            >
              <Icon name="heroicons:paper-airplane" class="h-4 w-4" />
            </button>
          </div>
          <p class="mt-1.5 text-center text-xs text-[#9e8e86]">
            Searches the web · Chile topics only
          </p>
        </div>
      </div>
    </Transition>

    <!-- Floating toggle button -->
    <button
      :class="[
        'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
        isOpen ? 'bg-[#1a1614]' : 'bg-[#d52b1e]',
      ]"
      :aria-label="isOpen ? 'Close assistant' : 'Open immigration assistant'"
      @click="toggleChat"
    >
      <Transition name="icon" mode="out-in">
        <Icon
          :key="isOpen ? 'close' : 'open'"
          :name="
            isOpen
              ? 'heroicons:x-mark'
              : 'heroicons:chat-bubble-left-right'
          "
          class="h-6 w-6 text-white"
        />
      </Transition>
    </button>
  </div>
</template>

<style scoped>
.chat-enter-active,
.chat-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: bottom right;
}
.chat-enter-from,
.chat-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}

.icon-enter-active,
.icon-leave-active {
  transition: all 0.15s ease;
}
.icon-enter-from,
.icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
