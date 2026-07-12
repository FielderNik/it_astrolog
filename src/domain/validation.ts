import { getProfession } from './professions'
import type { ForecastFormValues } from './types'
import { isValidIsoDate } from './zodiac'

export type FormErrors = Partial<Record<keyof ForecastFormValues, string>>

export function validateForecastForm(values: ForecastFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!getProfession(values.professionId)) errors.professionId = 'Выберите IT-профессию.'
  if (!isValidIsoDate(values.birthDate)) errors.birthDate = 'Укажите корректную дату рождения.'
  if (!isValidIsoDate(values.forecastDate)) errors.forecastDate = 'Укажите дату, на которую нужен прогноз.'

  return errors
}
