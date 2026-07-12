import { getProfession } from './professions'
import type { ForecastRequest } from './types'

export function buildForecastPrompt(request: ForecastRequest): string {
  const profession = getProfession(request.professionId)
  if (!profession) throw new Error('Неизвестная профессия.')

  return [
    'Ты пишешь добрые, ироничные IT-прогнозы на русском языке.',
    'Создай ровно 2–4 коротких предложения. Упомяни профессию, знак и дату, один возможный успех и один комичный рабочий риск.',
    'Не давай медицинских, финансовых, юридических, кадровых или иных профессиональных советов. Не обещай будущего категорично и не оскорбляй человека.',
    '',
    `Профессия: ${profession.name}`,
    `Рабочий контекст: ${profession.promptContext}`,
    `Знак зодиака: ${request.zodiacSign}`,
    `Дата прогноза: ${request.forecastDate}`,
  ].join('\n')
}
