<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'GettingThereWasmPage',
});

type WasmModule = typeof import('~~/wasm/pkg/wasm_getting_there_wasm.js');
const distanceKm = ref(14.2);
const speedKmh = ref(27);
const elevationGainM = ref(340);
const trafficEvents = ref(3);
const weatherIndex = ref(1.4);

const wasmReady = ref(false);
const wasmError = ref('');
const etaMinutes = ref(0);
const routeScore = ref(0);

let wasmModule: WasmModule | null = null;

const etaLabel = computed(() => {
  if (!Number.isFinite(etaMinutes.value)) {
    return 'Speed must be greater than 0 km/h';
  }

  return `${etaMinutes.value.toFixed(1)} min`;
});

const routeLabel = computed(() => `${routeScore.value.toFixed(1)} pts`);

const recalculate = () => {
  if (!wasmModule) {
    return;
  }

  etaMinutes.value = wasmModule.estimate_arrival_minutes(distanceKm.value, speedKmh.value);
  routeScore.value = wasmModule.route_difficulty_score(
    Math.max(0, Math.round(elevationGainM.value)),
    Math.max(0, Math.round(trafficEvents.value)),
    Math.max(0, weatherIndex.value),
  );
};

watch([distanceKm, speedKmh, elevationGainM, trafficEvents, weatherIndex], recalculate);

onMounted(async () => {
  try {
    const wasm = await import('~~/wasm/pkg/wasm_getting_there_wasm.js');
    await wasm.default();
    wasmModule = wasm;
    wasmReady.value = true;
    recalculate();
  } catch (error: unknown) {
    wasmError.value = error instanceof Error
      ? error.message
      : 'Failed to load WASM module. Run: bun wasm:build';
  }
});
</script>

<template>
  <main
    class="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.8),transparent_40%),linear-gradient(160deg,#f5f0e8,#d9f0f4)] px-4 py-8 text-[#1f2a3a] antialiased font-['Space_Grotesk','Avenir_Next','Segoe_UI',sans-serif]">
    <section
      class="w-full max-w-210 rounded-[22px] border border-[#0a7f6f]/15 bg-white/80 p-6 shadow-[0_20px_80px_rgba(34,42,55,0.12)] backdrop-blur-[6px] ring-1 ring-black/5">
      <p class="m-0 text-xs font-bold tracking-[0.08em] text-[#0a7f6f] uppercase">Nido Hack '26</p>
      <h1 class="mt-1 mb-2 text-balance text-[clamp(1.6rem,2.5vw,2.2rem)] font-semibold">Getting There, powered by Rust
        WASM</h1>
      <p class="mb-5">
        This demo calls Rust functions compiled with wasm-pack and updates travel estimates in real time.
      </p>

      <div v-if="!wasmReady && !wasmError" class="mb-4 rounded-[10px] bg-[#daf8f2] px-3 py-3">
        Loading WASM module...
      </div>
      <div v-else-if="wasmError" class="mb-4 rounded-[10px] bg-[#fbe9e9] px-3 py-3 text-[#9d2a2a]">
        {{ wasmError }}
      </div>

      <div v-else class="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <label class="grid gap-1.5 font-semibold">
          Distance (km)
          <input v-model.number="distanceKm" class="rounded-[10px] border border-[#b8c8d3] px-3 py-2.5" type="number"
            min="0" step="0.1">
        </label>

        <label class="grid gap-1.5 font-semibold">
          Average Speed (km/h)
          <input v-model.number="speedKmh" class="rounded-[10px] border border-[#b8c8d3] px-3 py-2.5" type="number"
            min="0" step="0.1">
        </label>

        <label class="grid gap-1.5 font-semibold">
          Elevation Gain (m)
          <input v-model.number="elevationGainM" class="rounded-[10px] border border-[#b8c8d3] px-3 py-2.5"
            type="number" min="0" step="1">
        </label>

        <label class="grid gap-1.5 font-semibold">
          Traffic Events
          <input v-model.number="trafficEvents" class="rounded-[10px] border border-[#b8c8d3] px-3 py-2.5" type="number"
            min="0" step="1">
        </label>

        <label class="grid gap-1.5 font-semibold">
          Weather Index
          <input v-model.number="weatherIndex" class="rounded-[10px] border border-[#b8c8d3] px-3 py-2.5" type="number"
            min="0" step="0.1">
        </label>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article class="rounded-xl bg-[#0a7f6f]/10 p-4">
          <h2 class="m-0 text-xs tracking-[0.06em] uppercase">Estimated Arrival</h2>
          <p class="mt-1 text-[1.35rem] font-bold tabular-nums">{{ etaLabel }}</p>
        </article>

        <article class="rounded-xl bg-[#0a7f6f]/10 p-4">
          <h2 class="m-0 text-xs tracking-[0.06em] uppercase">Route Difficulty</h2>
          <p class="mt-1 text-[1.35rem] font-bold tabular-nums">{{ routeLabel }}</p>
        </article>
      </div>
    </section>
  </main>
</template>
