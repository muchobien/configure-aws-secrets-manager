import {
  setFailed,
  setOutput,
  exportVariable,
  setSecret,
  debug
} from '@actions/core'
import {writeFile} from 'node:fs/promises'
import type {Exporters} from './input'

export class Output {
  debug = debug

  failed(message: string | Error): void {
    setFailed(message)
  }

  set(key: string, value: unknown): void {
    setOutput(key, value)
  }

  async export({
    secrets,
    filePath,
    overrides,
    exporters = ['env']
  }: {
    secrets: Record<string, string>
    exporters?: Exporters[]
    overrides: boolean
    filePath?: string
  }): Promise<void> {
    for (const value of Object.values(secrets)) {
      setSecret(value)
    }

    for (const exporter of exporters) {
      switch (exporter) {
        case 'env':
          this.envExport(secrets, overrides)
          break
        case 'output':
          this.outputExport(secrets)
          break
        case 'file':
          await this.fileExport(secrets, filePath)
          break
        default:
          throw new Error(`Unknown exporter: ${exporter}`)
      }
    }
  }

  private envExport(secrets: Record<string, string>, overrides: boolean): void {
    for (const [key, value] of Object.entries(secrets)) {
      if (overrides || !process.env[key]) {
        exportVariable(key, value)
      }
    }
  }

  private outputExport(secrets: Record<string, string>): void {
    for (const [key, value] of Object.entries(secrets)) {
      this.set(key, value)
    }
  }

  private async fileExport(
    secrets: Record<string, string>,
    file = './.env'
  ): Promise<void> {
    const data = Object.entries(secrets)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    await writeFile(file, data, 'utf8')
  }
}
