import { describe, expect, it } from 'vitest'
import { buildForecastPrompt } from '../src/domain/prompt'
import { validateForecastForm } from '../src/domain/validation'

describe('validateForecastForm', () => {
  it('сообщает об обязательных и некорректных полях', () => {
    expect(validateForecastForm({ professionId: '', birthDate: '2025-02-29', forecastDate: '' })).toEqual({
      professionId: 'Выберите IT-профессию.',
      birthDate: 'Укажите корректную дату рождения.',
      forecastDate: 'Укажите дату, на которую нужен прогноз.',
    })
  })

  it('принимает заполненную форму', () => {
    expect(validateForecastForm({ professionId: 'qa', birthDate: '1997-04-14', forecastDate: '2026-07-12' })).toEqual({})
  })
})

describe('buildForecastPrompt', () => {
  it('передаёт модели знак, дату и контекст роли, без даты рождения', () => {
    const prompt = buildForecastPrompt({ professionId: 'devops', zodiacSign: 'Овен', forecastDate: '2026-07-12' })
    expect(prompt).toContain('DevOps-инженер')
    expect(prompt).toContain('Овен')
    expect(prompt).toContain('2026-07-12')
    expect(prompt).not.toContain('1997')
  })
})
