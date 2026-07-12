import type { FormEvent } from 'react'
import { getProfession, professions } from '../../domain/professions'
import type { ForecastFormValues, ZodiacSign } from '../../domain/types'
import type { FormErrors } from '../../domain/validation'

interface ForecastFormProps {
  values: ForecastFormValues
  errors: FormErrors
  zodiacSign?: ZodiacSign
  isLoading: boolean
  onChange: (field: keyof ForecastFormValues, value: string) => void
  onSubmit: () => void
}

export function ForecastForm({ values, errors, zodiacSign, isLoading, onChange, onSubmit }: ForecastFormProps) {
  const selectedProfession = getProfession(values.professionId)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="forecast-form" noValidate onSubmit={submit} aria-describedby="form-note">
      <div className="field-group">
        <label htmlFor="profession">Профессия</label>
        <select
          id="profession"
          value={values.professionId}
          onChange={(event) => onChange('professionId', event.target.value)}
          aria-invalid={Boolean(errors.professionId)}
          aria-describedby={errors.professionId ? 'profession-error' : undefined}
        >
          <option value="">Выберите профессию</option>
          {professions.map((profession) => <option key={profession.id} value={profession.id}>{profession.name}</option>)}
        </select>
        {errors.professionId && <p id="profession-error" className="field-error">{errors.professionId}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="birth-date">Дата рождения</label>
        <input
          id="birth-date"
          type="date"
          value={values.birthDate}
          onChange={(event) => onChange('birthDate', event.target.value)}
          aria-invalid={Boolean(errors.birthDate)}
          aria-describedby={errors.birthDate ? 'birth-date-error' : 'zodiac-status'}
        />
        {errors.birthDate && <p id="birth-date-error" className="field-error">{errors.birthDate}</p>}
        {!errors.birthDate && zodiacSign && (
          <p id="zodiac-status" className="zodiac-status">Ваш знак: <strong>{zodiacSign}</strong></p>
        )}
      </div>

      <div className="field-group">
        <label htmlFor="forecast-date">Дата прогноза</label>
        <input
          id="forecast-date"
          type="date"
          value={values.forecastDate}
          onChange={(event) => onChange('forecastDate', event.target.value)}
          aria-invalid={Boolean(errors.forecastDate)}
          aria-describedby={errors.forecastDate ? 'forecast-date-error' : undefined}
        />
        {errors.forecastDate && <p id="forecast-date-error" className="field-error">{errors.forecastDate}</p>}
      </div>

      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? 'Сверяем звёзды и логи…' : 'Узнать прогноз'}
      </button>
      <p id="form-note" className="form-note">
        Дата рождения нужна только для вычисления знака и не отправляется модели.
        {selectedProfession ? ` Контекст: ${selectedProfession.promptContext}.` : ''}
      </p>
    </form>
  )
}
