import type { Forecast, ForecastRequest } from '../domain/types'
import { ProviderError, type AiProvider, type ProviderStatus } from './types'

/** Контракт готов к облачному адаптеру, но в статическом приложении секреты не хранятся. */
export class CloudProvider implements AiProvider {
  async healthCheck(): Promise<ProviderStatus> {
    return { available: false, message: 'Облачный режим появится после подключения безопасного серверного прокси.' }
  }

  async generateForecast(_request: ForecastRequest): Promise<Forecast> {
    throw new ProviderError('Облачный режим пока не подключён. Выберите Ollama для локальной генерации.')
  }
}
