export type AuthUser = {
  id: string;
  email: string;
  name: string;
  arrivalMonth: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  arrivalMonth: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  user: AuthUser;
};

export const useAuth = () => {
  const user = useState<AuthUser | null>("auth-user", () => null);
  const loading = useState<boolean>("auth-loading", () => false);
  const hydrated = useState<boolean>("auth-hydrated", () => false);

  const isAuthenticated = computed(() => user.value !== null);

  const hydrateSession = async () => {
    if (hydrated.value || loading.value) {
      return;
    }

    loading.value = true;
    try {
      const response = await $fetch<{ user: AuthUser | null }>("/api/auth/me");
      user.value = response.user;
    } catch {
      user.value = null;
    } finally {
      hydrated.value = true;
      loading.value = false;
    }
  };

  const login = async (payload: LoginPayload) => {
    loading.value = true;
    try {
      const response = await $fetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: payload,
      });
      user.value = response.user;
      hydrated.value = true;
      return response.user;
    } finally {
      loading.value = false;
    }
  };

  const register = async (payload: RegisterPayload) => {
    loading.value = true;
    try {
      const response = await $fetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: payload,
      });
      user.value = response.user;
      hydrated.value = true;
      return response.user;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
      });
      user.value = null;
      hydrated.value = true;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    hydrated,
    isAuthenticated,
    hydrateSession,
    login,
    register,
    logout,
  };
};
