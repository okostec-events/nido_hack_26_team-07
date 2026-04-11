/**
 * Cycles through a list of loading messages over time.
 * Each stage fires `after` ms after the previous one.
 * Call `start()` when loading begins and `stop()` when it ends.
 */
export const useLoadingMessage = (
  stages: Array<{ text: string; after: number }>,
) => {
  const message = ref(stages[0]?.text ?? "");
  const handles: ReturnType<typeof setTimeout>[] = [];

  const start = () => {
    stop();
    message.value = stages[0]?.text ?? "";
    let elapsed = 0;
    for (let i = 1; i < stages.length; i++) {
      elapsed += stages[i].after;
      const text = stages[i].text;
      handles.push(setTimeout(() => { message.value = text; }, elapsed));
    }
  };

  const stop = () => {
    handles.splice(0).forEach(clearTimeout);
    message.value = stages[0]?.text ?? "";
  };

  onUnmounted(stop);

  return { message: readonly(message), start, stop };
};
