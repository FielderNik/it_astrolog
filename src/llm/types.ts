import type { Forecast, ForecastRequest } from '../domain/types'

export type ProviderKind = 'ollama' | 'cloud'

export interface AiProviderSettings {
  provider: ProviderKind
  baseUrl: string
  model: string
}

export interface ProviderStatus {
  available: boolean
  message: string
}

export interface AiProvider {
  generateForecast(request: ForecastRequest): Promise<Forecast>
  healthCheck(): Promise<ProviderStatus>
}

export class ProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProviderError'
  }
}
