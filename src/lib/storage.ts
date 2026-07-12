import type { ForecastFormValues } from '../domain/types'
import type { AiProviderSettings } from '../llm/types'

const settingsKey = 'it-astrolog:provider-settings'
const formKey = 'it-astrolog:last-form'

export const defaultProviderSettings: AiProviderSettings = {
  provider: 'ollama',
  baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2',
}

function readJson<T>(key: string): T | undefined {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : undefined
  } catch {
    return undefined
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // У приватного режима браузера localStorage может быть недоступен: сценарий всё равно работает.
  }
}

export function loadProviderSettings(): AiProviderSettings {
  const saved = readJson<Partial<AiProviderSettings>>(settingsKey)
  return {
    provider: saved?.provider === 'cloud' ? 'cloud' : 'ollama',
    baseUrl: typeof saved?.baseUrl === 'string' ? saved.baseUrl : defaultProviderSettings.baseUrl,
    model: typeof saved?.model === 'string' ? saved.model : defaultProviderSettings.model,
  }
}

export const saveProviderSettings = (settings: AiProviderSettings): void => writeJson(settingsKey, settings)

export function loadFormValues(): ForecastFormValues | undefined {
  const saved = readJson<ForecastFormValues>(formKey)
  if (!saved) return undefined
  return typeof saved.professionId === 'string' && typeof saved.birthDate === 'string' && typeof saved.forecastDate === 'string' ? saved : undefined
}

export const saveFormValues = (values: ForecastFormValues): void => writeJson(formKey, values)
