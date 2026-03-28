import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { HealthResponse } from "@/types/health.types";

export const healthService = {
  getHealth: async (): Promise<HealthResponse> => {
    const { data } = await api.get<ApiResponse<HealthResponse>>("/health");
    return data.data;
  },
};