import type { ZodiacSign } from './types'

interface ZodiacBoundary {
  month: number
  day: number
  sign: ZodiacSign
}

const boundaries: readonly ZodiacBoundary[] = [
  { month: 1, day: 20, sign: 'Водолей' },
  { month: 2, day: 19, sign: 'Рыбы' },
  { month: 3, day: 21, sign: 'Овен' },
  { month: 4, day: 20, sign: 'Телец' },
  { month: 5, day: 21, sign: 'Близнецы' },
  { month: 6, day: 21, sign: 'Рак' },
  { month: 7, day: 23, sign: 'Лев' },
  { month: 8, day: 23, sign: 'Дева' },
  { month: 9, day: 23, sign: 'Весы' },
  { month: 10, day: 23, sign: 'Скорпион' },
  { month: 11, day: 22, sign: 'Стрелец' },
  { month: 12, day: 22, sign: 'Козерог' },
]

export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12 || day < 1) return false

  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function getZodiacSign(date: string): ZodiacSign | undefined {
  if (!isValidIsoDate(date)) return undefined

  const [, monthText, dayText] = date.split('-')
  const month = Number(monthText)
  const day = Number(dayText)
  const boundary = [...boundaries].reverse().find(({ month: boundaryMonth, day: boundaryDay }) => (
    month > boundaryMonth || (month === boundaryMonth && day >= boundaryDay)
  ))

  return boundary?.sign ?? 'Козерог'
}
