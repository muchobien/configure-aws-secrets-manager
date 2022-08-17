import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import type {Input} from './input'
import type {Output} from './output'

export const action = async (input: Input, output: Output): Promise<void> => {
  const {secretId, versionId, stage, exporters, overrides, filePath} = input

  // Used for testing
  const endpoint = process.env['AWS_SECRETS_MANAGER_ENDPOINT_URL']
  output.debug('Initializing Secrets Manager client')
  output.debug(`AWS endpoint override: ${endpoint}`)

  const client = new SecretsManagerClient({endpoint})

  output.debug('Retrieving secret')
  const {SecretString, SecretBinary} = await client.send(
    new GetSecretValueCommand({
      SecretId: secretId,
      VersionId: versionId,
      VersionStage: stage
    })
  )

  output.debug('Parsing secret')
  const jsonString = SecretBinary
    ? Buffer.from(
        SecretBinary.buffer,
        SecretBinary.byteOffset,
        SecretBinary.buffer.byteLength
      ).toString('utf8')
    : SecretString

  if (!jsonString) {
    output.debug('No secrets found')
    throw new Error(`Secret ${secretId} is empty`)
  }

  const secrets = JSON.parse(jsonString) as Record<string, string>
  output.debug(`Found ${Object.keys(secrets).length} secrets`)
  await output.export({secrets, exporters, overrides, filePath})
}
