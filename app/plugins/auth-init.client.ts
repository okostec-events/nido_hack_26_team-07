export default defineNuxtPlugin(async () => {
  const { hydrateSession } = useAuth();
  await hydrateSession();
});
