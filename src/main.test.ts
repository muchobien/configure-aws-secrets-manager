/* eslint-disable filenames/match-regex */
import * as core from '@actions/core'
import fs from 'node:fs/promises'
import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import {mockClient} from 'aws-sdk-client-mock'
import {run} from './main'

jest.mock('@actions/core')
jest.mock('node:fs/promises', () => {
  return {
    writeFile: jest.fn()
  }
})

const DEFAULT_INPUTS = {
  stage: '',
  overrides: 'false',
  exporters: 'env,output',
  'file-path': ''
}

const SECRETS = {
  SECRET_KEY: 'SECRET_VALUE',
  SECRET_KEY2: 'SECRET_VALUE2'
}

function mockGetInput(requestResponse: {[x: string]: unknown}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (name: string, options: unknown) {
    return requestResponse[name]
  }
}

const smMock = mockClient(SecretsManagerClient)

describe('action', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = {...OLD_ENV}

    jest.clearAllMocks()

    smMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify(SECRETS)
    })

    // @ts-expect-error suppressing this error because we are mocking core.getInput
    core.getInput = jest.fn().mockImplementation(mockGetInput(DEFAULT_INPUTS))
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('should export secrets to env and output', async () => {
    // @ts-expect-error suppressing this error because we are mocking core.getInput
    core.getInput = jest.fn().mockImplementation(
      mockGetInput({
        ...DEFAULT_INPUTS,
        'secret-id': 'SECRET_ID'
      })
    )

    await run()

    //#region EXPECTED OUTPUTS
    expect(core.exportVariable).toHaveBeenCalledTimes(2)
    expect(core.setSecret).toHaveBeenCalledTimes(2)
    expect(core.setOutput).toHaveBeenCalledTimes(2)

    expect(core.exportVariable).toHaveBeenCalledWith(
      'SECRET_KEY',
      SECRETS.SECRET_KEY
    )
    expect(core.exportVariable).toHaveBeenCalledWith(
      'SECRET_KEY2',
      SECRETS.SECRET_KEY2
    )
    expect(core.setSecret).toHaveBeenCalledWith(SECRETS.SECRET_KEY)
    expect(core.setSecret).toHaveBeenCalledWith(SECRETS.SECRET_KEY2)
    expect(core.setOutput).toHaveBeenCalledWith(
      'SECRET_KEY',
      SECRETS.SECRET_KEY
    )
    expect(core.setOutput).toHaveBeenCalledWith(
      'SECRET_KEY2',
      SECRETS.SECRET_KEY2
    )
    //#endregion
  })

  test('should export secrets to .env file', async () => {
    // @ts-expect-error suppressing this error because we are mocking core.getInput
    core.getInput = jest.fn().mockImplementation(
      mockGetInput({
        ...DEFAULT_INPUTS,
        'secret-id': 'SECRET_ID',
        exporters: 'file'
      })
    )

    const fileResult = Object.entries(SECRETS)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const mockWriteFile = (fs.writeFile as jest.Mock).mockImplementation(
      async () => Promise.resolve(fileResult)
    )

    await run()

    //#region EXPECTED OUTPUTS
    expect(core.exportVariable).toHaveBeenCalledTimes(0)
    expect(core.setSecret).toHaveBeenCalledTimes(2)
    expect(core.setOutput).toHaveBeenCalledTimes(0)
    expect(mockWriteFile).toHaveBeenCalledWith('./.env', fileResult, 'utf8')
    //#endregion
  })

  test('should fail on missing secret-id', async () => {
    // @ts-expect-error suppressing this error because we are mocking core.getInput
    core.getInput = jest.fn().mockImplementation(
      mockGetInput({
        ...DEFAULT_INPUTS,
        'secret-id': ''
      })
    )

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Missing secretId')
  })
})
