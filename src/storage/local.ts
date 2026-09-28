import type { ProgressData } from '../types'
import { migrate, type StorageAdapter } from './adapter'

const KEY = 'adam-deutsch-trainer:progress:v1'

/** Zapis w localStorage przeglądarki (domyślny, działa od razu) */
export class LocalStorageAdapter implements StorageAdapter {
  readonly name = 'local'
  private memory: ProgressData | null = null

  async load(): Promise<ProgressData | null> {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return this.memory
      return migrate(JSON.parse(raw))
    } catch {
      return this.memory
    }
  }

  async save(data: ProgressData): Promise<void> {
    this.memory = data
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      // przepełnienie lub tryb prywatny - zostaje kopia w pamięci
    }
  }

  async clear(): Promise<void> {
    this.memory = null
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }
}
