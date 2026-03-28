export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  uptime: number;
}