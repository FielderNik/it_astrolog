import { describe, expect, it } from 'vitest'
import { getOllamaBaseUrl } from '../src/llm/ollama-provider'

describe('getOllamaBaseUrl', () => {
  it('принимает URL локального Ollama и нормализует завершающий слеш', () => {
    expect(getOllamaBaseUrl(' http://localhost:11434/ ')).toBe('http://localhost:11434')
    expect(getOllamaBaseUrl('https://127.0.0.1:11435')).toBe('https://127.0.0.1:11435')
    expect(getOllamaBaseUrl('http://[::1]:11434')).toBe('http://[::1]:11434')
  })

  it('принимает same-origin прокси Ollama', () => {
    expect(getOllamaBaseUrl('/ollama')).toBe('/ollama')
    expect(getOllamaBaseUrl('/ollama/')).toBe('/ollama')
  })

  it.each([
    'https://ollama.example',
    'http://192.168.1.10:11434',
    'http://localhost:11434/api',
    '/другой-путь',
    'http://user:password@localhost:11434',
    'not a url',
  ])('отклоняет небезопасный адрес %s', (url) => {
    expect(() => getOllamaBaseUrl(url)).toThrow()
  })
})
