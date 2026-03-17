import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { loginService, type LoginCredentials } from "@/services/authService";

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setAuth,
    logout: storeLogout,
    isAuthenticated,
    user,
    permissions,
    can,
    canAny,
    canAll,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // loginService decide internamente si usa mock o API real
      const payload = await loginService(credentials);
      setAuth(payload);

      const from =
        (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as { message?: string })?.message ??
        "Error al iniciar sesión";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    navigate("/login", { replace: true });
  };

  return {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    error,
    can,
    canAny,
    canAll,
    login,
    logout,
  };
}