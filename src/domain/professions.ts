import type { ProfessionId } from './types'

export interface Profession {
  id: ProfessionId
  name: string
  promptContext: string
}

export const professions: readonly Profession[] = [
  { id: 'frontend', name: 'Frontend-разработчик', promptContext: 'компоненты, вёрстка и непредсказуемые браузеры' },
  { id: 'backend', name: 'Backend-разработчик', promptContext: 'API, базы данных и спокойные логи' },
  { id: 'qa', name: 'QA-инженер', promptContext: 'тест-кейсы, регресс и особенно внимательные баг-репорты' },
  { id: 'devops', name: 'DevOps-инженер', promptContext: 'деплои, мониторинг и инфраструктура' },
  { id: 'data-analyst', name: 'Аналитик данных', promptContext: 'метрики, дашборды и выразительные таблицы' },
  { id: 'ux-ui-designer', name: 'UX/UI-дизайнер', promptContext: 'макеты, пользовательские сценарии и пиксели' },
  { id: 'product-manager', name: 'Product manager', promptContext: 'приоритеты, бэклог и синхронизации команды' },
  { id: 'sysadmin', name: 'Системный администратор', promptContext: 'серверы, доступы и своевременные бэкапы' },
]

export function getProfession(id: string): Profession | undefined {
  return professions.find((profession) => profession.id === id)
}
