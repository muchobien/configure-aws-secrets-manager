import {getInput} from '@actions/core'

export type Exporters = 'env' | 'output' | 'file'

export class Input {
  get secretId(): string {
    const input = getInput('secret-id')

    if (input === '') {
      throw new Error(`Missing secretId`)
    }

    return input
  }

  get versionId(): string | undefined {
    const input = getInput('version-id')

    return input === '' ? undefined : input
  }

  get stage(): string | undefined {
    const input = getInput('includes')
    return input === '' ? undefined : input
  }

  get overrides(): boolean {
    return getInput('overrides') === 'true'
  }

  get exporters(): Exporters[] {
    const input = getInput('exporters')
    return input === '' ? [] : (input.split(',') as Exporters[])
  }

  get filePath(): string | undefined {
    const input = getInput('file-path')

    return input === '' ? undefined : input
  }
}
