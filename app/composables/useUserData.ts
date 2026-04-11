export type ExternalLink = {
  label: string;
  url: string;
};

export type RoadmapStepStatus =
  | "blocked"
  | "pending"
  | "in-progress"
  | "completed";

export type RoadmapStep = {
  id: string;
  title: string;
  category: string;
  goal: string;
  requirements: string[];
  explanation: string;
  externalLinks: ExternalLink[];
  dependencyIds: string[];
  warning: string | null;
  order: number;
  status: RoadmapStepStatus;
  completedAt: string | null;
};

export type OnboardingInput = {
  countryOfOrigin: string;
  immigrationStatus: string;
  primaryGoal: string;
  timelineWeeks: number;
  needsHousing: boolean;
  needsPaperwork: boolean;
  needsBookings: boolean;
  situationDescription: string;
};

export type RoadmapSummary = {
  total: number;
  completed: number;
  remaining: number;
};

export type RoadmapWarning = {
  stepId: string;
  title: string;
  blocked: boolean;
  missingDependencies: string[];
  warning: string | null;
};

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

  const onboarding = useState<OnboardingInput | null>(
    "user-onboarding",
    () => null,
  );

  const roadmapSteps = useState<RoadmapStep[]>("user-roadmap-steps", () => []);

  const roadmapSummary = useState<RoadmapSummary | null>(
    "user-roadmap-summary",
    () => null,
  );

  const roadmapWarnings = useState<RoadmapWarning[]>(
    "user-roadmap-warnings",
    () => [],
  );

  const roadmapLoading = useState<boolean>("user-roadmap-loading", () => false);
  const roadmapChecksLoading = useState<boolean>(
    "user-roadmap-checks-loading",
    () => false,
  );
  const roadmapStepUpdatingIds = useState<Set<string>>(
    "user-roadmap-step-updating-ids",
    () => new Set<string>(),
  );

  const hasRoadmap = computed(
    () =>
      (roadmapSummary.value?.total ?? 0) > 0 || roadmapSteps.value.length > 0,
  );

  const onboardingSaving = useState<boolean>(
    "user-onboarding-saving",
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

  const submitOnboarding = async (payload: OnboardingInput) => {
    onboardingSaving.value = true;
    try {
      const response = await $fetch<{
        onboarding: OnboardingInput;
        steps: RoadmapStep[];
      }>("/api/user/onboarding", {
        method: "POST",
        body: payload,
      });

      onboarding.value = response.onboarding;
      roadmapSteps.value = response.steps;
      roadmapSummary.value = {
        total: response.steps.length,
        completed: response.steps.filter((step) => step.status === "completed")
          .length,
        remaining: response.steps.filter((step) => step.status !== "completed")
          .length,
      };
      return response;
    } finally {
      onboardingSaving.value = false;
    }
  };

  const loadRoadmap = async () => {
    roadmapLoading.value = true;
    try {
      const response = await $fetch<{
        onboarding: OnboardingInput | null;
        steps: RoadmapStep[];
        summary: RoadmapSummary;
      }>("/api/user/roadmap");

      onboarding.value = response.onboarding;
      roadmapSteps.value = response.steps;
      roadmapSummary.value = response.summary;
      return response;
    } finally {
      roadmapLoading.value = false;
    }
  };

  const updateRoadmapStep = async (
    stepId: string,
    status: Extract<RoadmapStepStatus, "pending" | "completed">,
  ) => {
    const nextUpdatingIds = new Set(roadmapStepUpdatingIds.value);
    nextUpdatingIds.add(stepId);
    roadmapStepUpdatingIds.value = nextUpdatingIds;

    try {
      const response = await $fetch<{
        step: RoadmapStep | null;
        nextPendingStepIds: string[];
      }>(`/api/user/roadmap/${encodeURIComponent(stepId)}`, {
        method: "POST",
        body: { status },
      });

      await loadRoadmap();
      return response;
    } finally {
      const cleanupIds = new Set(roadmapStepUpdatingIds.value);
      cleanupIds.delete(stepId);
      roadmapStepUpdatingIds.value = cleanupIds;
    }
  };

  const loadRoadmapChecks = async (stepId?: string) => {
    roadmapChecksLoading.value = true;
    try {
      const query = stepId ? `?stepId=${encodeURIComponent(stepId)}` : "";
      const response = await $fetch<{ warnings: RoadmapWarning[] }>(
        `/api/user/roadmap/checks${query}`,
      );
      roadmapWarnings.value = response.warnings;
      return response;
    } finally {
      roadmapChecksLoading.value = false;
    }
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
    onboarding,
    roadmapSteps,
    roadmapSummary,
    roadmapWarnings,
    roadmapLoading,
    roadmapChecksLoading,
    roadmapStepUpdatingIds,
    hasRoadmap,
    onboardingSaving,
    submitOnboarding,
    loadRoadmap,
    updateRoadmapStep,
    loadRoadmapChecks,
  };
};
