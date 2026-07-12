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

const requestTimeoutMs = 120_000
const localOllamaHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
const sameOriginProxyPath = '/ollama'

export function getOllamaBaseUrl(value: string): string {
  const normalizedValue = value.trim()
  if (normalizedValue === sameOriginProxyPath || normalizedValue === `${sameOriginProxyPath}/`) {
    return sameOriginProxyPath
  }

  let url: URL
  try {
    url = new URL(normalizedValue)
  } catch {
    throw new ProviderError('Укажите корректный URL локальной Ollama.')
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:')
    || !localOllamaHosts.has(url.hostname)
    || url.username
    || url.password
    || url.pathname !== '/'
    || url.search
    || url.hash
  ) {
    throw new ProviderError('Для Ollama разрешён только URL локального сервера или прокси /ollama на этом сайте.')
  }

  return url.origin
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted) throw new ProviderError(`Ollama не ответила за ${requestTimeoutMs / 1_000} секунд. Проверьте, что она запущена и не занята.`)
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export class OllamaProvider implements AiProvider {
  constructor(private readonly settings: AiProviderSettings) {}

  async healthCheck(): Promise<ProviderStatus> {
    try {
      const response = await fetchWithTimeout(`${getOllamaBaseUrl(this.settings.baseUrl)}/api/tags`)
      if (!response.ok) return { available: false, message: 'Ollama ответила с ошибкой.' }
      const payload = await response.json() as OllamaTagsResponse
      const hasModel = payload.models?.some((model) => model.name === this.settings.model || model.name?.startsWith(`${this.settings.model}:`))
      return hasModel
        ? { available: true, message: 'Ollama и выбранная модель доступны.' }
        : { available: false, message: `Модель «${this.settings.model}» не найдена. Выполните: ollama pull ${this.settings.model}` }
    } catch (error) {
      if (error instanceof ProviderError) return { available: false, message: error.message }
      return { available: false, message: 'Ollama недоступна. Запустите приложение Ollama и проверьте URL.' }
    }
  }

  async generateForecast(request: ForecastRequest): Promise<Forecast> {
    let response: Response
    try {
      response = await fetchWithTimeout(`${getOllamaBaseUrl(this.settings.baseUrl)}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.settings.model, prompt: buildForecastPrompt(request), stream: false }),
      })
    } catch (error) {
      if (error instanceof ProviderError) throw error
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
