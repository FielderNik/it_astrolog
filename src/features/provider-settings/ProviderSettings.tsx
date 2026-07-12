import { useEffect, useState } from 'react'
import type { AiProvider, AiProviderSettings, ProviderStatus } from '../../llm/types'

interface ProviderSettingsProps {
  settings: AiProviderSettings
  onSave: (settings: AiProviderSettings) => void
  createProvider: (settings: AiProviderSettings) => AiProvider
  onClose: () => void
}

export function ProviderSettings({ settings, onSave, createProvider, onClose }: ProviderSettingsProps) {
  const [draft, setDraft] = useState(settings)
  const [cloudKey, setCloudKey] = useState('')
  const [status, setStatus] = useState<ProviderStatus>({ available: false, message: 'Проверяем доступность…' })

  useEffect(() => {
    let cancelled = false
    setStatus({ available: false, message: 'Проверяем доступность…' })
    void createProvider(draft).healthCheck().then((nextStatus) => {
      if (!cancelled) setStatus(nextStatus)
    })
    return () => { cancelled = true }
  }, [draft, createProvider])

  function update<K extends keyof AiProviderSettings>(key: K, value: AiProviderSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function save() {
    onSave(draft)
    onClose()
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">СЛУЖЕБНЫЙ БЛОК</p>
            <h2 id="settings-title">Настройки модели</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Закрыть настройки">×</button>
        </div>

        <div className="field-group">
          <label htmlFor="provider">Провайдер</label>
          <select id="provider" value={draft.provider} onChange={(event) => update('provider', event.target.value as AiProviderSettings['provider'])}>
            <option value="ollama">Ollama (локально)</option>
            <option value="cloud">Облачный провайдер (заготовка)</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="base-url">Base URL</label>
          <input id="base-url" type="url" value={draft.baseUrl} onChange={(event) => update('baseUrl', event.target.value)} disabled={draft.provider === 'cloud'} />
        </div>
        <div className="field-group">
          <label htmlFor="model">Модель</label>
          <input id="model" value={draft.model} onChange={(event) => update('model', event.target.value)} />
        </div>
        {draft.provider === 'cloud' && (
          <div className="field-group">
            <label htmlFor="cloud-key">Ключ API (только память вкладки)</label>
            <input id="cloud-key" type="password" autoComplete="off" value={cloudKey} onChange={(event) => setCloudKey(event.target.value)} />
            <p className="form-note">Демонстрационная заготовка: ключ не сохраняется, а облачный запрос пока не реализован.</p>
          </div>
        )}
        <p className={`provider-status ${status.available ? 'is-available' : ''}`} role="status">{status.message}</p>
        <div className="dialog-actions">
          <button className="text-button" type="button" onClick={onClose}>Отмена</button>
          <button className="primary-button" type="button" onClick={save}>Сохранить</button>
        </div>
      </section>
    </div>
  )
}
