import { useCallback, useMemo, useState } from 'react'
import { ForecastForm } from '../features/forecast-form/ForecastForm'
import { ForecastResult } from '../features/forecast-result/ForecastResult'
import { ProviderSettings } from '../features/provider-settings/ProviderSettings'
import { getProfession } from '../domain/professions'
import type { Forecast, ForecastFormValues } from '../domain/types'
import { getZodiacSign } from '../domain/zodiac'
import { validateForecastForm, type FormErrors } from '../domain/validation'
import { CloudProvider } from '../llm/cloud-provider'
import { OllamaProvider } from '../llm/ollama-provider'
import type { AiProvider, AiProviderSettings } from '../llm/types'
import { loadFormValues, loadProviderSettings, saveFormValues, saveProviderSettings } from '../lib/storage'

const today = new Date().toLocaleDateString('en-CA')
const initialForm: ForecastFormValues = loadFormValues() ?? { professionId: '', birthDate: '', forecastDate: today }

export function App() {
  const [values, setValues] = useState<ForecastFormValues>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [settings, setSettings] = useState<AiProviderSettings>(loadProviderSettings)
  const [forecast, setForecast] = useState<Forecast>()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const zodiacSign = useMemo(() => getZodiacSign(values.birthDate), [values.birthDate])
  const profession = getProfession(values.professionId)

  const createProvider = useCallback((nextSettings: AiProviderSettings): AiProvider => (
    nextSettings.provider === 'ollama' ? new OllamaProvider(nextSettings) : new CloudProvider()
  ), [])

  function changeField(field: keyof ForecastFormValues, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    saveFormValues(nextValues)
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function generate() {
    const nextErrors = validateForecastForm(values)
    const sign = getZodiacSign(values.birthDate)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !sign || !profession) return

    setIsLoading(true)
    setError(undefined)
    setForecast(undefined)
    try {
      const nextForecast = await createProvider(settings).generateForecast({
        professionId: profession.id,
        zodiacSign: sign,
        forecastDate: values.forecastDate,
      })
      setForecast(nextForecast)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Произошла непредвиденная ошибка. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  function saveSettings(nextSettings: AiProviderSettings) {
    setSettings(nextSettings)
    saveProviderSettings(nextSettings)
  }

  return (
    <main className="page-shell">
      <div className="constellation constellation-top" aria-hidden="true"><span /><span /><span /><i /></div>
      <div className="constellation constellation-bottom" aria-hidden="true"><span /><span /><span /><i /></div>
      <header className="site-header">
        <a className="wordmark" href="#top">IT АСТРОЛОГ</a>
        <button className="text-button" type="button" onClick={() => setIsSettingsOpen(true)}>Настройки модели</button>
      </header>

      <div id="top" className="hero-grid">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">ПРОГНОЗ ДЛЯ IT-ШНИКА</p>
          <h1 id="page-title">Твой релиз сегодня под счастливой <em>звездой.</em></h1>
          <p>Выбери роль и даты — локальная модель подскажет, какой рабочий сюжет ждёт твою космическую смену.</p>
        </section>
        <ForecastForm values={values} errors={errors} zodiacSign={zodiacSign} isLoading={isLoading} onChange={changeField} onSubmit={() => void generate()} />
      </div>

      <ForecastResult
        forecast={forecast}
        professionName={profession?.name}
        zodiacSign={zodiacSign}
        isLoading={isLoading}
        error={error}
        provider={settings.provider}
        onRetry={() => void generate()}
      />

      {isSettingsOpen && <ProviderSettings settings={settings} createProvider={createProvider} onSave={saveSettings} onClose={() => setIsSettingsOpen(false)} />}
    </main>
  )
}
