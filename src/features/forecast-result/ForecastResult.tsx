import type { Forecast } from '../../domain/types'
import type { ProviderKind } from '../../llm/types'

interface ForecastResultProps {
  forecast?: Forecast
  professionName?: string
  zodiacSign?: string
  isLoading: boolean
  error?: string
  provider: ProviderKind
  onRetry: () => void
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function ForecastResult({ forecast, professionName, zodiacSign, isLoading, error, provider, onRetry }: ForecastResultProps) {
  return (
    <section className="forecast-result" aria-labelledby="forecast-heading" aria-live="polite">
      <div className="result-line" aria-hidden="true" />
      <h2 id="forecast-heading">Смена у звёзд</h2>

      {isLoading && (
        <div className="result-loading" role="status">
          <span className="loading-dots" aria-hidden="true"><i /><i /><i /></span>
          Модель собирает прогноз…
        </div>
      )}

      {!isLoading && error && (
        <div className="result-error" role="alert">
          <h3>Не удалось достучаться до звёздной модели</h3>
          <p>{error}</p>
          {provider === 'ollama' && <p>Проверьте, что Ollama запущена и модель установлена командой <code>ollama pull</code>.</p>}
          <button className="text-button" type="button" onClick={onRetry}>Повторить запрос</button>
        </div>
      )}

      {!isLoading && !error && forecast && (
        <article className="forecast-copy">
          <p className="forecast-tag">{professionName} · {zodiacSign}</p>
          <p className="forecast-text">{forecast.text}</p>
          <p className="forecast-meta">Создано {formatDate(forecast.generatedAt)} · модель {forecast.model}</p>
          <button className="text-button" type="button" onClick={onRetry}>Спросить ещё раз</button>
        </article>
      )}

      {!isLoading && !error && !forecast && <p className="result-placeholder">Прогноз появится здесь после запроса к модели.</p>}
    </section>
  )
}
