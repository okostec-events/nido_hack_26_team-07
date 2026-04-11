export const useUserData = () => {
  const checklistIndexes = useState<Set<number>>(
    "user-checklist-indexes",
    () => new Set<number>(),
  );
  const favoriteListingIds = useState<Set<string>>(
    "user-favorite-listing-ids",
    () => new Set<string>(),
  );

  const checklistLoaded = useState<boolean>(
    "user-checklist-loaded",
    () => false,
  );
  const favoritesLoaded = useState<boolean>(
    "user-favorites-loaded",
    () => false,
  );

  const { isAuthenticated } = useAuth();

  const loadChecklist = async () => {
    if (!isAuthenticated.value) {
      checklistIndexes.value = new Set<number>();
      checklistLoaded.value = true;
      return;
    }

    const response = await $fetch<{ completedIndexes: number[] }>(
      "/api/user/checklist",
    );
    checklistIndexes.value = new Set(response.completedIndexes);
    checklistLoaded.value = true;
  };

  const setChecklistItem = async (itemIndex: number, done: boolean) => {
    await $fetch("/api/user/checklist", {
      method: "POST",
      body: {
        itemIndex,
        done,
      },
    });

    const next = new Set(checklistIndexes.value);
    if (done) {
      next.add(itemIndex);
    } else {
      next.delete(itemIndex);
    }
    checklistIndexes.value = next;
  };

  const loadFavorites = async () => {
    if (!isAuthenticated.value) {
      favoriteListingIds.value = new Set<string>();
      favoritesLoaded.value = true;
      return;
    }

    const response = await $fetch<{ listingIds: string[] }>(
      "/api/user/favorites",
    );
    favoriteListingIds.value = new Set(response.listingIds);
    favoritesLoaded.value = true;
  };

  const setFavorite = async (listingId: string, saved: boolean) => {
    await $fetch("/api/user/favorites", {
      method: "POST",
      body: {
        listingId,
        saved,
      },
    });

    const next = new Set(favoriteListingIds.value);
    if (saved) {
      next.add(listingId);
    } else {
      next.delete(listingId);
    }
    favoriteListingIds.value = next;
  };

  return {
    checklistIndexes,
    favoriteListingIds,
    checklistLoaded,
    favoritesLoaded,
    loadChecklist,
    setChecklistItem,
    loadFavorites,
    setFavorite,
  };
};
