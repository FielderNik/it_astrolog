import { buildForecastPrompt } from '../domain/prompt'
import type { Forecast, ForecastRequest } from '../domain/types'
import { ProviderError, type AiProvider, type AiProviderSettings, type ProviderStatus } from './types'

interface OllamaGenerateResponse {
  response?: unknown
  error?: unknown
}

interface OllamaTagsResponse {
  models?: Array<{ name?: string }>
}

const normalizeBaseUrl = (url: string) => url.trim().replace(/\/$/, '')

export class OllamaProvider implements AiProvider {
  constructor(private readonly settings: AiProviderSettings) {}

  async healthCheck(): Promise<ProviderStatus> {
    try {
      const response = await fetch(`${normalizeBaseUrl(this.settings.baseUrl)}/api/tags`)
      if (!response.ok) return { available: false, message: 'Ollama ответила с ошибкой.' }
      const payload = await response.json() as OllamaTagsResponse
      const hasModel = payload.models?.some((model) => model.name === this.settings.model || model.name?.startsWith(`${this.settings.model}:`))
      return hasModel
        ? { available: true, message: 'Ollama и выбранная модель доступны.' }
        : { available: false, message: `Модель «${this.settings.model}» не найдена. Выполните: ollama pull ${this.settings.model}` }
    } catch {
      return { available: false, message: 'Ollama недоступна. Запустите приложение Ollama и проверьте URL.' }
    }
  }

  async generateForecast(request: ForecastRequest): Promise<Forecast> {
    let response: Response
    try {
      response = await fetch(`${normalizeBaseUrl(this.settings.baseUrl)}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.settings.model, prompt: buildForecastPrompt(request), stream: false }),
      })
    } catch {
      throw new ProviderError('Не удаётся подключиться к Ollama. Убедитесь, что она запущена. При CORS-проблеме добавьте origin dev-сервера в OLLAMA_ORIGINS.')
    }

    const payload = await response.json().catch(() => ({})) as OllamaGenerateResponse
    if (!response.ok) {
      const details = typeof payload.error === 'string' ? payload.error : 'Неизвестная ошибка Ollama.'
      throw new ProviderError(`Ollama не смогла создать прогноз: ${details}`)
    }

    const text = typeof payload.response === 'string' ? payload.response.trim() : ''
    if (!text || text.length > 1_500) throw new ProviderError('Модель вернула пустой или слишком длинный ответ. Попробуйте ещё раз.')

    return { text, model: this.settings.model, generatedAt: new Date().toISOString() }
  }
}
