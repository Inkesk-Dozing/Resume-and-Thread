export interface OllamaHealthStatus {
  available: boolean;
  models: string[];
}

export async function checkOllamaHealth(): Promise<OllamaHealthStatus> {
  return { available: false, models: [] };
}
