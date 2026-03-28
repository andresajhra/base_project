import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health.service";
import { queryKeys } from "@/lib/queryKeys";

export function useHealthStatus() {
  return useQuery({
    queryKey: queryKeys.health.status(),
    queryFn: healthService.getHealth,
  });
}