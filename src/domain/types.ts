export type ProfessionId =
  | 'frontend'
  | 'backend'
  | 'qa'
  | 'devops'
  | 'data-analyst'
  | 'ux-ui-designer'
  | 'product-manager'
  | 'sysadmin'

export type ZodiacSign =
  | 'Овен'
  | 'Телец'
  | 'Близнецы'
  | 'Рак'
  | 'Лев'
  | 'Дева'
  | 'Весы'
  | 'Скорпион'
  | 'Стрелец'
  | 'Козерог'
  | 'Водолей'
  | 'Рыбы'

export interface ForecastRequest {
  professionId: ProfessionId
  zodiacSign: ZodiacSign
  forecastDate: string
}

export interface Forecast {
  text: string
  model: string
  generatedAt: string
}

export interface ForecastFormValues {
  professionId: string
  birthDate: string
  forecastDate: string
}
